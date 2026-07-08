import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { PaginatedResponse } from '../../types';
import { formatDate } from '../../utils/helpers';
import { Activity as ActivityIcon } from 'lucide-react';

interface Activity {
  publicId: string;
  action: 'create' | 'update' | 'delete';
  entityType: string;
  entityName: string;
  performerName: string;
  details: string;
  createdAt: string;
}

const ActivityLog = () => {
  const { get } = useApi();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchActivities = () => {
    return get<PaginatedResponse<Activity>>(`/activities?page=${page}&limit=15${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['activities', page, searchTerm],
    queryFn: fetchActivities,
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'update':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'delete':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-surface-700 text-slate-300 border-surface-600';
    }
  };

  const columns = [
    { 
      header: 'Action', 
      accessor: 'action',
      cell: (item: Activity) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getActionColor(item.action)} uppercase`}>
          {item.action}
        </span>
      )
    },
    { 
      header: 'Type', 
      accessor: 'entityType',
      cell: (item: Activity) => <span className="capitalize text-slate-300">{item.entityType}</span>
    },
    { 
      header: 'Entity Name', 
      accessor: 'entityName',
      cell: (item: Activity) => <span className="font-medium text-slate-100">{item.entityName}</span>
    },
    { header: 'Performed By', accessor: 'performerName' },
    { 
      header: 'Details', 
      accessor: 'details',
      cell: (item: Activity) => <span className="text-surface-400 text-sm">{item.details}</span>
    },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      cell: (item: Activity) => formatDate(item.createdAt)
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <ActivityIcon className="mr-3 text-brand-400" size={24} />
          System Activity Log
        </h1>
      </div>

      <div className="card">
        <div className="p-4 border-b border-surface-700/50 bg-surface-800/50">
          <SearchBar onSearch={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Search activities..." />
        </div>
        
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          keyExtractor={(item) => item.publicId}
          emptyMessage="No activities found."
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

export default ActivityLog;
