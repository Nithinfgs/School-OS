import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '@/lib/platform/config';
import { buildRecordTags, RecordRegistry } from '@/lib/tracking';

const recent = new Map<string, number>();
const clean = (value: unknown, max = 5000) => String(value ?? '').trim().slice(0, max);
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  if (now - (recent.get(ip) || 0) < 20_000) return NextResponse.json({ error: 'Please wait before submitting another inquiry.' }, { status: 429 });
  const body = await request.json().catch(() => null) as any;
  const required = ['parentGuardianName','studentName','parentPhone','parentEmail','category','subject','message'];
  if (!body || required.some((key) => !clean(body[key]))) return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(body.parentEmail, 200))) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!body.consentAccepted) return NextResponse.json({ error: 'Consent is required.' }, { status: 400 });
  const attachment = body.attachment;
  if (attachment && (Number(attachment.size) > 5 * 1024 * 1024 || !['application/pdf','image/png','image/jpeg'].includes(String(attachment.type)))) return NextResponse.json({ error: 'Invalid attachment.' }, { status: 400 });
  recent.set(ip, now);
  const referenceNumber = `INQ-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const organizationId = process.env.DEFAULT_ORGANIZATION_ID || '';
  if ((process.env.DATA_MODE || 'demo') === 'supabase' && supabaseConfig.url && supabaseConfig.secretKey) {
    try {
      const client = createClient(supabaseConfig.url, supabaseConfig.secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
      // A public form must never guess a tenant by taking the first database
      // organization. Configure the intended school explicitly at deployment.
      const org = organizationId;
      if (!org) throw new Error('DEFAULT_ORGANIZATION_ID is required');
      const id = crypto.randomUUID();
      const metadata = { referenceNumber, senderType:'ExternalParentGuardian', parentName:clean(body.parentGuardianName,200), studentNameSubmitted:clean(body.studentName,200), studentGrade:clean(body.studentGrade,100), studentClass:clean(body.studentClass,100), phone:clean(body.parentPhone,80), email:clean(body.parentEmail,200), category:clean(body.category,80), preferredContactMethod:clean(body.preferredContactMethod,20), attachment: attachment ? { name:clean(attachment.name,200), type:clean(attachment.type,80), size:Number(attachment.size) } : null };
      const tags = buildRecordTags({ organizationId:org, module:'Inquiries', recordType:RecordRegistry.PARENT_INQUIRY_CREATED, status:'New', category:body.category });
      const { error: inquiryError } = await client.from('inquiries').insert({ id, organization_id:org, subject:clean(body.subject,240), status:'New', restricted:false });
      if (inquiryError) throw inquiryError;
      await client.from('external_parent_guardians').upsert({ organization_id:org, name:metadata.parentName, email:metadata.email, phone:metadata.phone }, { onConflict:'organization_id,email' });
      const { error: messageError } = await client.from('inquiry_messages').insert({ organization_id:org, inquiry_id:id, body:clean(body.message), private:false, attachments: attachment ? [metadata.attachment] : [] });
      if (messageError) throw messageError;
      await client.from('tracked_records').insert({ id, organization_id:org, entity_type:'inquiry', record_type:RecordRegistry.PARENT_INQUIRY_CREATED, source_module:'Inquiries', status:'New', tags, labels:['Parent inquiry','External parent/guardian'], metadata, related_entity_refs:[], visibility:{ adminVisible:true, hosVisible:true, studentVisible:false, parentVisible:true }, body:{ title:clean(body.subject,240), description:clean(body.message), ...metadata }, created_by:null });
    } catch { return NextResponse.json({ error: 'The inquiry could not be saved. Please try again.' }, { status: 503 }); }
  }
  return NextResponse.json({ ok:true, referenceNumber, studentMatchStatus:'MatchRequired' });
}
