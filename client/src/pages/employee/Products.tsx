import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { Product, PaginatedResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Package } from 'lucide-react';

const Products = () => {
  const { get } = useApi();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = () => {
    return get<PaginatedResponse<Product>>(`/products?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['employeeProducts', page, searchTerm],
    queryFn: fetchProducts,
  });

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      cell: (item: Product) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-surface-700 rounded-lg overflow-hidden border border-surface-600">
            {item.image ? (
              <img className="h-10 w-10 object-cover" src={item.image} alt="" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center text-surface-400">
                <Package size={20} />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-slate-100">{item.name}</div>
            <div className="text-surface-400 text-xs">SKU: {item.sku}</div>
          </div>
        </div>
      )
    },
    { header: 'Category', accessor: 'category' },
    { 
      header: 'Price', 
      accessor: 'sellingPrice',
      cell: (item: Product) => formatCurrency(item.sellingPrice)
    },
    { 
      header: 'Stock', 
      accessor: 'stockQuantity',
      cell: (item: Product) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          item.stockQuantity > 10 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
          item.stockQuantity > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {item.stockQuantity}
        </span>
      )
    },
    { 
      header: 'Added', 
      accessor: 'createdAt',
      cell: (item: Product) => formatDate(item.createdAt).split(',')[0]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Products Catalog</h1>
      </div>

      <div className="card">
        <div className="p-4 border-b border-surface-700/50 bg-surface-800/50">
          <SearchBar onSearch={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Search products by name, SKU..." />
        </div>
        
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          keyExtractor={(item) => item.publicId}
          emptyMessage="No products found."
        />
        
        {data?.meta && (
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Products;
