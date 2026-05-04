"use client";

import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Loader2
} from "lucide-react";

interface Column {
  header: string;
  accessor: string;
  render?: (row: any) => React.ReactNode;
}

interface CommonTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  totalRecords: number;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  searchPlaceholder?: string;
}

export default function CommonTable({
  columns,
  data,
  isLoading,
  totalRecords,
  currentPage,
  limit,
  onPageChange,
  onSearch,
  searchPlaceholder = "Search records..."
}: CommonTableProps) {
  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text"
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-gray-50 border-none rounded-2xl px-12 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-3xl border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading records...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No records found</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 text-sm font-medium text-gray-700">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-900">{Math.min(data.length, limit)}</span> of <span className="text-gray-900">{totalRecords}</span> records
        </p>
        
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Simple pagination logic: show current, first, last, and neighbors
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                      currentPage === pageNum 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 || 
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum} className="text-gray-300">...</span>;
              }
              return null;
            })}
          </div>

          <button 
            disabled={currentPage === totalPages || totalPages === 0 || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
