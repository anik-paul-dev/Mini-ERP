import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { Product, PaginatedResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

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
          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
            {item.image ? (
              <img className="h-10 w-10 object-cover" src={item.image} alt="" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center text-gray-400">No img</div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-gray-500 text-xs">SKU: {item.sku}</div>
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.stockQuantity > 10 ? 'bg-green-100 text-green-800' : 
          item.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
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
        <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
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
