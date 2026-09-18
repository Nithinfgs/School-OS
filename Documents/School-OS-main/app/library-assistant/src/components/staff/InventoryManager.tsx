import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookItem, CollectionType } from '../../types/library';
import { BookFormModal } from './BookFormModal';
import { DamageLoggerModal } from './DamageLoggerModal';
import { exportBooksToCsv } from '../../utils/exportCsv';
import { Badge } from '../common/Badge';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  BookOpen, 
  Layers, 
  MapPin 
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { books, deleteBook, updateBook } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'academic' | 'fiction'>('all');
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<BookItem | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedBookForDamage, setSelectedBookForDamage] = useState<BookItem | null>(null);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);

  const filteredBooks = books.filter((book) => {
    if (collectionFilter !== 'all' && book.collection !== collectionFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.toLowerCase().includes(q) ||
        book.publisher.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.location.callNumber.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleOpenAdd = () => {
    setSelectedBookForEdit(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEdit = (book: BookItem) => {
    setSelectedBookForEdit(book);
    setIsBookModalOpen(true);
  };

  const handleAdjustCopies = (book: BookItem, delta: number) => {
    const newTotal = Math.max(1, book.totalCopies + delta);
    const newAvail = Math.max(0, Math.min(newTotal, book.availableCopies + delta));
    updateBook(book.id, {
      totalCopies: newTotal,
      availableCopies: newAvail,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Header */}
      <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search catalog by title, author, ISBN, call #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D7F9F]/30 text-[#1F3547]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          
          <div className="flex items-center bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-1 text-xs">
            <button
              onClick={() => setCollectionFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                collectionFilter === 'all' ? 'bg-white text-[#1F3547] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              All ({books.length})
            </button>
            <button
              onClick={() => setCollectionFilter('academic')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                collectionFilter === 'academic' ? 'bg-white text-[#1F3547] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setCollectionFilter('fiction')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                collectionFilter === 'fiction' ? 'bg-white text-[#1F3547] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Fiction
            </button>
          </div>

          <button
            onClick={() => exportBooksToCsv(filteredBooks)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1F3547] text-xs font-bold rounded-xl border border-[#CBD5E1] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2D7F9F]" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catalog Book</span>
          </button>

        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-5 py-3.5">Title & Subject</th>
                <th className="px-5 py-3.5">Author & Publisher</th>
                <th className="px-5 py-3.5">Shelf Location</th>
                <th className="px-5 py-3.5">Stock & Copies</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredBooks.map((book) => {
                const isOutOfStock = book.availableCopies <= 0;

                return (
                  <tr key={book.id} className="hover:bg-[#F8FAFC] transition-colors">
                    
                    {/* Title & Subject */}
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-[#1F3547] line-clamp-1 max-w-xs">
                        {book.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant={book.collection === 'academic' ? 'academic' : 'fiction'} size="sm">
                          {book.category}
                        </Badge>
                        {book.seriesName && (
                          <span className="text-[9px] font-bold bg-[#FEF3C7] text-[#B45309] px-1.5 py-0.5 rounded">
                            {book.seriesName} {book.seriesVolume ? `(Pt ${book.seriesVolume})` : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Author & Publisher */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#334155]">
                        {book.author}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {book.publisher} ({book.publishedYear})
                      </div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">
                        ISBN: {book.isbn}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-[#334155]">
                        <MapPin className="w-3 h-3 text-[#94A3B8]" />
                        <span>{book.location.floor}, {book.location.aisle}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#1F3547] font-bold mt-0.5">
                        {book.location.callNumber}
                      </div>
                    </td>

                    {/* Copies & Adjustor */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isOutOfStock ? (
                          <Badge variant="error" size="sm" dot>
                            0 of {book.totalCopies} Available
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" dot>
                            {book.availableCopies} of {book.totalCopies} Available
                          </Badge>
                        )}

                        {/* Adjust copy buttons */}
                        <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-0.5">
                          <button
                            onClick={() => handleAdjustCopies(book, -1)}
                            className="px-1.5 py-0.5 font-bold hover:bg-white rounded text-[#475569] cursor-pointer"
                            title="Decrease copy"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleAdjustCopies(book, 1)}
                            className="px-1.5 py-0.5 font-bold hover:bg-white rounded text-[#475569] cursor-pointer"
                            title="Add copy"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedBookForDamage(book);
                            setIsDamageModalOpen(true);
                          }}
                          className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                          title="Log Book Damage / Lost Copy"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(book)}
                          className="p-1.5 text-[#475569] hover:text-[#1F3547] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
                          title="Edit Book Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteBook(book.id)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                          title="Delete from Catalog"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Form Modal */}
      <BookFormModal
        book={selectedBookForEdit}
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setSelectedBookForEdit(null);
        }}
      />

      {/* Damage Logger Modal */}
      <DamageLoggerModal
        initialBook={selectedBookForDamage}
        isOpen={isDamageModalOpen}
        onClose={() => {
          setIsDamageModalOpen(false);
          setSelectedBookForDamage(null);
        }}
      />

    </div>
  );
};
