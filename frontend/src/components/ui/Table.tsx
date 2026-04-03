'use client';

import { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

interface Pagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  pagination?: Pagination;
  className?: string;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onSort,
  pagination,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  return (
    <div className={clsx('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-chamber-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 font-medium text-gray-500 dark:text-chamber-300',
                  col.sortable && 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white',
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 dark:border-chamber-800/50 transition-colors hover:bg-gray-50 dark:hover:bg-chamber-800/40"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-chamber-100">
                  {col.render
                    ? col.render(row)
                    : (row[col.key] as ReactNode) ?? '—'}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400 dark:text-chamber-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-chamber-800 px-4 py-3">
          <span className="text-sm text-gray-500 dark:text-chamber-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="rounded p-1 text-gray-400 dark:text-chamber-400 hover:bg-gray-100 dark:hover:bg-chamber-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="rounded p-1 text-gray-400 dark:text-chamber-400 hover:bg-gray-100 dark:hover:bg-chamber-800 hover:text-gray-900 dark:hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
