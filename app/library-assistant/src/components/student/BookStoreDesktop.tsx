import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookItem, CollectionType, BookCategory, SortOption } from '../../types/library';
import { BookCard } from '../common/BookCard';
import { BookDetailModal } from '../common/BookDetailModal';
import { RequestBookPurchaseModal } from './RequestBookPurchaseModal';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  ArrowUpDown, 
  BookOpen, 
  GraduationCap, 
  Sparkles,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';

export const BookStoreDesktop: React.FC = () => {
  const { 
    books, 
    selectedCollection, 
    setSelectedCollection, 
    navigateTo, 
    searchQuery, 
    setSearchQuery,
    setIsCartOpen,
    cart
  } = useLibrary();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical-asc');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Filter books by collection
  const collectionBooks = books.filter((b) => b.collection === selectedCollection);
  
  // Available categories & series in current collection
  const categories = Array.from(new Set(collectionBooks.map((b) => b.category)));
  const seriesList = Array.from(
    new Set(collectionBooks.map((b) => b.seriesName).filter(Boolean) as string[])
  );

  let filtered = collectionBooks.filter((book) => {
    if (selectedCategory !== 'all' && book.category !== selectedCategory) return false;
    if (selectedSeries !== 'all' && book.seriesName !== selectedSeries) return false;

    if (stockFilter === 'in_stock' && book.availableCopies <= 0) return false;
    if (stockFilter === 'out_of_stock' && book.availableCopies > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      const matchPublisher = book.publisher.toLowerCase().includes(q);
      const matchIsbn = book.isbn.toLowerCase().includes(q);
      const matchSeries = book.seriesName?.toLowerCase().includes(q);
      const matchSynopsis = book.synopsis.toLowerCase().includes(q);
      const matchCategory = book.category.toLowerCase().includes(q);
      const matchCall = book.location.callNumber.toLowerCase().includes(q);
      const matchTags = book.tags.some((t) => t.toLowerCase().includes(q));

      return (
        matchTitle ||
        matchAuthor ||
        matchPublisher ||
        matchIsbn ||
        matchSeries ||
        matchSynopsis ||
        matchCategory ||
        matchCall ||
        matchTags
      );
    }

    return true;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'alphabetical-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'alphabetical-desc') return b.title.localeCompare(a.title);
    if (sortBy === 'availability-desc') return b.availableCopies - a.availableCopies;
    if (sortBy === 'pages-desc') return b.pageCount - a.pageCount;
    if (sortBy === 'pages-asc') return a.pageCount - b.pageCount;
    if (sortBy === 'year-desc') return b.publishedYear - a.publishedYear;
    if (sortBy === 'series-order') {
      const seriesCompare = (a.seriesName || '').localeCompare(b.seriesName || '');
      if (seriesCompare !== 0) return seriesCompare;
      return (a.seriesVolume || 0) - (b.seriesVolume || 0);
    }
    return 0;
  });

  const portalConfig = {
    academic: {
      name: 'Academic & DP Library Portal',
      icon: <GraduationCap className="w-5 h-5 text-[#2B7796]" />,
      badge: 'bg-[#E9F3F6] text-[#2B7796] border-[#C6E2EA]',
      subtext: 'Syllabus Coursebooks, Science Practicals & Exam Guides',
    },
    fiction: {
      name: 'Fiction & Non-Fiction Portal',
      icon: <Sparkles className="w-5 h-5 text-[#1E7492]" />,
      badge: 'bg-[#EAF5F7] text-[#1E7492] border-[#C8E7ED]',
      subtext: 'Percy Jackson Sagas, Sci-Fi, Classics & Non-Fiction',
    },
  }[selectedCollection];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
      
      {/* Top Breadcrumb & Portal Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('student-hub')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#1F3547] hover:bg-[#F8FAFC] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D7F9F]" />
            <span>Back to Portals</span>
          </button>

          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl border ${portalConfig.badge}`}>
              {portalConfig.icon}
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F3547] tracking-tight leading-tight">
                {portalConfig.name}
              </h1>
              <p className="text-[11px] text-[#64748B]">
                {portalConfig.subtext}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Portal Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-2xl border border-[#E2E8F0]">
          {(['fiction', 'academic'] as CollectionType[]).map((col) => {
            const isActive = selectedCollection === col;
            const names = {
              academic: 'Academic & DP',
              fiction: 'Fiction & Non-Fiction'
            };
            const icons = {
              academic: <GraduationCap className="w-3.5 h-3.5" />,
              fiction: <Sparkles className="w-3.5 h-3.5" />
            };

            return (
              <button
                key={col}
                onClick={() => {
                  setSelectedCollection(col);
                  setSelectedCategory('all');
                  setSelectedSeries('all');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2D7F9F] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#1F3547]'
                }`}
              >
                {icons[col]}
                <span>{names[col]}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Store Desktop Filter & Search Box */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        
        {/* Row 1: Search, Sort Dropdown & Top-Right Requisition / Cart Triggers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder={`Search ${selectedCollection === 'academic' ? 'Chemistry, Physics, Calculus, Authors...' : 'Percy Jackson, Sci-Fi, Classics, ISBN...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 focus:border-[#2D7F9F] text-[#1F3547]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-[#1F3547] bg-[#E2E8F0] px-1.5 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Controls: Sort + Cart + Request to Buy */}
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-xs font-semibold text-[#64748B]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold bg-transparent text-[#1F3547] focus:outline-none cursor-pointer"
              >
                <option value="alphabetical-asc">Title: A to Z</option>
                <option value="alphabetical-desc">Title: Z to A</option>
                <option value="availability-desc">Available Copies (High to Low)</option>
                <option value="pages-desc">Page Count (Longest First)</option>
                <option value="pages-asc">Page Count (Shortest First)</option>
                <option value="year-desc">Publication Year (Newest First)</option>
                <option value="series-order">Series Order (Volume 1-5)</option>
              </select>
            </div>

            {/* View Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1F3547] text-xs font-bold rounded-xl border border-[#CBD5E1] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#2D7F9F]" />
              <span>Bag ({cart.length})</span>
            </button>

            {/* Request Book Button */}
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2D7F9F] hover:bg-[#236F91] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-[#2D7F9F]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Request Book</span>
            </button>

          </div>
        </div>

        {/* Row 2: Category & Series Filter Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
          
          {/* Subject / Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex-shrink-0 mr-1">
              Subjects:
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#253B53] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              All Subjects ({collectionBooks.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#253B53] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Stock Filter Dropdown */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl px-3 py-1.5 text-[#1F3547] focus:outline-none cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Waitlist Only (0 Copies)</option>
            </select>
          </div>

        </div>

        {/* Row 3: Series Filter (Only shown if series exist, e.g. Fiction) */}
        {seriesList.length > 0 && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#F1F5F9] overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex-shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Series:</span>
            </span>
            <button
              onClick={() => setSelectedSeries('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedSeries === 'all'
                  ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              All Series
            </button>
            {seriesList.map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSeries === series
                    ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              >
                {series}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
        <span>
          Showing <strong className="text-[#1F3547] font-bold">{filtered.length}</strong> books in {portalConfig.name}
        </span>
        <span className="hidden sm:inline">
          Click <strong>"Borrow Now"</strong> or <strong>"+ Add to Bag"</strong> for multi-book checkout.
        </span>
      </div>

      {/* Grid of Books */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1F3547]">
            No books found matching your criteria
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1 mb-4">
            Could not find "{searchQuery}" in {portalConfig.name}. You can submit a request for the library to add it to the catalog!
          </p>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-5 py-2.5 text-xs font-bold bg-[#2D7F9F] hover:bg-[#236F91] text-white rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Request "{searchQuery || 'Missing Book'}"
          </button>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.04 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((book) => (
            <motion.div
              key={book.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
            >
              <BookCard
                book={book}
                onSelect={(b) => setSelectedBook(b)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      {/* Purchase Request Modal */}
      <RequestBookPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

    </div>
  );
};
