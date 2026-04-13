import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
    <div
      className="px-5 py-3.5 border-t bg-gray-50 flex justify-between items-center
      text-sm rounded-b-2xl text-[var(--color-text-secondary)]"
    >
      {/* Số dòng / trang */}
      <div className="flex items-center gap-2">
        <span>Số dòng:</span>
        <select
          className="bg-white border border-gray-200 rounded-lg px-2 py-1
            focus:outline-none focus:border-primary text-[var(--color-text-main)]
            cursor-pointer text-sm"
          value={limit}
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

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <span className="text-gray-500">
          Trang <span className="font-semibold text-[var(--color-text-main)]">{page}</span>
          {' / '}
          <span className="font-semibold text-[var(--color-text-main)]">{totalPages || 1}</span>
        </span>

        <div className="flex gap-1">
          {/* Về trang đầu */}
          <button
            title="Trang đầu"
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white
              hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
              text-[var(--color-text-main)] transition-colors"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Trang trước */}
          <button
            title="Trang trước"
            disabled={page === 1}
            onClick={() => setPage(Math.max(1, page - 1))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white
              hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
              text-[var(--color-text-main)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Trang sau */}
          <button
            title="Trang sau"
            disabled={page >= totalPages}
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white
              hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
              text-[var(--color-text-main)] transition-colors"
          >
            <ChevronRight size={16} />
          </button>

          {/* Về trang cuối */}
          <button
            title="Trang cuối"
            disabled={page >= totalPages}
            onClick={() => setPage(totalPages)}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white
              hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed
              text-[var(--color-text-main)] transition-colors"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
