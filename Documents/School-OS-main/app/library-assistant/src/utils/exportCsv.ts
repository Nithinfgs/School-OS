import { BookItem, BookLoan, BookPurchaseRequest } from '../types/library';

export const exportBooksToCsv = (books: BookItem[], filename = 'library_catalog_inventory.csv') => {
  const headers = [
    'Book ID',
    'Title',
    'Author',
    'Publisher',
    'Year',
    'ISBN',
    'Collection',
    'Category',
    'Series',
    'Volume',
    'Total Copies',
    'Available Copies',
    'Floor',
    'Aisle',
    'Shelf',
    'Call Number',
    'Page Count'
  ];

  const rows = books.map((b) => [
    `"${b.id}"`,
    `"${b.title.replace(/"/g, '""')}"`,
    `"${b.author.replace(/"/g, '""')}"`,
    `"${b.publisher.replace(/"/g, '""')}"`,
    b.publishedYear,
    `"${b.isbn}"`,
    b.collection === 'academic' ? 'Academic & DP' : 'Fiction & Non-Fiction',
    `"${b.category}"`,
    `"${b.seriesName || ''}"`,
    b.seriesVolume || '',
    b.totalCopies,
    b.availableCopies,
    `"${b.location.floor}"`,
    `"${b.location.aisle}"`,
    `"${b.location.shelf}"`,
    `"${b.location.callNumber}"`,
    b.pageCount
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, filename);
};

export const exportLoansToCsv = (loans: BookLoan[], filename = 'shared_borrowed_books_records.csv') => {
  const headers = [
    'Loan ID',
    'Book Title',
    'Author',
    'Collection',
    'Category',
    'Student Borrower',
    'Student Email',
    'Grade / Section',
    'Date Shared / Borrowed',
    'Due Date',
    'Days Past Due / Remaining',
    'Circulation Status',
    'Times Renewed',
    'Issued By Staff'
  ];

  const rows = loans.map((l) => {
    const due = new Date(l.dueDate).getTime();
    const now = new Date().getTime();
    const daysDiff = Math.ceil((due - now) / (1000 * 3600 * 24));
    let statusLabel = l.status.toUpperCase();
    if (l.status !== 'returned' && daysDiff < 0) {
      statusLabel = `OVERDUE (${Math.abs(daysDiff)} DAYS PAST DUE)`;
    }

    return [
      `"${l.id}"`,
      `"${l.bookTitle.replace(/"/g, '""')}"`,
      `"${l.bookAuthor.replace(/"/g, '""')}"`,
      l.collection === 'academic' ? 'Academic & DP' : 'Fiction & Non-Fiction',
      `"${l.bookCategory}"`,
      `"${l.studentName.replace(/"/g, '""')}"`,
      `"${l.studentEmail}"`,
      `"${l.studentGrade}"`,
      `"${l.borrowDate.split('T')[0]}"`,
      `"${l.dueDate.split('T')[0]}"`,
      daysDiff < 0 ? `"${Math.abs(daysDiff)} days overdue"` : `"${daysDiff} days left"`,
      `"${statusLabel}"`,
      l.renewCount,
      `"${l.issuedByStaff}"`
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, filename);
};

export const exportPurchaseRequestsToCsv = (requests: BookPurchaseRequest[], filename = 'book_acquisition_requests.csv') => {
  const headers = [
    'Request ID',
    'Book Title',
    'Author',
    'Publisher',
    'Subject / Genre',
    'ISBN',
    'Student Name',
    'Student Email',
    'Grade',
    'Reason & Justification',
    'Urgency Level',
    'Status',
    'Submitted Date',
    'Reviewed By'
  ];

  const rows = requests.map((r) => [
    `"${r.id}"`,
    `"${r.bookTitle.replace(/"/g, '""')}"`,
    `"${r.author.replace(/"/g, '""')}"`,
    `"${r.publisher || ''}"`,
    `"${r.subjectGenre}"`,
    `"${r.isbn || ''}"`,
    `"${r.studentName}"`,
    `"${r.studentEmail}"`,
    `"${r.studentGrade}"`,
    `"${(r.reasonForPurchase || '').replace(/"/g, '""')}"`,
    r.urgency.toUpperCase(),
    r.status.toUpperCase(),
    `"${r.createdAt.split('T')[0]}"`,
    `"${r.reviewedBy || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, filename);
};

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
