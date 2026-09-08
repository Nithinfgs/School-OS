import { RecordRegistry, activityEvent, trackedRecord, type BaseTrackedEntity } from '../tracking';

const ORG = 'schoolos-dev';
const STUDENT = 'student-1';
const CLASS = 'Physics HL';

function report(input: Record<string, any>): BaseTrackedEntity {
  return trackedRecord(input, {
    organizationId: ORG,
    actorId: input.createdBy || 'teacher-maya',
    module: input.sourceModule,
    recordType: input.recordType,
    status: input.status,
    studentId: input.studentId,
    classId: input.classId,
    assetId: input.assetId,
    schoolYear: '2026-27',
    labels: input.labels,
    visibility: input.visibility,
  });
}

/** One coherent data graph used by mock repositories and workspace seeds. */
export function demoTrackedEntities(): BaseTrackedEntity[] {
  return [
    report({ id:'report-positive-student-1', studentId:STUDENT, classId:CLASS, sourceModule:'Classroom', recordType:RecordRegistry.STUDENT_POSITIVE, status:'Recorded', title:'Excellent practical collaboration', description:'Supported the group during the optics practical and documented results carefully.', actionTaken:'Positive recognition added to the student record.', reportedBy:'Maya Iyer', createdBy:'teacher-maya', dateTime:'2026-09-04T11:10:00.000Z', createdAt:'2026-09-04T11:10:00.000Z', updatedAt:'2026-09-04T11:10:00.000Z', labels:['Positive Record','Physics HL'], metadata:{studentId:STUDENT,classId:CLASS}, relatedEntityRefs:[{type:'Student',id:STUDENT},{type:'Class',id:'class-physics'}], visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true} }),
    report({ id:'report-behaviour-student-1', studentId:STUDENT, classId:'Mathematics AA HL', sourceModule:'Classroom', recordType:RecordRegistry.STUDENT_BEHAVIOUR, status:'Resolved', title:'Missing homework follow-up', description:'The algebra practice was not available at the start of class.', actionTaken:'Work was submitted during study period and the follow-up was closed.', reportedBy:'Mr. Pramod', createdBy:'teacher-pramod', dateTime:'2026-09-02T08:30:00.000Z', createdAt:'2026-09-02T08:30:00.000Z', updatedAt:'2026-09-02T13:30:00.000Z', labels:['Behaviour Record','Missing Homework'], metadata:{studentId:STUDENT,classId:'class-math-aa'}, relatedEntityRefs:[{type:'Student',id:STUDENT},{type:'Class',id:'class-math-aa'}], visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true} }),
    report({ id:'damage-microscope-student-1', studentId:STUDENT, classId:CLASS, module:'Lab', sourceModule:'Lab', recordType:RecordRegistry.LAB_DAMAGE, status:'UnderReview', title:'Microscope focus knob damage', assetType:'LabEquipment', assetId:'labitem-microscope-01', assetName:'Compound microscope 04', quantity:1, conditionBefore:'Operational', conditionAfter:'Coarse focus knob stiff', damageType:'Accidental damage', severity:'Low', description:'The focus knob became stiff during the prepared-slide practical.', dateTime:'2026-09-03T10:42:00.000Z', location:'Biology Lab · Bench 4', reportedBy:'Olivia Reed', assignedTo:'lab-assistant-olivia', studentVisible:true, actionTaken:'Item quarantined for technician inspection.', createdBy:'lab-assistant-olivia', createdAt:'2026-09-03T10:42:00.000Z', updatedAt:'2026-09-03T10:42:00.000Z', labels:['Lab','Damage Report','Microscope','Physics HL'], metadata:{studentId:STUDENT,classId:CLASS,internalNote:'Technician quote requested.'}, relatedEntityRefs:[{type:'Student',id:STUDENT},{type:'Asset',id:'labitem-microscope-01'}], visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true} }),
    report({ id:'damage-library-student-1', studentId:STUDENT, module:'Library', sourceModule:'Library', recordType:RecordRegistry.LIBRARY_DAMAGE, status:'ActionRequired', title:'Library book water damage', assetType:'BookCopy', assetId:'bookcopy-physics-03', assetName:'University Physics with Modern Physics', quantity:1, conditionBefore:'Good', conditionAfter:'Water damage to lower page edges', damageType:'Water damage', severity:'Moderate', description:'Damage was found during the return inspection.', dateTime:'2026-08-31T13:15:00.000Z', location:'School Library', reportedBy:'Daniel Moore', assignedTo:'librarian-daniel', studentVisible:true, actionTaken:'Replacement assessment in progress.', createdBy:'librarian-daniel', createdAt:'2026-08-31T13:15:00.000Z', updatedAt:'2026-08-31T13:15:00.000Z', labels:['Library','Damage Report','Book'], metadata:{studentId:STUDENT}, relatedEntityRefs:[{type:'Student',id:STUDENT},{type:'BookCopy',id:'bookcopy-physics-03'}], visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true} }),
    report({ id:'transport-notice-student-1', studentId:STUDENT, sourceModule:'Transport', recordType:RecordRegistry.TRANSPORT_NOTICE, status:'Acknowledged', title:'Not using school bus', description:'Student will leave with an authorized guardian after activities.', actionTaken:'Transport desk acknowledged the exception.', reportedBy:'Maya Iyer', createdBy:'teacher-maya', dateTime:'2026-09-07T07:00:00.000Z', createdAt:'2026-09-07T07:00:00.000Z', updatedAt:'2026-09-07T07:15:00.000Z', labels:['Transport','Bus Exception'], metadata:{studentId:STUDENT,date:'2026-09-07',changeType:'NotUsingBus'}, relatedEntityRefs:[{type:'Student',id:STUDENT}], visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true} }),
    report({ id:'attendance-late-student-1', studentId:STUDENT, classId:'Mathematics AA HL', sourceModule:'Classroom', recordType:RecordRegistry.ATTENDANCE_LATE, status:'Recorded', title:'Late arrival', description:'Arrived at 08:38 for Mathematics AA HL.', actionTaken:'Attendance updated; no further action required.', reportedBy:'Mr. Pramod', createdBy:'teacher-pramod', dateTime:'2026-09-01T08:38:00.000Z', createdAt:'2026-09-01T08:38:00.000Z', updatedAt:'2026-09-01T08:38:00.000Z', labels:['Attendance','Late'], metadata:{studentId:STUDENT,classId:'class-math-aa'}, relatedEntityRefs:[{type:'Student',id:STUDENT},{type:'Class',id:'class-math-aa'}], visibility:{studentVisible:true,parentVisible:true,teacherVisible:true,adminVisible:true,hosVisible:true} }),
  ];
}

export function demoTrackingRows() {
  const entities = demoTrackedEntities();
  return [
    ...entities.map((data) => ({ id:data.id, kind:data.recordType === RecordRegistry.TRANSPORT_NOTICE ? 'transportNotice' : data.recordType.startsWith('ATTENDANCE_') ? 'attendanceReport' : data.recordType.includes('DAMAGE') ? 'damageBrokenLog' : 'record', name:String((data as any).title || data.labels[0] || 'Tracked record'), quantity:1, data })),
    ...entities.map((entity) => { const data=activityEvent(entity,{ actorId:entity.createdBy, actorRole:'Staff', studentId:String(entity.metadata.studentId || ''), classId:String(entity.metadata.classId || '') }); return {id:data.id,kind:'activityEvent',name:String((entity as any).title || entity.labels[0] || 'Activity'),quantity:1,data}; }),
  ];
}
