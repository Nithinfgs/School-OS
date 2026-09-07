import { context, db, encode, scopeRows, schoolRows } from '@/lib/server';
import { recordCategories } from '@/lib/teaching';
import { isMasterVisible } from '@/lib/master-dashboard';

export async function POST(req: Request) {
  try {
    const { user, member, org } = await context();
    if (
      req.headers.get('origin') &&
      req.headers.get('origin') !== new URL(req.url).origin
    )
      throw Error('FORBIDDEN');
    const b: any = await req.json();
    const all = await schoolRows(org);
    const permitted = scopeRows(all, member);
    const old = b.id ? all.find((r) => r.id === b.id) : null;
    const now = new Date().toISOString();
    const text = (key: string, max = 5000, required = false) => {
      if (b[key] != null && typeof b[key] !== 'string')
        throw Error('Invalid ' + key);
      const v = (b[key] || '').trim();
      if ((required && !v) || v.length > max)
        throw Error('Check ' + key + ' (maximum ' + max + ' characters)');
      return v;
    };
    const date = (key: string, required = true) => {
      const s = text(key, 30, required);
      if (
        s &&
        (!Number.isFinite(Date.parse(s)) ||
          !/^\d{4}-\d{2}-\d{2}/.test(s) ||
          new Date(s.slice(0, 10)).toISOString().slice(0, 10) !==
            s.slice(0, 10))
      )
        throw Error('Invalid ' + key);
      return s;
    };
    const one = (key: string, values: string[], fallback?: string) => {
      const v = b[key] ?? fallback;
      if (!values.includes(v)) throw Error('Invalid ' + key);
      return v;
    };
    const getClass = (id = b.classId) => {
      const c = all.find((r) => r.id === id && r.kind === 'class');
      if (
        !c ||
        (member.role !== 'Admin' &&
          !(member.classes || '').split('|').includes(c.name))
      )
        throw Error('FORBIDDEN');
      return c;
    };
    const getStudent = (id: string, cls: any) => {
      const s = all.find(
        (r) =>
          r.id === id &&
          r.kind === 'student' &&
          (r.data.class === cls.name || r.data.classes?.includes(cls.name)),
      );
      if (!s) throw Error('Student is outside this class');
      return s;
    };
    const links = () => {
      const values = b.resources || [];
      if (!Array.isArray(values) || values.length > 30)
        throw Error('Use up to 30 resource links');
      return values.map((v: any) => {
        if (typeof v !== 'string' || v.length > 2000)
          throw Error('Invalid resource');
        const u = new URL(v, new URL(req.url).origin);
        if (!['http:', 'https:'].includes(u.protocol))
          throw Error('Invalid resource link');
        return v;
      });
    };
    const attachments = () => {
      if (!Array.isArray(b.attachments || []))
        throw Error('Invalid attachments');
      return (b.attachments || []).map((id: string) => {
        const f = permitted.find((r) => r.id === id && r.kind === 'file');
        if (!f) throw Error('FORBIDDEN');
        if (f.data.audience === 'submission')
          throw Error(
            'Student submissions cannot be attached as class resources',
          );
        if (['targeted', 'message'].includes(f.data.audience)) {
          const recipients =
            b.action === 'message'
              ? b.studentId
                ? [b.studentId]
                : all
                    .filter(
                      (r) =>
                        r.kind === 'student' &&
                        r.data.class === getClass().name,
                    )
                    .map((r) => r.id)
              : ['project', 'cas'].includes(b.action)
                ? b.studentIds
                : [];
          if (
            !Array.isArray(recipients) ||
            !recipients.length ||
            recipients.some((id: string) => !f.data.studentIds?.includes(id))
          )
            throw Error('File audience does not cover these recipients');
        }
        if (f.data.class !== getClass().name)
          throw Error('Attachment belongs to another class');
        return { id: f.id, name: f.name };
      });
    };
    const write = (
      id: string,
      kind: string,
      name: string,
      data: any,
      prior: any,
    ) => {
      if (prior) {
        if (prior.kind !== kind || b.version !== prior.version)
          throw Error('CONFLICT');
        return db()
          .prepare(
            'UPDATE records SET name=?,data=CASE WHEN version=? THEN ? ELSE NULL END,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?',
          )
          .bind(
            name,
            prior.version,
            JSON.stringify(data),
            user.userId,
            now,
            org + ':' + id,
            org,
          );
      }
      return db()
        .prepare(
          'INSERT INTO records (id,organizationId,kind,name,data,quantity,version,updatedBy,updatedAt) VALUES (?,?,?,?,?,0,0,?,?)',
        )
        .bind(
          org + ':' + id,
          org,
          kind,
          name,
          JSON.stringify({ ...data, createdBy: user.userId, createdAt: now }),
          user.userId,
          now,
        );
    };
    // Students may save/submit only their own assignment work and acknowledge their own messages.
    if (b.action === 'messageReply') {
      if (
        !old ||
        old.kind !== 'message' ||
        !old.data.participants?.includes(user.userId)
      )
        throw Error('FORBIDDEN');
      const id = crypto.randomUUID();
      await db().batch([
        write(
          id,
          'message',
          'Re: ' + old.name.replace(/^Re: /, ''),
          {
            classId: old.data.classId,
            class: old.data.class,
            studentId: old.data.studentId || '',
            participants: old.data.participants,
            threadId: old.data.threadId || old.id,
            description: text('description', 10000, true),
            sentAt: now,
            senderName: member.name,
            attachments: [],
          },
          null,
        ),
      ]);
      return Response.json({ ok: true, id });
    }
    if (b.action === 'submitWork') {
      if (member.role !== 'Student') throw Error('FORBIDDEN');
      const a = permitted.find(
        (r) => r.id === b.assignmentId && r.kind === 'assignment',
      );
      if (!a) throw Error('FORBIDDEN');
      if (a.data.submissionType === 'none')
        throw Error('This assignment does not accept submissions');
      if (
        a.data.submissionsClosed ||
        (a.data.acceptUntil && Date.parse(a.data.acceptUntil) < Date.now()) ||
        (a.data.allowLate === false && Date.parse(a.data.dueAt) < Date.now())
      )
        throw Error('The submission deadline has passed');
      const previous = all.find(
        (r) =>
          r.kind === 'submission' &&
          r.data.assignmentId === a.id &&
          r.data.studentId === member.studentId,
      );
      if (
        previous &&
        previous.data.status === 'Graded' &&
        !previous.data.returned
      )
        throw Error('Wait for this work to be returned');
      const content = text('text', 30000, false),
        draft = !!b.draft;
      if (
        previous &&
        a.data.allowReplacement === false &&
        ['Submitted', 'Late', 'Graded'].includes(previous.data.status)
      )
        throw Error('Replacement submissions are not enabled');
      const link = text('link', 2000);
      if (link && !['https:', 'http:'].includes(new URL(link).protocol))
        throw Error('Use an HTTP or HTTPS link');
      const files = (b.attachments || []).map((id: string) => {
        const f = permitted.find(
          (r) =>
            r.id === id && r.kind === 'file' && r.data.ownerId === user.userId,
        );
        if (!f) throw Error('FORBIDDEN');
        return { id: f.id, name: f.name };
      });
      if (
        !['text', 'file', 'either', 'link'].includes(
          a.data.submissionType || 'text',
        )
      )
        throw Error('Unsupported submission type');
      if (a.data.submissionType === 'file' && !draft && !files.length)
        throw Error('Attach your work');
      if (a.data.submissionType === 'link' && !draft && !link)
        throw Error('Add your work link');
      if (!content && !files.length && !link)
        throw Error('Write a response or attach your work');
      if ((a.data.submissionType || 'text') === 'text' && !content)
        throw Error('Write your response');
      const id = previous?.id || 'submission-' + a.id + '-' + member.studentId;
      await db().batch([
        write(
          id,
          'submission',
          a.name,
          {
            assignmentId: a.id,
            class: a.data.class,
            studentId: member.studentId,
            text: content,
            link,
            attachments: files,
            status: draft
              ? 'InProgress'
              : Date.parse(a.data.dueAt) < Date.now()
                ? 'Late'
                : 'Submitted',
            submittedAt: draft ? null : now,
            returned: false,
          },
          previous,
        ),
      ]);
      return Response.json({ ok: true, id });
    }
    if (!['Teacher', 'Admin'].includes(member.role)) throw Error('FORBIDDEN');
    if (
      old &&
      (!permitted.some((r) => r.id === old.id) ||
        (!isMasterVisible(old) && old.kind !== 'message'))
    )
      throw Error('FORBIDDEN');
    const cls = getClass();
    if (old?.data.class && old.data.class !== cls.name)
      throw Error('Class cannot change on an existing record');
    if (b.action === 'attendanceBulk') {
      const day = date('date'),
        period = text('period', 40) || 'Daily';
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
        throw Error('Choose a calendar date');
      if (
        !Array.isArray(b.entries) ||
        !b.entries.length ||
        b.entries.length > 100
      )
        throw Error('Choose 1–100 students');
      if (
        new Set(b.entries.map((e: any) => e.studentId)).size !==
        b.entries.length
      )
        throw Error('Duplicate student');
      const statements = b.entries.map((e: any) => {
        const s = getStudent(e.studentId, cls);
        if (!['Present', 'Absent', 'Late', 'Excused'].includes(e.status))
          throw Error('Invalid attendance status');
        if (e.arrivalTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(e.arrivalTime))
          throw Error('Arrival time must be HH:MM');
        for (const k of ['reason', 'notes', 'actionTaken', 'followUp'])
          if (e[k] != null && (typeof e[k] !== 'string' || e[k].length > 2000))
            throw Error('Invalid attendance notes');
        if (e.followUp && !/^\d{4}-\d{2}-\d{2}$/.test(e.followUp))
          throw Error('Invalid follow-up date');
        const id =
          'attendance-' +
          cls.id +
          '-' +
          s.id +
          '-' +
          day +
          (period === 'Daily' ? '' : '-' + encodeURIComponent(period));
        const prior = all.find((r) => r.id === id);
        if (
          prior &&
          (e.version !== prior.version ||
            !String(e.reason || e.notes || '').trim())
        )
          throw Error('Corrections need the latest version and a reason');
        const payload = {
          classId: cls.id,
          class: cls.name,
          studentId: s.id,
          studentName: s.name,
          date: day,
          period,
          status: e.status,
          arrivalTime: e.arrivalTime || '',
          reason: e.reason || '',
          notes: e.notes || '',
          actionTaken: e.actionTaken || '',
          followUp: e.followUp || '',
          teacher: member.name,
          teacherId: member.id,
        };
        return prior
          ? db()
              .prepare(
                'UPDATE records SET data=CASE WHEN version=? THEN ? ELSE NULL END,version=version+1,updatedBy=?,updatedAt=? WHERE id=? AND organizationId=?',
              )
              .bind(
                prior.version,
                JSON.stringify(payload),
                user.userId,
                now,
                org + ':' + id,
                org,
              )
          : write(id, 'attendance', s.name + ' · ' + cls.name, payload, null);
      });
      await db().batch(statements);
      return Response.json({ ok: true, count: statements.length });
    }
    let kind = '',
      name = '',
      data: any = {
        ...old?.data,
        classId: cls.id,
        class: cls.name,
        teacher: member.name,
        teacherId: member.id,
      };
    if (b.action === 'assignment') {
      kind = 'assignment';
      name = text('name', 200, true);
      const maximumMarks = Number(b.maximumMarks);
      if (
        !Number.isFinite(maximumMarks) ||
        maximumMarks <= 0 ||
        maximumMarks > 10000
      )
        throw Error('Maximum marks must be 1–10000');
      data = {
        ...data,
        instructions: text('instructions', 20000, true),
        dueAt: date('dueAt'),
        maximumMarks,
        rubric: text('rubric', 10000),
        submissionType: one(
          'submissionType',
          ['text', 'file', 'either', 'link', 'none'],
          'text',
        ),
        status: one('status', ['Draft', 'Published'], 'Draft'),
        allowLate: b.allowLate !== false,
        allowReplacement: b.allowReplacement !== false,
        acceptUntil: date('acceptUntil', false),
        submissionsClosed: b.submissionsClosed === true,
        resources: links(),
        attachments: attachments(),
      };
    } else if (b.action === 'studentRecord') {
      kind = 'record';
      const student = getStudent(b.studentId, cls);
      name = one('category', recordCategories);
      data = {
        ...data,
        studentId: student.id,
        studentName: student.name,
        category: name,
        occurredAt: date('occurredAt'),
        location: text('location', 200),
        severity: one('severity', ['Low', 'Medium', 'High'], 'Low'),
        description: text('description', 10000, true),
        actionTaken: text('actionTaken'),
        internalNote: text('internalNote'),
        studentVisible: b.studentVisible === true,
        parentNotify: b.parentNotify === true,
        followUp: date('followUp', false),
        status: one('status', ['Open', 'Monitoring', 'Resolved'], 'Open'),
      };
      // A parent contact request is a staff follow-up flag; no external message is sent.
    } else if (b.action === 'gradeWork') {
      if (!old || old.kind !== 'submission')
        throw Error('Submission not found');
      const a = all.find(
        (r) =>
          r.id === old.data.assignmentId &&
          r.kind === 'assignment' &&
          r.data.class === cls.name,
      );
      if (!a) throw Error('FORBIDDEN');
      const grade = Number(b.grade);
      if (
        !Number.isFinite(grade) ||
        grade < 0 ||
        grade > Number(a.data.maximumMarks)
      )
        throw Error('Grade exceeds maximum marks');
      kind = 'submission';
      name = old.name;
      data = {
        ...data,
        grade,
        feedback: text('feedback', 10000, true),
        internalNotes: text('internalNotes'),
        status: 'Graded',
        returned: b.returned === true,
        gradedAt: now,
        returnedAt: b.returned ? now : null,
      };
    } else if (b.action === 'resource') {
      kind = 'resource';
      name = text('name', 200, true);
      data = {
        ...data,
        resources: links(),
        attachments: attachments(),
        subject: text('subject', 200),
        unit: text('unit', 200),
        topic: text('topic', 200),
        description: text('description'),
        audience: 'class',
      };
      if (!data.resources.length && !data.attachments.length)
        throw Error('Add a link or uploaded file');
    } else if (b.action === 'announcement') {
      kind = 'announcement';
      name = text('name', 200, true);
      data = {
        ...data,
        description: text('description', 10000, true),
        priority: one('priority', ['Normal', 'Important', 'Urgent'], 'Normal'),
        date: now.slice(0, 10),
        expiresAt: date('expiresAt', false),
        studentId: b.studentId ? getStudent(b.studentId, cls).id : '',
        attachments: attachments(),
      };
    } else if (b.action === 'message') {
      if (old) throw Error('Send a reply instead of changing a message');
      kind = 'message';
      name = text('name', 200, true);
      const student = b.studentId ? getStudent(b.studentId, cls) : null;
      const memberships = (
        await db()
          .prepare(
            'SELECT userId,studentId,classes,role FROM members WHERE organizationId=?',
          )
          .bind(org)
          .all<any>()
      ).results;
      const recipients = memberships
        .filter(
          (m) =>
            m.role === 'Student' &&
            (student
              ? m.studentId === student.id
              : String(m.classes || '')
                  .split('|')
                  .includes(cls.name)) &&
            !m.userId.startsWith('pending:'),
        )
        .map((m) => m.userId);
      if (!recipients.length)
        throw Error(
          'No signed-in student accounts are linked to this audience',
        );
      data = {
        ...data,
        description: text('description', 10000, true),
        participants: [...new Set([user.userId, ...recipients])],
        senderName: member.name,
        studentId: student?.id || '',
        sentAt: now,
        attachments: attachments(),
        threadId: text('threadId', 200),
      };
    } else if (['project', 'cas'].includes(b.action)) {
      kind = b.action;
      name = text('name', 200, true);
      if (old && old.data.supervisorId !== member.id && member.role !== 'Admin')
        throw Error('FORBIDDEN');
      if (!Array.isArray(b.studentIds) || !b.studentIds.length)
        throw Error('Select supervised students');
      const studentIds = [
        ...new Set(b.studentIds.map((id: string) => getStudent(id, cls).id)),
      ];
      data = {
        ...data,
        studentIds,
        supervisorId: old?.data.supervisorId || member.id,
        supervisor: old?.data.supervisor || member.name,
        type:
          kind === 'cas'
            ? one('type', ['Creativity', 'Activity', 'Service'], 'Service')
            : one('type', ['IA', 'EE', 'Personal', 'Group'], 'IA'),
        description: text('description', 10000, true),
        milestones: text('milestones', 10000),
        milestoneList: (Array.isArray(b.milestoneList)
          ? b.milestoneList
          : []
        ).map((m: any) => {
          if (
            typeof m.title !== 'string' ||
            !m.title.trim() ||
            m.title.length > 200 ||
            !/^\d{4}-\d{2}-\d{2}$/.test(m.dueAt) ||
            !Number.isFinite(Date.parse(m.dueAt))
          )
            throw Error('Each milestone needs a title and valid due date');
          return {
            title: m.title.trim(),
            dueAt: m.dueAt,
            completed: m.completed === true,
          };
        }),
        dueAt: date('dueAt'),
        meetingAt: date('meetingAt', false),
        evidence: text('evidence', 10000),
        feedback: text('feedback', 10000),
        status: one(
          'status',
          [
            'Planning',
            'InProgress',
            'Submitted',
            'ChangesRequested',
            'Approved',
            'Completed',
          ],
          'Planning',
        ),
        resources: links(),
        attachments: attachments(),
      };
    } else if (b.action === 'exam') {
      kind = 'exam';
      name = text('name', 200, true);
      const duration = Number(b.duration);
      if (!Number.isInteger(duration) || duration < 1 || duration > 480)
        throw Error('Duration must be 1–480 minutes');
      const results = (b.results || []).map((x: any) => {
        const s = getStudent(x.studentId, cls);
        if (
          !Number.isFinite(Number(x.mark)) ||
          Number(x.mark) < 0 ||
          Number(x.mark) > 100
        )
          throw Error('Exam results must be percentages from 0–100');
        return {
          studentId: s.id,
          studentName: s.name,
          mark: Number(x.mark),
          feedback: String(x.feedback || '').slice(0, 5000),
        };
      });
      data = {
        ...data,
        dueAt: date('dueAt'),
        duration,
        room: text('room', 200, true),
        description: text('description', 5000),
        results,
        resultsPublished: b.resultsPublished === true,
      };
    } else throw Error('Unknown teaching action');
    const id = old?.id || crypto.randomUUID();
    await db().batch([write(id, kind, name, data, old)]);
    return Response.json({ ok: true, id });
  } catch (e: any) {
    const conflict =
      e.message === 'CONFLICT' || /NOT NULL|UNIQUE/.test(e.message);
    return Response.json(
      {
        error: conflict
          ? 'This record changed. Refresh and try again.'
          : e.message,
      },
      {
        status:
          e.message === 'UNAUTHORIZED'
            ? 401
            : e.message === 'FORBIDDEN'
              ? 403
              : conflict
                ? 409
                : 400,
      },
    );
  }
}
