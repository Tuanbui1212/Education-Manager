import { Search } from 'lucide-react';
import { memo } from 'react';

const SearchInput = ({
  type,
  placeholder,
  value,
  setSearchInput,
  setPage,
}: {
  type: string;
  placeholder: string;
  value: string;
  setSearchInput: (value: string) => void;
  setPage: (page: number) => void;
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-2.5 text-[var(--color-text-secondary)]" size={18} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => (setSearchInput(e.target.value), setPage(1))}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all bg-white"
      />
    </div>
  );
};

export default memo(SearchInput);
