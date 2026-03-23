import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

interface ComboboxProps {
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  onSearch: (query: string) => Promise<any[]>;
  onSelect: (item: any) => void;
  renderItem?: (item: any) => React.ReactNode;
  getDisplayValue: (item: any) => string;
  error?: string;
  initialValue?: string;
  onFocus?: () => void;
  direction?: string;
}

const Combobox: React.FC<ComboboxProps> = ({
  label,
  icon,
  placeholder,
  onSearch,
  onSelect,
  renderItem,
  getDisplayValue,
  error,
  initialValue = '',
  onFocus: onFocusProp,
  direction = 'down',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (hasTyped && debouncedQuery.trim()) {
      fetchResults(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const fetchResults = async (q: string) => {
    setIsLoading(true);
    try {
      const data = await onSearch(q);
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Combobox search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setHasTyped(true);
    if (!e.target.value.trim()) {
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setQuery(getDisplayValue(item));
    onSelect(item);
    setIsOpen(false);
    setHasTyped(false);
  };

  const highlightMatch = (text: string, match: string) => {
    if (!match.trim()) return text;
    const parts = text.split(new RegExp(`(${match})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === match.toLowerCase() ? (
            <strong key={i} className="text-primary font-bold">
              {part}
            </strong>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-1 w-full relative" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          {icon} {label}
        </label>
      )}
      <div className="relative group">
        <div
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors`}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full py-3 pl-11 pr-4 bg-gray-50 border-2 rounded-xl outline-none transition-all duration-300
                        ${error ? 'border-red-400 focus:border-red-500 bg-red-50/30' : 'border-transparent focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/10'}`}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
            onFocusProp?.();
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSelect(null);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute left-0 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto animate-in fade-in duration-200 custom-scrollbar ${direction === 'up' ? 'bottom-[calc(100%+8px)] slide-in-from-bottom-2' : 'top-[calc(100%+8px)] slide-in-from-top-2'}`}
        >
          {results.length > 0 ? (
            results.map((item, index) => (
              <div
                key={item._id || index}
                onClick={() => handleSelectItem(item)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 transition-colors"
              >
                {renderItem ? renderItem(item) : highlightMatch(getDisplayValue(item), query)}
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 text-sm italic">Không tìm thấy kết quả nào</div>
          )}
        </div>
      )}
      {error && <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>}
    </div>
  );
};

export default Combobox;
