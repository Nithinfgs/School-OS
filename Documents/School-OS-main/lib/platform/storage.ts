import { createSupabaseServerClient } from './supabase-adapter';
import { resolveSupabaseMember } from './supabase-auth';

export type StorageBucket = 'student-documents' | 'admissions-documents' | 'inquiry-attachments';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'txt', 'csv']);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface UploadOptions {
  bucket: StorageBucket;
  entityType: 'student' | 'admission' | 'inquiry' | 'document' | 'general';
  entityId: string;
  filename: string;
  contentType: string;
  data: ArrayBuffer | Buffer | Uint8Array;
  size: number;
}

export function sanitizeExtension(filename: string): string {
  const parts = filename.split('.');
  const ext = (parts.length > 1 ? parts.pop() : '')?.toLowerCase().trim() || 'bin';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(`VALIDATION_ERROR: File extension '.${ext}' is not permitted.`);
  }
  return ext;
}

export function validateFileMetadata(contentType: string, size: number, filename: string) {
  if (size > MAX_FILE_SIZE_BYTES || size <= 0) {
    throw new Error('VALIDATION_ERROR: File size must be between 1 byte and 10 MB.');
  }
  if (!ALLOWED_MIME_TYPES.has(contentType.toLowerCase())) {
    throw new Error(`VALIDATION_ERROR: MIME type '${contentType}' is not allowed.`);
  }
  sanitizeExtension(filename);
}

/**
 * Builds the canonical storage path:
 * <organization-id>/<entity-type>/<entity-id>/<generated-uuid>.<ext>
 */
export function buildStoragePath(
  organizationId: string,
  entityType: string,
  entityId: string,
  extension: string
): string {
  const fileUuid = crypto.randomUUID();
  const safeEntityType = entityType.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, '');
  return `${organizationId}/${safeEntityType}/${safeEntityId}/${fileUuid}.${extension}`;
}

/**
 * Server-side authorized file upload to Supabase Storage.
 */
export async function uploadStorageObject(
  member: { organizationId: string; id: string; role: string },
  options: UploadOptions
) {
  validateFileMetadata(options.contentType, options.size, options.filename);
  const ext = sanitizeExtension(options.filename);
  const storagePath = buildStoragePath(
    member.organizationId,
    options.entityType,
    options.entityId,
    ext
  );

  const client = createSupabaseServerClient();
  const { data, error } = await client.storage
    .from(options.bucket)
    .upload(storagePath, options.data, {
      contentType: options.contentType,
      upsert: false,
    });

  if (error) throw new Error(`STORAGE_ERROR: ${error.message}`);

  return {
    bucket: options.bucket,
    path: storagePath,
    fullPath: data?.fullPath || `${options.bucket}/${storagePath}`,
    filename: options.filename,
    contentType: options.contentType,
    size: options.size,
  };
}

/**
 * Server-side public inquiry upload (controlled path, no anonymous listing allowed).
 */
export async function uploadPublicInquiryAttachment(
  organizationId: string,
  inquiryId: string,
  filename: string,
  contentType: string,
  data: ArrayBuffer | Buffer | Uint8Array,
  size: number
) {
  validateFileMetadata(contentType, size, filename);
  const ext = sanitizeExtension(filename);
  const storagePath = buildStoragePath(organizationId, 'inquiry', inquiryId, ext);

  const client = createSupabaseServerClient();
  const { data: uploadData, error } = await client.storage
    .from('inquiry-attachments')
    .upload(storagePath, data, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`STORAGE_ERROR: ${error.message}`);

  return {
    bucket: 'inquiry-attachments' as const,
    path: storagePath,
    fullPath: uploadData?.fullPath || `inquiry-attachments/${storagePath}`,
    filename,
    contentType,
    size,
  };
}

/**
 * Generates an authorized signed download URL with 1-hour expiration.
 */
export async function createAuthorizedDownloadUrl(
  member: { organizationId: string; id: string; role: string; roleCode: string; studentId?: string },
  bucket: StorageBucket,
  storagePath: string
): Promise<string> {
  const parts = storagePath.split('/');
  const orgInPath = parts[0];

  // Organization isolation check
  if (orgInPath !== member.organizationId) {
    throw new Error('FORBIDDEN: Cross-organization document access denied.');
  }

  // Object-level authorization
  const client = createSupabaseServerClient();

  if (bucket === 'student-documents') {
    if (member.role === 'Admin' || member.role === 'Head of School') {
      // Allowed for managers in the org
    } else if (member.role === 'Student') {
      const studentIdInPath = parts[2];
      if (member.studentId !== studentIdInPath) {
        throw new Error('FORBIDDEN: Students may only access their own documents.');
      }
    } else if (member.role === 'Parent') {
      const studentIdInPath = parts[2];
      const { data: link } = await client
        .from('parent_student_links')
        .select('student_id')
        .eq('organization_id', member.organizationId)
        .eq('parent_profile_id', member.id)
        .eq('student_id', studentIdInPath)
        .maybeSingle();

      if (!link) {
        throw new Error('FORBIDDEN: Parents may only access their linked child\'s documents.');
      }
    } else if (member.role === 'Teacher') {
      // Teacher class authorization check
      const studentIdInPath = parts[2];
      const { data: memberships } = await client
        .from('class_memberships')
        .select('class_id')
        .eq('organization_id', member.organizationId)
        .eq('student_id', studentIdInPath);

      const teacherClassIds = (memberships || []).map((m: { class_id: string }) => m.class_id);
      const { data: teacherClass } = await client
        .from('classes')
        .select('id')
        .eq('organization_id', member.organizationId)
        .in('id', teacherClassIds.length ? teacherClassIds : ['00000000-0000-0000-0000-000000000000'])
        .maybeSingle();

      if (!teacherClass && !['Admin', 'Head of School'].includes(member.role)) {
        throw new Error('FORBIDDEN: Teachers may only access documents for assigned students.');
      }
    } else {
      throw new Error('FORBIDDEN: Role not authorized for student documents.');
    }
  } else if (bucket === 'admissions-documents') {
    if (!['Admin', 'Head of School'].includes(member.role)) {
      throw new Error('FORBIDDEN: Only Admissions staff and Administrators may access admissions documents.');
    }
  } else if (bucket === 'inquiry-attachments') {
    if (!['Admin', 'Head of School', 'Teacher', 'Staff'].includes(member.role)) {
      throw new Error('FORBIDDEN: Only authorized staff may review inquiry attachments.');
    }
  }

  const { data, error } = await client.storage.from(bucket).createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) {
    throw new Error(`STORAGE_ERROR: Failed to generate signed download URL: ${error?.message}`);
  }

  return data.signedUrl;
}
