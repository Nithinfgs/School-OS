import React from 'react';
import { BookItem } from '../../types/library';
import { useLibrary } from '../../context/LibraryContext';
import { Badge } from './Badge';
import { 
  BookOpen, 
  MapPin, 
  Plus, 
  Hourglass, 
  Layers, 
  Star,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface BookCardProps {
  book: BookItem;
  onSelect: (book: BookItem) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const { addToCart, borrowBookDirect, joinWaitlist, userRole } = useLibrary();

  const isOutOfStock = book.availableCopies <= 0;

  return (
    <div
      onClick={() => onSelect(book)}
      className="group relative bg-white rounded-3xl border border-[#E2E8F0] hover:border-[#CBD5E1] p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Top Section: Cover Banner & Series Tag */}
      <div>
        <div className="flex items-start gap-4">
          
          {/* Stylized Book Cover Thumbnail */}
          <div 
            className="w-16 h-22 rounded-xl flex-shrink-0 flex flex-col justify-between p-2 text-white shadow-md relative overflow-hidden transition-transform group-hover:scale-105"
            style={{ backgroundColor: book.coverColor || '#253B53' }}
          >
            <div className="flex justify-between items-start">
              {book.collection === 'academic' ? (
                <GraduationCap className="w-3.5 h-3.5 opacity-80" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 opacity-80" />
              )}
              {book.rating && (
                <div className="flex items-center gap-0.5 text-[9px] font-bold bg-black/30 px-1 rounded">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                  <span>{book.rating}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-[9px] font-extrabold line-clamp-2 leading-tight drop-shadow-sm">
                {book.title}
              </p>
              <p className="text-[7px] opacity-75 truncate mt-0.5">
                {book.author}
              </p>
            </div>

            {/* Subtle Spine accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20" />
          </div>

          {/* Book Header Meta */}
          <div className="flex-1 min-w-0">
            
            {/* Series & Part Badge if applicable */}
            {book.seriesName ? (
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                  <Layers className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[140px]">{book.seriesName}</span>
                  {book.seriesVolume && <span>• Part {book.seriesVolume}</span>}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mb-1.5">
                <Badge 
                  variant={book.collection === 'academic' ? 'academic' : 'fiction'} 
                  size="sm"
                >
                  {book.category}
                </Badge>
              </div>
            )}

            <h3 className="text-sm font-extrabold text-[#1F3547] leading-tight line-clamp-2 group-hover:text-[#2D7F9F] transition-colors">
              {book.title}
            </h3>

            <p className="text-xs text-[#64748B] mt-1 truncate">
              By <span className="font-semibold text-[#334155]">{book.author}</span>
            </p>

            <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
              {book.publisher} ({book.publishedYear}) {book.edition && `• ${book.edition}`}
            </p>
          </div>
        </div>

        {/* Synopsis Snippet */}
        <p className="text-xs text-[#64748B] line-clamp-2 mt-3 leading-relaxed">
          {book.synopsis}
        </p>
      </div>

      {/* Middle: Shelf Location & Reading Stats */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] space-y-2">
        
        {/* Location & Page Count */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
            <span className="truncate">{book.location.floor}, {book.location.aisle}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>{book.pageCount} pages</span>
          </div>
        </div>

        {/* Stock Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isOutOfStock ? (
              <Badge variant="warning" size="sm" dot>
                Out of Stock (0/{book.totalCopies})
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                In Stock ({book.availableCopies}/{book.totalCopies} Available)
              </Badge>
            )}
          </div>

          <span className="text-[10px] font-mono text-[#94A3B8] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
            {book.location.callNumber}
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons for Students */}
      {userRole === 'student' && (
        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isOutOfStock ? (
            <button
              onClick={() => joinWaitlist(book)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>Join Waitlist</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => borrowBookDirect(book)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#2D7F9F] hover:bg-[#236F91] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Borrow Now</span>
              </button>

              <button
                onClick={() => addToCart(book)}
                className="p-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] rounded-xl transition-colors cursor-pointer"
                title="Add to Borrow Bag"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
