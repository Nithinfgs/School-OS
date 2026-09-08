import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookItem, CollectionType, BookCategory } from '../../types/library';
import { X, BookPlus, Save, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookFormModalProps {
  book?: BookItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  book,
  isOpen,
  onClose,
}) => {
  const { addBook, updateBook } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState<number>(2023);
  const [isbn, setIsbn] = useState('');
  const [edition, setEdition] = useState('');
  const [collection, setCollection] = useState<CollectionType>('academic');
  const [category, setCategory] = useState<BookCategory>('Chemistry');
  const [seriesName, setSeriesName] = useState('');
  const [seriesVolume, setSeriesVolume] = useState<number | undefined>(undefined);
  const [totalCopies, setTotalCopies] = useState<number>(5);
  const [availableCopies, setAvailableCopies] = useState<number>(5);
  const [pageCount, setPageCount] = useState<number>(350);
  const [readingLevel, setReadingLevel] = useState('Grade 11-12 / IB DP');
  const [synopsis, setSynopsis] = useState('');
  const [tags, setTags] = useState('');
  const [coverColor, setCoverColor] = useState('#2B7796');

  // Location
  const [floor, setFloor] = useState('Floor 2');
  const [wing, setWing] = useState('Science Wing');
  const [aisle, setAisle] = useState('Aisle 3');
  const [shelf, setShelf] = useState('Shelf B-1');
  const [callNumber, setCallNumber] = useState('540.00 CHE-23');

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setPublisher(book.publisher);
      setPublishedYear(book.publishedYear);
      setIsbn(book.isbn);
      setEdition(book.edition || '');
      setCollection(book.collection);
      setCategory(book.category);
      setSeriesName(book.seriesName || '');
      setSeriesVolume(book.seriesVolume);
      setTotalCopies(book.totalCopies);
      setAvailableCopies(book.availableCopies);
      setPageCount(book.pageCount);
      setReadingLevel(book.readingLevel || '');
      setSynopsis(book.synopsis);
      setTags(book.tags.join(', '));
      setCoverColor(book.coverColor || '#253B53');
      setFloor(book.location.floor);
      setWing(book.location.wing);
      setAisle(book.location.aisle);
      setShelf(book.location.shelf);
      setCallNumber(book.location.callNumber);
    } else {
      setTitle('');
      setAuthor('');
      setPublisher('');
      setPublishedYear(2024);
      setIsbn('');
      setEdition('');
      setCollection('academic');
      setCategory('Chemistry');
      setSeriesName('');
      setSeriesVolume(undefined);
      setTotalCopies(5);
      setAvailableCopies(5);
      setPageCount(350);
      setReadingLevel('Grade 11-12 / IB DP');
      setSynopsis('');
      setTags('');
      setCoverColor('#2B7796');
      setFloor('Floor 2');
      setWing('Science Wing');
      setAisle('Aisle 3');
      setShelf('Shelf B-1');
      setCallNumber('540.00 CHE-24');
    }
  }, [book, isOpen]);

  const academicCategories: BookCategory[] = [
    'Chemistry',
    'Physics',
    'Biology',
    'Mathematics',
    'Computer Science',
    'Economics & Business',
    'History & Social Sciences',
    'IB DP & AP Guides',
  ];

  const fictionCategories: BookCategory[] = [
    'Fantasy & Mythology',
    'Sci-Fi & Dystopian',
    'Classics & World Literature',
    'Mystery & Thriller',
    'Young Adult & Contemporary',
    'Graphic Novels & Manga',
  ];

  const handleCollectionChange = (newCol: CollectionType) => {
    setCollection(newCol);
    if (newCol === 'academic') {
      setCategory('Chemistry');
      setCoverColor('#2B7796');
    } else {
      setCategory('Fantasy & Mythology');
      setCoverColor('#2D7F9F');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const bookData = {
      title,
      author,
      publisher,
      publishedYear,
      isbn: isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      edition: edition || undefined,
      collection,
      category,
      seriesName: seriesName || undefined,
      seriesVolume: seriesVolume ? Number(seriesVolume) : undefined,
      totalCopies: Number(totalCopies),
      availableCopies: Number(availableCopies),
      pageCount: Number(pageCount),
      readingLevel: readingLevel || undefined,
      language: 'English',
      synopsis,
      tags: parsedTags,
      coverColor,
      isAvailableForLoan: true,
      location: {
        floor,
        wing,
        aisle,
        shelf,
        callNumber,
      },
      rating: book?.rating || 4.8,
    };

    if (book) {
      updateBook(book.id, bookData);
    } else {
      addBook(bookData);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 bg-[#253B53] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-white">
                <BookPlus className="w-5 h-5 text-[#2D7F9F]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  {book ? 'Edit Catalog Record' : 'Catalog New Book'}
                </h3>
                <p className="text-xs text-white/70">
                  Update inventory, classification, copies & shelf coordinates
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Collection & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Collection Portal *
                </label>
                <select
                  value={collection}
                  onChange={(e) => handleCollectionChange(e.target.value as CollectionType)}
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547] cursor-pointer"
                >
                  <option value="academic">Academic & DP Textbooks</option>
                  <option value="fiction">Fiction Sagas & Literature</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Subject / Genre *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BookCategory)}
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547] cursor-pointer"
                >
                  {(collection === 'academic' ? academicCategories : fictionCategories).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title & Author */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                placeholder="e.g. The Lightning Thief, IB Chemistry HL Guide..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Primary Author *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rick Riordan, Steve Owen"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Publisher *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge, Disney-Hyperion"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                  required
                />
              </div>
            </div>

            {/* Series & Part (Percy Jackson, etc.) */}
            <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Series Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Percy Jackson & the Olympians"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Series Volume / Part #
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 1, 2, 3..."
                  value={seriesVolume || ''}
                  onChange={(e) => setSeriesVolume(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                />
              </div>
            </div>

            {/* Copies & Stock Count */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Total Copies
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalCopies}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalCopies(val);
                    if (availableCopies > val) setAvailableCopies(val);
                  }}
                  className="w-full text-xs font-bold px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Available Copies
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalCopies}
                  value={availableCopies}
                  onChange={(e) => setAvailableCopies(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Page Count
                </label>
                <input
                  type="number"
                  min={10}
                  value={pageCount}
                  onChange={(e) => setPageCount(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:outline-none text-[#1F3547]"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
                Library Location & Call Number
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Floor (e.g. Floor 2)"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Wing (e.g. Science Wing)"
                  value={wing}
                  onChange={(e) => setWing(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Aisle (e.g. Aisle 3)"
                  value={aisle}
                  onChange={(e) => setAisle(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Shelf (e.g. Shelf B-1)"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-white border border-[#CBD5E1] rounded-lg"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Call Number (e.g. 540.76 OWE-23)"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-[#CBD5E1] rounded-lg"
                required
              />
            </div>

            {/* Synopsis */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                Book Synopsis / Summary *
              </label>
              <textarea
                rows={3}
                placeholder="Summary of syllabus topics covered or plot description..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                required
              />
            </div>

            {/* Tags & Cover Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="IB DP, Greek Mythology, Calculus..."
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none text-[#1F3547]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Cover Theme Color
                </label>
                <input
                  type="color"
                  value={coverColor}
                  onChange={(e) => setCoverColor(e.target.value)}
                  className="w-full h-10 p-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl cursor-pointer"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-[#2D7F9F]/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{book ? 'Update Catalog Record' : 'Save & Catalog Book'}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
