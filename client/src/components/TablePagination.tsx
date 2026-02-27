import { ChevronLeft, ChevronRight } from 'lucide-react';

const TablePagination = ({
  totalPages,
  page,
  setPage,
  limit,
  setLimit,
}: {
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
}) => {
  return (
    <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-sm rounded-b-xl text-[var(--color-text-secondary)]">
      <div className="flex items-center gap-2 ">
        <span>Số dòng trong trang:</span>
        <select
          className="bg-transparent border rounded p-1 focus:outline-none"
          defaultValue={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
      </div>
      <div className="flex items-center gap-6">
        <span>
          {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button
            className="p-1.5 hover:bg-white rounded border border-gray-300 disabled:opacity-50 text-[var(--color-text-main)]"
            disabled={page === 1}
            onClick={() => setPage(Math.max(1, page - 1))}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="p-1.5 hover:bg-white rounded border border-gray-300 text-[var(--color-text-main)]"
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
