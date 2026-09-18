export type CollectionType = 'academic' | 'fiction';

export type AppPage = 
  | 'login' 
  | 'student-hub' 
  | 'book-store' 
  | 'reading-tracker' 
  | 'my-loans' 
  | 'staff-dashboard';

export type AcademicSubject = 
  | 'Chemistry'
  | 'Physics'
  | 'Biology'
  | 'Mathematics'
  | 'Computer Science'
  | 'Economics & Business'
  | 'History & Social Sciences'
  | 'IB DP & AP Guides';

export type FictionGenre =
  | 'Fantasy & Mythology'
  | 'Sci-Fi & Dystopian'
  | 'Classics & World Literature'
  | 'Mystery & Thriller'
  | 'Young Adult & Contemporary'
  | 'Graphic Novels & Manga';

export type BookCategory = AcademicSubject | FictionGenre;

export interface BookLocation {
  floor: string;
  wing: string;
  aisle: string;
  shelf: string;
  callNumber: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  coAuthors?: string[];
  publisher: string;
  publishedYear: number;
  isbn: string;
  edition?: string;
  collection: CollectionType;
  category: BookCategory;
  seriesName?: string;
  seriesVolume?: number; // e.g. Book 1, Book 2, etc.
  totalCopies: number;
  availableCopies: number;
  location: BookLocation;
  pageCount: number;
  readingLevel?: string; // e.g. 'Grade 9-12', 'Advanced / DP', 'All Ages'
  language: string;
  synopsis: string;
  tags: string[];
  coverColor: string; // Hex or gradient class for fallback rendering
  coverImageUrl?: string;
  isAvailableForLoan: boolean;
  lastUpdated: string;
  rating?: number; // 1-5
  totalBorrowsCount: number;
}

export interface CartBookItem {
  book: BookItem;
  borrowDurationDays: number;
}

export type LoanStatus = 'active' | 'returned' | 'overdue' | 'renewed';

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCategory: BookCategory;
  collection: CollectionType;
  coverColor?: string;
  seriesName?: string;
  seriesVolume?: number;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  borrowDate: string; // ISO date
  dueDate: string; // ISO date
  returnedDate?: string;
  status: LoanStatus;
  renewCount: number;
  maxRenewals: number;
  notes?: string;
  issuedByStaff: string;
}

export interface ReadingSessionLog {
  id: string;
  bookId: string;
  bookTitle: string;
  studentEmail: string;
  studentName: string;
  date: string; // ISO date
  minutesRead: number;
  startPage: number;
  endPage: number;
  totalPages: number;
  reflections?: string;
  rating?: number;
  completedBook?: boolean;
}

export type WaitlistStatus = 'waiting' | 'ready_for_pickup' | 'fulfilled' | 'cancelled';

export interface WaitlistEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  collection: CollectionType;
  category: BookCategory;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  joinedAt: string; // ISO
  queuePosition: number;
  status: WaitlistStatus;
  notifiedAt?: string;
  pickupDeadline?: string;
  notes?: string;
}

export type PurchaseRequestStatus = 'pending' | 'approved' | 'ordered' | 'arrived' | 'rejected';

export interface BookPurchaseRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  bookTitle: string;
  author: string;
  publisher?: string;
  subjectGenre: string;
  isbn?: string;
  estimatedPrice?: string;
  reasonForPurchase: string;
  urgency: 'low' | 'normal' | 'high';
  status: PurchaseRequestStatus;
  createdAt: string;
  reviewedBy?: string;
  adminNotes?: string;
}

export type DamageCondition = 'minor_wear' | 'torn_pages' | 'water_damaged' | 'spine_broken' | 'lost';
export type DamageActionStatus = 'under_repair' | 'rebound' | 'written_off' | 'replaced';

export interface BookDamageLog {
  id: string;
  bookId: string;
  bookTitle: string;
  collection: CollectionType;
  condition: DamageCondition;
  description: string;
  reportedBy: string;
  loggedDate: string;
  fineAssessed?: string;
  status: DamageActionStatus;
  actionTaken: string;
}

export type UserRole = 'student' | 'staff';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  grade?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export type SortOption = 
  | 'alphabetical-asc'
  | 'alphabetical-desc'
  | 'availability-desc'
  | 'pages-desc'
  | 'pages-asc'
  | 'year-desc'
  | 'series-order';
