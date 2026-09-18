import { LabItem, UsageLog, BreakageLog, MaterialRequest } from '../types/lab';
import { format } from 'date-fns';

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportUsageLogsToCSV(logs: UsageLog[]) {
  const headers = ['Log ID', 'Timestamp', 'Lab Type', 'Item Name', 'Item ID', 'Quantity Used', 'Unit', 'Remaining Stock', 'Experiment / Practical', 'Conducted By', 'Logged By Assistant', 'Notes'];
  
  const rows = logs.map((log) => [
    `"${log.id}"`,
    `"${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}"`,
    `"${log.labType.toUpperCase()}"`,
    `"${log.itemName.replace(/"/g, '""')}"`,
    `"${log.itemId}"`,
    log.quantityUsed,
    `"${log.unit}"`,
    log.remainingStock,
    `"${log.experimentName.replace(/"/g, '""')}"`,
    `"${log.conductedBy.replace(/"/g, '""')}"`,
    `"${log.loggedByAssistant.replace(/"/g, '""')}"`,
    `"${(log.notes || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  downloadCSV(csv, `Lab_Usage_Logs_${dateStr}.csv`);
}

export function exportBreakageLogsToCSV(logs: BreakageLog[]) {
  const headers = ['Breakage ID', 'Timestamp', 'Lab Type', 'Item Name', 'Item ID', 'Quantity Damaged', 'Unit', 'Status', 'Estimated Cost', 'Incident Details', 'Reported By', 'Action Taken'];
  
  const rows = logs.map((log) => [
    `"${log.id}"`,
    `"${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}"`,
    `"${log.labType.toUpperCase()}"`,
    `"${log.itemName.replace(/"/g, '""')}"`,
    `"${log.itemId}"`,
    log.quantityBroken,
    `"${log.unit}"`,
    `"${log.status.toUpperCase()}"`,
    `"${(log.estimatedCost || 'N/A').replace(/"/g, '""')}"`,
    `"${log.incidentDetails.replace(/"/g, '""')}"`,
    `"${log.reportedBy.replace(/"/g, '""')}"`,
    `"${log.actionTaken.replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  downloadCSV(csv, `Broken_Equipment_Report_${dateStr}.csv`);
}

export function exportInventoryToCSV(items: LabItem[]) {
  const headers = [
    'Item ID',
    'Item Name',
    'Formula',
    'Lab Department',
    'Category',
    'Quantity In Stock',
    'Unit',
    'Min Threshold Alert',
    'Room',
    'Cabinet',
    'Shelf',
    'Hazard Level',
    'Supplier Company',
    'Supplier Contact Email',
    'Supplier Phone',
    'Catalog Number',
    'Last Updated'
  ];

  const rows = items.map((item) => [
    `"${item.id}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${(item.chemicalFormula || '').replace(/"/g, '""')}"`,
    `"${item.labType.toUpperCase()}"`,
    `"${item.category.replace(/"/g, '""')}"`,
    item.quantity,
    `"${item.unit}"`,
    item.minThreshold,
    `"${item.location.room.replace(/"/g, '""')}"`,
    `"${item.location.cabinet.replace(/"/g, '""')}"`,
    `"${item.location.shelf.replace(/"/g, '""')}"`,
    `"${item.hazardLevel.toUpperCase()}"`,
    `"${(item.supplier?.company || item.supplier?.name || 'N/A').replace(/"/g, '""')}"`,
    `"${(item.supplier?.email || 'N/A').replace(/"/g, '""')}"`,
    `"${(item.supplier?.phone || 'N/A').replace(/"/g, '""')}"`,
    `"${(item.supplier?.catalogNumber || 'N/A').replace(/"/g, '""')}"`,
    `"${format(new Date(item.lastUpdated), 'yyyy-MM-dd')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  downloadCSV(csv, `Lab_Inventory_Catalog_${dateStr}.csv`);
}

export function exportRequestsToCSV(requests: MaterialRequest[]) {
  const headers = ['Request ID', 'Created At', 'Lab Type', 'Item Name', 'Quantity Requested', 'Unit', 'Student Name', 'Student Email', 'Student Grade', 'Required By Date', 'Status', 'Urgency', 'Purpose', 'Assistant Notes'];

  const rows = requests.map((req) => [
    `"${req.id}"`,
    `"${format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm')}"`,
    `"${req.labType.toUpperCase()}"`,
    `"${req.itemName.replace(/"/g, '""')}"`,
    req.quantityRequested,
    `"${req.unit}"`,
    `"${req.studentName.replace(/"/g, '""')}"`,
    `"${req.studentEmail.replace(/"/g, '""')}"`,
    `"${req.studentGrade.replace(/"/g, '""')}"`,
    `"${req.dateNeeded}"`,
    `"${req.status.toUpperCase()}"`,
    `"${req.urgency.toUpperCase()}"`,
    `"${req.experimentPurpose.replace(/"/g, '""')}"`,
    `"${(req.adminNotes || '').replace(/"/g, '""')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const dateStr = format(new Date(), 'yyyy-MM-dd_HHmm');
  downloadCSV(csv, `Student_Requisitions_${dateStr}.csv`);
}
