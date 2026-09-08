import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BookItem, 
  BookLoan, 
  WaitlistEntry, 
  ReadingSessionLog, 
  BookPurchaseRequest, 
  BookDamageLog,
  DamageCondition,
  DamageActionStatus,
  CollectionType, 
  BookCategory,
  UserRole, 
  UserProfile, 
  ToastMessage, 
  AppPage,
  CartBookItem,
  PurchaseRequestStatus
} from '../types/library';
import { 
  INITIAL_BOOKS, 
  INITIAL_LOANS, 
  INITIAL_WAITLIST, 
  INITIAL_READING_LOGS, 
  INITIAL_PURCHASE_REQUESTS, 
  INITIAL_DAMAGE_LOGS 
} from '../data/initialData';
import confetti from 'canvas-confetti';

interface LibraryContextType {
  books: BookItem[];
  loans: BookLoan[];
  waitlist: WaitlistEntry[];
  readingLogs: ReadingSessionLog[];
  purchaseRequests: BookPurchaseRequest[];
  damageLogs: BookDamageLog[];
  cart: CartBookItem[];
  isCartOpen: boolean;
  selectedCollection: CollectionType;
  selectedCategory: BookCategory | 'all';
  page: AppPage;
  userRole: UserRole;
  currentUser: UserProfile | null;
  toasts: ToastMessage[];
  searchQuery: string;
  
  // Setters & Navigation
  setSearchQuery: (query: string) => void;
  setSelectedCollection: (col: CollectionType) => void;
  setSelectedCategory: (cat: BookCategory | 'all') => void;
  setPage: (page: AppPage) => void;
  setIsCartOpen: (open: boolean) => void;
  navigateTo: (page: AppPage, collection?: CollectionType) => void;
  loginAsStudent: (name: string, email: string, grade?: string) => void;
  loginAsStaff: (name: string, email: string) => void;
  logout: () => void;

  // Cart & Borrow Operations
  addToCart: (book: BookItem, durationDays?: number) => void;
  removeFromCart: (bookId: string) => void;
  updateCartDuration: (bookId: string, durationDays: number) => void;
  clearCart: () => void;
  submitCartBorrowRequest: (notes?: string) => boolean;
  borrowBookDirect: (book: BookItem, durationDays?: number, notes?: string) => boolean;

  // Waitlist Operations
  joinWaitlist: (book: BookItem, notes?: string) => boolean;
  leaveWaitlist: (waitlistId: string) => void;

  // Reading Tracker
  logReadingSession: (params: {
    bookId: string;
    bookTitle: string;
    minutesRead: number;
    startPage: number;
    endPage: number;
    totalPages: number;
    reflections?: string;
    rating?: number;
    completedBook?: boolean;
  }) => boolean;

  // Loan Management (Staff & Student)
  returnBook: (loanId: string, returnConditionNotes?: string) => void;
  renewLoan: (loanId: string) => boolean;

  // Staff Book Inventory CRUD
  addBook: (book: Omit<BookItem, 'id' | 'lastUpdated' | 'totalBorrowsCount'>) => void;
  updateBook: (id: string, updates: Partial<BookItem>) => void;
  deleteBook: (id: string) => void;

  // Student Acquisition / Purchase Requests
  createPurchaseRequest: (request: Omit<BookPurchaseRequest, 'id' | 'status' | 'createdAt'>) => void;
  updatePurchaseRequestStatus: (requestId: string, status: PurchaseRequestStatus, adminNotes?: string) => void;
  deletePurchaseRequest: (requestId: string) => void;

  // Damage Logger
  logDamage: (params: {
    bookId: string;
    bookTitle: string;
    collection: CollectionType;
    condition: DamageCondition;
    description: string;
    reportedBy: string;
    fineAssessed?: string;
    status: DamageActionStatus;
    actionTaken: string;
  }) => boolean;
  updateDamageStatus: (id: string, status: DamageActionStatus, actionTaken?: string) => void;

  // Toasts & Reset
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToDefaultData: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'lib_books_v1',
  LOANS: 'lib_loans_v1',
  WAITLIST: 'lib_waitlist_v1',
  READING_LOGS: 'lib_reading_logs_v1',
  PURCHASE_REQ: 'lib_purchase_req_v1',
  DAMAGE: 'lib_damage_v1',
  USER: 'lib_user_v1',
  PAGE: 'lib_page_v1',
  COLLECTION: 'lib_collection_v1',
  CART: 'lib_cart_v1',
};

type SharedLibraryRow = {
  id: string;
  kind: string;
  name: string;
  quantity?: number;
  data?: any;
  updatedAt?: string;
};

export const LibraryProvider: React.FC<{
  children: React.ReactNode;
  sharedRows?: SharedLibraryRow[];
  embedded?: boolean;
}> = ({ children, sharedRows = [], embedded = false }) => {
  const [books, setBooks] = useState<BookItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [loans, setLoans] = useState<BookLoan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WAITLIST);
    return saved ? JSON.parse(saved) : INITIAL_WAITLIST;
  });

  const [readingLogs, setReadingLogs] = useState<ReadingSessionLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.READING_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_READING_LOGS;
  });

  const [purchaseRequests, setPurchaseRequests] = useState<BookPurchaseRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_REQ);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_REQUESTS;
  });

  const [damageLogs, setDamageLogs] = useState<BookDamageLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAMAGE);
    return saved ? JSON.parse(saved) : INITIAL_DAMAGE_LOGS;
  });

  const [cart, setCart] = useState<CartBookItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [page, setPageState] = useState<AppPage>('login');

  const [selectedCollection, setSelectedCollectionState] = useState<CollectionType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTION);
    return (saved as CollectionType) || 'fiction';
  });

  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.READING_LOGS, JSON.stringify(readingLogs));
  }, [readingLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_REQ, JSON.stringify(purchaseRequests));
  }, [purchaseRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAMAGE, JSON.stringify(damageLogs));
  }, [damageLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE, page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLLECTION, selectedCollection);
  }, [selectedCollection]);

  // Keep the embedded assistant's catalog and circulation view connected to
  // SchoolOS records. Existing assistant records remain intact, while shared
  // books/loans update by source id or title instead of creating duplicates.
  useEffect(() => {
    if (!sharedRows.length) return;
    const sharedBooks = sharedRows.filter((row) => row.kind === 'book');
    const sharedLoans = sharedRows.filter((row) => row.kind === 'loan');
    if (sharedBooks.length) {
      setBooks((current) => {
        const next = [...current];
        for (const row of sharedBooks) {
          const d = row.data || {};
          const index = next.findIndex(
            (book) => book.id === row.id || book.title === row.name,
          );
          const totalCopies = Math.max(0, Number(d.total ?? row.quantity ?? 0));
          const availableCopies = Math.max(
            0,
            Number(row.quantity ?? d.available ?? totalCopies),
          );
          const sharedBook: BookItem = {
            ...(index >= 0 ? next[index] : INITIAL_BOOKS[0]),
            id: row.id,
            title: row.name,
            author: d.author || 'School library collection',
            publisher: d.publisher || 'Westbridge International',
            publishedYear: Number(d.publicationYear || d.publishedYear || new Date().getFullYear()),
            isbn: d.isbn || row.id,
            collection: d.collection === 'fiction' ? 'fiction' : 'academic',
            category: (d.category || d.subject || 'History & Social Sciences') as BookCategory,
            totalCopies: totalCopies || (index >= 0 ? next[index].totalCopies : 1),
            availableCopies,
            location:
              typeof d.location === 'object'
                ? d.location
                : { floor: 'Main floor', wing: 'Library', aisle: d.location || 'General', shelf: '—', callNumber: row.id },
            pageCount: Number(d.pageCount || 0),
            language: d.language || 'English',
            synopsis: d.description || d.synopsis || '',
            tags: Array.isArray(d.tags) ? d.tags : [],
            coverColor: index >= 0 ? next[index].coverColor : '#2f7f9f',
            isAvailableForLoan: availableCopies > 0,
            lastUpdated: row.updatedAt || new Date().toISOString(),
            totalBorrowsCount: Number(d.totalBorrowsCount || (index >= 0 ? next[index].totalBorrowsCount : 0)),
          };
          if (index >= 0) next[index] = sharedBook;
          else next.push(sharedBook);
        }
        return next;
      });
    }
    if (sharedLoans.length) {
      setLoans((current) => {
        const next = [...current];
        for (const row of sharedLoans) {
          const d = row.data || {};
          const index = next.findIndex((loan) => loan.id === row.id);
          const book = sharedBooks.find((candidate) => candidate.id === d.bookId);
          const mapped: BookLoan = {
            ...(index >= 0 ? next[index] : INITIAL_LOANS[0]),
            id: row.id,
            bookId: d.bookId || book?.id || '',
            bookTitle: row.name || book?.name || d.bookTitle || 'Library book',
            bookAuthor: d.bookAuthor || book?.data?.author || '—',
            bookCategory: (d.bookCategory || 'History & Social Sciences') as BookCategory,
            collection: d.collection === 'fiction' ? 'fiction' : 'academic',
            studentName: d.studentName || 'Student',
            studentEmail: d.studentEmail || '',
            studentGrade: d.studentGrade || '',
            borrowDate: d.borrowedAt || d.borrowDate || new Date().toISOString(),
            dueDate: d.dueAt || d.dueDate || new Date().toISOString(),
            status: String(d.status || '').toLowerCase() === 'returned' ? 'returned' : 'active',
            renewCount: Number(d.renewCount || 0),
            maxRenewals: Number(d.maxRenewals || 2),
            issuedByStaff: d.issuedByStaff || d.requestedBy || 'School library',
            notes: d.notes,
          };
          if (index >= 0) next[index] = mapped;
          else next.push(mapped);
        }
        return next;
      });
    }
  }, [sharedRows]);

  // Toast helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Trackpad swipe back & browser history integration
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setPageState(e.state.page);
        if (e.state.collection) {
          setSelectedCollectionState(e.state.collection);
        }
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          setPageState(hash as AppPage);
        } else {
          setPageState('login');
        }
      }
    };

    if (!window.history.state) {
      window.history.replaceState({ page: 'login' }, '', '#login');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation & Collection
  const setPage = (newPage: AppPage) => {
    setPageState(newPage);
    window.history.pushState(
      { page: newPage, collection: selectedCollection },
      '',
      `#${newPage}`
    );
  };

  const setSelectedCollection = (col: CollectionType) => {
    setSelectedCollectionState(col);
    setSelectedCategory('all');
  };

  const navigateTo = (newPage: AppPage, collection?: CollectionType) => {
    const targetCollection = collection || selectedCollection;
    if (collection) {
      setSelectedCollectionState(collection);
      setSelectedCategory('all');
    }
    setPageState(newPage);
    window.history.pushState(
      { page: newPage, collection: targetCollection },
      '',
      `#${newPage}`
    );
  };

  // Auth Operations
  const loginAsStudent = (name: string, email: string, grade: string = 'Grade 11 - Section A') => {
    const user: UserProfile = {
      name: name || 'Rohan Verma',
      email: email || 'rohan.verma@school.edu',
      role: 'student',
      grade,
    };
    setCurrentUser(user);
    setPageState('student-hub');
    if (!embedded)
      window.history.pushState({ page: 'student-hub' }, '', '#student-hub');
    addToast({
      type: 'success',
      title: 'Welcome to Library Assistant!',
      message: `Signed in as ${user.name}. Explore academic textbooks and fiction sagas.`
    });
  };

  const loginAsStaff = (name: string, email: string) => {
    const user: UserProfile = {
      name: name || 'Mrs. Eleanor Vance',
      email: email || 'e.vance@school.edu',
      role: 'staff',
      grade: 'Chief Librarian & Resource Manager',
    };
    setCurrentUser(user);
    setPageState('staff-dashboard');
    if (!embedded)
      window.history.pushState({ page: 'staff-dashboard' }, '', '#staff-dashboard');
    addToast({
      type: 'info',
      title: 'Librarian Console Ready',
      message: `Signed in as ${user.name}. You have full catalog, circulation & waitlist management access.`
    });
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
    setPageState('login');
    if (!embedded) window.history.pushState({ page: 'login' }, '', '#login');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'Returned to the library welcome screen.'
    });
  };

  const userRole: UserRole = currentUser?.role || 'student';

  // Cart operations
  const addToCart = (book: BookItem, durationDays: number = 14) => {
    if (book.availableCopies <= 0) {
      addToast({
        type: 'warning',
        title: 'Book Currently Checked Out',
        message: `"${book.title}" is out of stock. You can join the waitlist instead.`
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.book.id === book.id);
      if (existing) {
        return prev;
      }
      return [...prev, { book, borrowDurationDays: durationDays }];
    });

    addToast({
      type: 'success',
      title: 'Added to Borrow Bag',
      message: `"${book.title}" added to your bag. Click your bag to checkout.`
    });
  };

  const removeFromCart = (bookId: string) => {
    setCart((prev) => prev.filter((ci) => ci.book.id !== bookId));
    addToast({
      type: 'info',
      title: 'Removed from Bag',
      message: 'Book removed from borrow list.'
    });
  };

  const updateCartDuration = (bookId: string, durationDays: number) => {
    setCart((prev) =>
      prev.map((ci) =>
        ci.book.id === bookId ? { ...ci, borrowDurationDays: durationDays } : ci
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Submit Borrow Cart Batch
  const submitCartBorrowRequest = (notes?: string): boolean => {
    if (cart.length === 0) {
      addToast({
        type: 'error',
        title: 'Empty Borrow Bag',
        message: 'Please add books to your bag before checking out.'
      });
      return false;
    }

    const studentName = currentUser?.name || 'Rohan Verma';
    const studentEmail = currentUser?.email || 'rohan.verma@school.edu';
    const studentGrade = currentUser?.grade || 'Grade 11 - Section A';
    const now = new Date();

    const newLoans: BookLoan[] = cart.map((ci, index) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + ci.borrowDurationDays);

      return {
        id: `loan-${Date.now().toString().slice(-4)}${index}`,
        bookId: ci.book.id,
        bookTitle: ci.book.title,
        bookAuthor: ci.book.author,
        bookCategory: ci.book.category,
        collection: ci.book.collection,
        coverColor: ci.book.coverColor,
        seriesName: ci.book.seriesName,
        seriesVolume: ci.book.seriesVolume,
        studentName,
        studentEmail,
        studentGrade,
        borrowDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
        status: 'active',
        renewCount: 0,
        maxRenewals: 2,
        notes: notes || 'Student online borrowing checkout.',
        issuedByStaff: 'Self-Service Kiosk / Librarian Approved',
      };
    });

    // Deduct available copies
    const borrowedBookIds = new Set(cart.map((ci) => ci.book.id));
    setBooks((prev) =>
      prev.map((b) => {
        if (borrowedBookIds.has(b.id)) {
          return {
            ...b,
            availableCopies: Math.max(0, b.availableCopies - 1),
            totalBorrowsCount: b.totalBorrowsCount + 1,
            lastUpdated: new Date().toISOString(),
          };
        }
        return b;
      })
    );

    setLoans((prev) => [...newLoans, ...prev]);
    clearCart();
    setIsCartOpen(false);

    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 }
    });

    addToast({
      type: 'success',
      title: 'Books Checked Out Successfully! 📚',
      message: `You have borrowed ${newLoans.length} title(s). Check "My Reading Journey" to track due dates.`
    });

    return true;
  };

  // Direct 1-Click Borrow
  const borrowBookDirect = (book: BookItem, durationDays: number = 14, notes?: string): boolean => {
    if (book.availableCopies <= 0) {
      addToast({
        type: 'warning',
        title: 'Out of Stock',
        message: `No copies of "${book.title}" are currently on shelf. Please join the waitlist.`
      });
      return false;
    }

    const studentName = currentUser?.name || 'Rohan Verma';
    const studentEmail = currentUser?.email || 'rohan.verma@school.edu';
    const studentGrade = currentUser?.grade || 'Grade 11 - Section A';
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);

    const newLoan: BookLoan = {
      id: `loan-${Date.now().toString().slice(-5)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCategory: book.category,
      collection: book.collection,
      coverColor: book.coverColor,
      seriesName: book.seriesName,
      seriesVolume: book.seriesVolume,
      studentName,
      studentEmail,
      studentGrade,
      borrowDate: now.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'active',
      renewCount: 0,
      maxRenewals: 2,
      notes: notes || 'Direct student checkout.',
      issuedByStaff: 'Librarian Desk / Auto-Issued',
    };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id
          ? {
              ...b,
              availableCopies: Math.max(0, b.availableCopies - 1),
              totalBorrowsCount: b.totalBorrowsCount + 1,
              lastUpdated: new Date().toISOString(),
            }
          : b
      )
    );

    setLoans((prev) => [newLoan, ...prev]);

    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 }
    });

    addToast({
      type: 'success',
      title: 'Book Borrowed Successfully! 📖',
      message: `"${book.title}" is due on ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Happy reading!`
    });

    return true;
  };

  // Waitlist functionality
  const joinWaitlist = (book: BookItem, notes?: string): boolean => {
    const studentName = currentUser?.name || 'Rohan Verma';
    const studentEmail = currentUser?.email || 'rohan.verma@school.edu';
    const studentGrade = currentUser?.grade || 'Grade 11 - Section A';

    // Check if already in waitlist for this book
    const existing = waitlist.find(
      (w) => w.bookId === book.id && w.studentEmail === studentEmail && w.status === 'waiting'
    );
    if (existing) {
      addToast({
        type: 'info',
        title: 'Already on Waitlist',
        message: `You are already position #${existing.queuePosition} in the waitlist for "${book.title}".`
      });
      return false;
    }

    const currentBookWaitlist = waitlist.filter(
      (w) => w.bookId === book.id && w.status === 'waiting'
    );
    const newPosition = currentBookWaitlist.length + 1;

    const newWaitlistEntry: WaitlistEntry = {
      id: `wt-${Date.now().toString().slice(-4)}`,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      collection: book.collection,
      category: book.category,
      studentName,
      studentEmail,
      studentGrade,
      joinedAt: new Date().toISOString(),
      queuePosition: newPosition,
      status: 'waiting',
      notes: notes || 'Student reservation requested.',
    };

    setWaitlist((prev) => [...prev, newWaitlistEntry]);

    addToast({
      type: 'success',
      title: 'Joined Book Waitlist! ⏳',
      message: `You are #${newPosition} in line for "${book.title}". We will notify you when a copy is returned.`
    });

    return true;
  };

  const leaveWaitlist = (waitlistId: string) => {
    const entry = waitlist.find((w) => w.id === waitlistId);
    if (!entry) return;

    setWaitlist((prev) => prev.filter((w) => w.id !== waitlistId));
    addToast({
      type: 'info',
      title: 'Left Waitlist',
      message: `Reservation for "${entry.bookTitle}" has been cancelled.`
    });
  };

  // Reading Tracker Logger
  const logReadingSession = ({
    bookId,
    bookTitle,
    minutesRead,
    startPage,
    endPage,
    totalPages,
    reflections,
    rating,
    completedBook = false,
  }: {
    bookId: string;
    bookTitle: string;
    minutesRead: number;
    startPage: number;
    endPage: number;
    totalPages: number;
    reflections?: string;
    rating?: number;
    completedBook?: boolean;
  }): boolean => {
    if (minutesRead <= 0) {
      addToast({
        type: 'error',
        title: 'Invalid Reading Time',
        message: 'Minutes read must be greater than 0.'
      });
      return false;
    }

    const newLog: ReadingSessionLog = {
      id: `read-${Date.now()}`,
      bookId,
      bookTitle,
      studentEmail: currentUser?.email || 'rohan.verma@school.edu',
      studentName: currentUser?.name || 'Rohan Verma',
      date: new Date().toISOString(),
      minutesRead,
      startPage,
      endPage,
      totalPages,
      reflections,
      rating,
      completedBook,
    };

    setReadingLogs((prev) => [newLog, ...prev]);

    if (completedBook) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });

      addToast({
        type: 'success',
        title: '🎉 Book Completed! Congratulations!',
        message: `You finished "${bookTitle}"! Your reading milestone has been recorded in your journey.`
      });
    } else {
      addToast({
        type: 'success',
        title: 'Reading Progress Saved 📖',
        message: `Logged ${minutesRead} mins (pages ${startPage}-${endPage}) on "${bookTitle}".`
      });
    }

    return true;
  };

  // Return Book
  const returnBook = (loanId: string, returnConditionNotes?: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    // Mark loan returned
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'returned',
              returnedDate: new Date().toISOString(),
              notes: returnConditionNotes ? `${l.notes || ''} | Return note: ${returnConditionNotes}` : l.notes,
            }
          : l
      )
    );

    // Increase available copies in inventory
    setBooks((prev) =>
      prev.map((b) =>
        b.id === targetLoan.bookId
          ? {
              ...b,
              availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
              lastUpdated: new Date().toISOString(),
            }
          : b
      )
    );

    // Check if there is a student waiting on the waitlist
    const nextWaitlistEntry = waitlist
      .filter((w) => w.bookId === targetLoan.bookId && w.status === 'waiting')
      .sort((a, b) => a.queuePosition - b.queuePosition)[0];

    if (nextWaitlistEntry) {
      // Notify the top waitlisted student
      setWaitlist((prev) =>
        prev.map((w) =>
          w.id === nextWaitlistEntry.id
            ? {
                ...w,
                status: 'ready_for_pickup',
                notifiedAt: new Date().toISOString(),
                pickupDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
              }
            : w
        )
      );

      addToast({
        type: 'info',
        title: 'Waitlist Auto-Notification Triggered! 🔔',
        message: `"${targetLoan.bookTitle}" returned. Priority pickup notification sent to ${nextWaitlistEntry.studentName} (Waitlist #1).`
      });
    } else {
      addToast({
        type: 'success',
        title: 'Book Returned to Circulation',
        message: `"${targetLoan.bookTitle}" returned by ${targetLoan.studentName} and placed on shelf.`
      });
    }
  };

  // Renew Loan
  const renewLoan = (loanId: string): boolean => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return false;

    if (targetLoan.renewCount >= targetLoan.maxRenewals) {
      addToast({
        type: 'warning',
        title: 'Maximum Renewals Reached',
        message: 'This loan has already been renewed the maximum allowed times (2x). Please return the book.'
      });
      return false;
    }

    const currentDue = new Date(targetLoan.dueDate);
    const newDue = new Date(currentDue);
    newDue.setDate(newDue.getDate() + 14);

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              dueDate: newDue.toISOString(),
              renewCount: l.renewCount + 1,
              status: 'renewed',
            }
          : l
      )
    );

    addToast({
      type: 'success',
      title: 'Loan Extended (+14 Days)',
      message: `Due date for "${targetLoan.bookTitle}" is now ${newDue.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
    });

    return true;
  };

  // Staff Inventory CRUD
  const addBook = (newBookData: Omit<BookItem, 'id' | 'lastUpdated' | 'totalBorrowsCount'>) => {
    const prefix = newBookData.collection === 'academic' ? 'acad' : 'fic';
    const newBook: BookItem = {
      ...newBookData,
      id: `${prefix}-${Date.now().toString().slice(-4)}`,
      lastUpdated: new Date().toISOString(),
      totalBorrowsCount: 0,
    };
    setBooks((prev) => [newBook, ...prev]);
    addToast({
      type: 'success',
      title: 'Book Cataloged Successfully',
      message: `"${newBook.title}" added to the library catalog.`
    });
  };

  const updateBook = (id: string, updates: Partial<BookItem>) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === id
          ? { ...book, ...updates, lastUpdated: new Date().toISOString() }
          : book
      )
    );
    addToast({
      type: 'success',
      title: 'Catalog Record Updated',
      message: 'Book details have been updated.'
    });
  };

  const deleteBook = (id: string) => {
    const target = books.find((b) => b.id === id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    addToast({
      type: 'warning',
      title: 'Book Removed from Catalog',
      message: `"${target?.title || 'Book'}" was deleted from the library system.`
    });
  };

  // Student Acquisition / Purchase Requests
  const createPurchaseRequest = (
    requestData: Omit<BookPurchaseRequest, 'id' | 'status' | 'createdAt'>
  ) => {
    const newReq: BookPurchaseRequest = {
      ...requestData,
      id: `req-${Date.now().toString().slice(-5)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setPurchaseRequests((prev) => [newReq, ...prev]);
    addToast({
      type: 'success',
      title: 'Book Purchase Request Submitted! 📚',
      message: `Your request for "${requestData.bookTitle}" has been sent to the chief librarian for acquisition review.`
    });
  };

  const updatePurchaseRequestStatus = (
    requestId: string,
    status: PurchaseRequestStatus,
    adminNotes?: string
  ) => {
    setPurchaseRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status,
              adminNotes: adminNotes !== undefined ? adminNotes : req.adminNotes,
              reviewedBy: currentUser?.name || 'Mrs. Eleanor Vance',
            }
          : req
      )
    );

    addToast({
      type: status === 'rejected' ? 'warning' : 'success',
      title: 'Acquisition Request Updated',
      message: `Book purchase request marked as ${status.toUpperCase()}.`
    });
  };

  const deletePurchaseRequest = (requestId: string) => {
    setPurchaseRequests((prev) => prev.filter((r) => r.id !== requestId));
    addToast({
      type: 'info',
      title: 'Request Removed',
      message: 'Purchase proposal removed from queue.'
    });
  };

  // Damage Logger
  const logDamage = ({
    bookId,
    bookTitle,
    collection,
    condition,
    description,
    reportedBy,
    fineAssessed,
    status,
    actionTaken,
  }: {
    bookId: string;
    bookTitle: string;
    collection: CollectionType;
    condition: DamageCondition;
    description: string;
    reportedBy: string;
    fineAssessed?: string;
    status: DamageActionStatus;
    actionTaken: string;
  }): boolean => {
    const newDamage: BookDamageLog = {
      id: `dmg-${Date.now().toString().slice(-4)}`,
      bookId,
      bookTitle,
      collection,
      condition,
      description,
      reportedBy,
      loggedDate: new Date().toISOString(),
      fineAssessed,
      status,
      actionTaken,
    };

    setDamageLogs((prev) => [newDamage, ...prev]);

    // If written off or lost, deduct 1 from total & available copies
    if (status === 'written_off' || condition === 'lost') {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                totalCopies: Math.max(0, b.totalCopies - 1),
                availableCopies: Math.max(0, b.availableCopies - 1),
                lastUpdated: new Date().toISOString(),
              }
            : b
        )
      );
    }

    addToast({
      type: 'warning',
      title: 'Book Damage Incident Logged',
      message: `Recorded "${condition.replace('_', ' ').toUpperCase()}" condition for "${bookTitle}".`
    });

    return true;
  };

  const updateDamageStatus = (id: string, status: DamageActionStatus, actionTaken?: string) => {
    setDamageLogs((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status, actionTaken: actionTaken !== undefined ? actionTaken : d.actionTaken }
          : d
      )
    );

    addToast({
      type: 'info',
      title: 'Damage Record Updated',
      message: `Status updated to ${status.toUpperCase()}.`
    });
  };

  // Reset to default seed data
  const resetToDefaultData = () => {
    setBooks(INITIAL_BOOKS);
    setLoans(INITIAL_LOANS);
    setWaitlist(INITIAL_WAITLIST);
    setReadingLogs(INITIAL_READING_LOGS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setDamageLogs(INITIAL_DAMAGE_LOGS);
    clearCart();
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.WAITLIST);
    localStorage.removeItem(STORAGE_KEYS.READING_LOGS);
    localStorage.removeItem(STORAGE_KEYS.PURCHASE_REQ);
    localStorage.removeItem(STORAGE_KEYS.DAMAGE);
    localStorage.removeItem(STORAGE_KEYS.CART);
    addToast({
      type: 'info',
      title: 'Reset to Clean Data',
      message: 'Restored initial library book catalog and reading records.'
    });
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        loans,
        waitlist,
        readingLogs,
        purchaseRequests,
        damageLogs,
        cart,
        isCartOpen,
        selectedCollection,
        selectedCategory,
        page,
        userRole,
        currentUser,
        toasts,
        searchQuery,
        setSearchQuery,
        setSelectedCollection,
        setSelectedCategory,
        setPage,
        setIsCartOpen,
        navigateTo,
        loginAsStudent,
        loginAsStaff,
        logout,
        addToCart,
        removeFromCart,
        updateCartDuration,
        clearCart,
        submitCartBorrowRequest,
        borrowBookDirect,
        joinWaitlist,
        leaveWaitlist,
        logReadingSession,
        returnBook,
        renewLoan,
        addBook,
        updateBook,
        deleteBook,
        createPurchaseRequest,
        updatePurchaseRequestStatus,
        deletePurchaseRequest,
        logDamage,
        updateDamageStatus,
        addToast,
        removeToast,
        resetToDefaultData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
