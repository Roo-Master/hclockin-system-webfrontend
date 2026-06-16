import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface TableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T = any>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
        <div className="animate-pulse">
          <div className="h-12 bg-page" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface border-t border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border p-12 text-center text-text-secondary', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-page">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={cn(
                  'hover:bg-page/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-text-primary',
                      column.className
                    )}
                  >
                    {column.accessor ? column.accessor(row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
