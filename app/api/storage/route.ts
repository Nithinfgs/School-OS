import { getChatGPTUser } from '@/app/chatgpt-auth';
import { backendConfig } from '@/lib/platform/config';
import { resolveSupabaseMember } from '@/lib/platform/supabase-auth';
import {
  createAuthorizedDownloadUrl,
  uploadPublicInquiryAttachment,
  uploadStorageObject,
  type StorageBucket,
} from '@/lib/platform/storage';

async function authenticatedMember() {
  const user = await getChatGPTUser();
  if (!user || user.userId.startsWith('dev:')) throw new Error('UNAUTHORIZED');
  return resolveSupabaseMember({ id: user.userId, email: user.email });
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Storage operation failed';
  const status =
    message === 'UNAUTHORIZED'
      ? 401
      : message.startsWith('FORBIDDEN')
      ? 403
      : message.startsWith('VALIDATION_ERROR')
      ? 422
      : message.startsWith('STORAGE_ERROR')
      ? 502
      : 400;
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const bucket = url.searchParams.get('bucket') as StorageBucket;
    const path = url.searchParams.get('path');

    if (!bucket || !path) {
      return Response.json({ error: 'bucket and path parameters are required' }, { status: 400 });
    }

    if (backendConfig.adapter === 'demo') {
      return Response.json({ url: `/api/files?id=${encodeURIComponent(path)}` });
    }

    const member = await authenticatedMember();
    const downloadUrl = await createAuthorizedDownloadUrl(member, bucket, path);

    return Response.json({ downloadUrl }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) {
      throw new Error('FORBIDDEN: Invalid request origin');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') || 'student-documents') as StorageBucket;
    const entityType = (formData.get('entityType') || 'student') as any;
    const entityId = String(formData.get('entityId') || '');
    const isInquiry = formData.get('isInquiry') === 'true';
    const orgId = String(formData.get('organizationId') || '');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'Valid file is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Public inquiry attachment upload flow
    if (isInquiry) {
      if (!orgId || !entityId) {
        return Response.json({ error: 'organizationId and entityId required for inquiries' }, { status: 400 });
      }
      const result = await uploadPublicInquiryAttachment(
        orgId,
        entityId,
        file.name,
        file.type || 'application/octet-stream',
        buffer,
        file.size
      );
      return Response.json({ ok: true, result });
    }

    // Authenticated upload flow
    if (backendConfig.adapter === 'demo') {
      return Response.json({
        ok: true,
        result: {
          bucket,
          path: `demo/${file.name}`,
          fullPath: `demo/${file.name}`,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        },
      });
    }

    const member = await authenticatedMember();
    const result = await uploadStorageObject(member, {
      bucket,
      entityType,
      entityId: entityId || member.studentId || member.id,
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      data: buffer,
      size: file.size,
    });

    return Response.json({ ok: true, result });
  } catch (error) {
    return errorResponse(error);
  }
}
