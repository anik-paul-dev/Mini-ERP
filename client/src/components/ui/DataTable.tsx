import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}

function DataTable<T>({ columns, data, isLoading, emptyMessage = 'No data available', keyExtractor }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full flex flex-col justify-center items-center p-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, index) => (
                <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {col.cell ? col.cell(item) : (item[col.accessor as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

