import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import SearchBar from '../../components/ui/SearchBar';
import { erpResources, ErpField, ErpResourceKey } from '../../data/erpModules';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { PaginatedResponse, Supplier } from '../../types';

type FormState = Record<string, any>;

const dateInputValue = (value: string | undefined) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const createBlankRow = (type: ErpField['type']) => {
  if (type === 'purchaseItems') return { itemName: '', quantity: 1, unitCost: 0 };
  return { title: '', assigneeName: '', dueDate: dateInputValue(new Date().toISOString()), status: 'todo' };
};

const normalizeForm = (values: FormState) => {
  const normalized = { ...values };
  Object.keys(normalized).forEach((key) => {
    if (normalized[key] === '') delete normalized[key];
  });
  return normalized;
};

const ErpResourcePage = () => {
  const location = useLocation();
  const resource = location.pathname.split('/').filter(Boolean).pop() as ErpResourceKey;
  const config = erpResources[resource] || erpResources.suppliers;
  const { hasPermission } = useAuth();
  const { get, post, put, patch, del } = useApi();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<FormState>({});

  const canCreate = config.allowCreate && hasPermission(`${config.permission}:create`);
  const canEdit = config.allowEdit && hasPermission(`${config.permission}:update`);
  const canDelete = config.allowDelete && hasPermission(`${config.permission}:delete`);

  const { data, isLoading } = useQuery({
    queryKey: [config.key, page, searchTerm],
    queryFn: () => get<PaginatedResponse<any>>(`${config.endpoint}?page=${page}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`),
  });

  const { data: suppliers } = useQuery({
    queryKey: ['resourceSuppliersForPurchase'],
    queryFn: () => get<PaginatedResponse<Supplier>>('/suppliers?page=1&limit=100'),
    enabled: config.key === 'purchases',
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: FormState) => {
      if (config.key === 'inquiries' && editingItem) {
        return patch(`${config.endpoint}/${editingItem.publicId}/status`, { status: payload.status }, {
          showSuccessToast: true,
          successMessage: 'Inquiry updated',
        });
      }

      if (editingItem) {
        return put(`${config.endpoint}/${editingItem.publicId}`, payload, {
          showSuccessToast: true,
          successMessage: `${config.title.slice(0, -1)} updated`,
        });
      }

      return post(config.endpoint, payload, {
        showSuccessToast: true,
        successMessage: `${config.title.slice(0, -1)} created`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.key] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`${config.endpoint}/${id}`, { showSuccessToast: true, successMessage: 'Record deleted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.key] });
      setDeletingItem(null);
    },
  });

  useEffect(() => {
    closeModal();
    setPage(1);
    setSearchTerm('');
  }, [config.key]);

  const supplierOptions = useMemo(() => {
    return (suppliers?.data || []).map((supplier) => ({ label: `${supplier.name} (${supplier.category})`, value: supplier.publicId }));
  }, [suppliers]);

  const openCreate = () => {
    const initialValues = config.fields.reduce<FormState>((acc, field) => {
      if (field.type === 'purchaseItems' || field.type === 'projectTasks') acc[field.name] = [createBlankRow(field.type)];
      else if (field.type === 'date') acc[field.name] = dateInputValue(new Date().toISOString());
      else if (field.options?.[0]) acc[field.name] = field.options[0].value;
      else acc[field.name] = '';
      return acc;
    }, {});
    setFormValues(initialValues);
    setEditingItem(null);
  };

  const openEdit = (item: any) => {
    const initialValues = config.fields.reduce<FormState>((acc, field) => {
      if (field.type === 'date') acc[field.name] = dateInputValue(item[field.name]);
      else if (field.type === 'purchaseItems' || field.type === 'projectTasks') acc[field.name] = item[field.name]?.length ? item[field.name] : [createBlankRow(field.type)];
      else acc[field.name] = item[field.name] ?? '';
      return acc;
    }, {});
    setFormValues(initialValues);
    setEditingItem(item);
  };

  const closeModal = () => {
    setFormValues({});
    setEditingItem(null);
  };

  const isModalOpen = Object.keys(formValues).length > 0;

  const updateArrayRow = (fieldName: string, index: number, key: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].map((row: any, rowIndex: number) => rowIndex === index ? { ...row, [key]: value } : row),
    }));
  };

  const addArrayRow = (field: ErpField) => {
    setFormValues((prev) => ({
      ...prev,
      [field.name]: [...(prev[field.name] || []), createBlankRow(field.type)],
    }));
  };

  const removeArrayRow = (fieldName: string, index: number) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_: any, rowIndex: number) => rowIndex !== index),
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload = normalizeForm(formValues);
    if (config.key === 'purchases' && !payload.supplierPublicId && supplierOptions[0]) {
      payload.supplierPublicId = supplierOptions[0].value;
    }
    saveMutation.mutate(payload);
  };

  const columns = [
    ...config.columns.map((column) => ({
      header: column.header,
      accessor: column.header,
      cell: (item: any) => (
        <span className={column.tone ? column.tone(item) : undefined}>
          {column.cell(item)}
        </span>
      ),
    })),
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          {canEdit && (
            <button type="button" onClick={() => openEdit(item)} className="text-brand-400 hover:text-brand-300" title="Edit">
              <Edit2 size={17} />
            </button>
          )}
          {canDelete && (
            <button type="button" onClick={() => setDeletingItem(item)} className="text-rose-400 hover:text-rose-300" title="Delete">
              <Trash2 size={17} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderField = (field: ErpField) => {
    const options = field.name === 'supplierPublicId' && supplierOptions.length > 0 ? supplierOptions : field.options;
    const commonClasses = 'mt-1 input-field';

    if (field.type === 'textarea') {
      return (
        <textarea
          className={`${commonClasses} min-h-24`}
          value={formValues[field.name] || ''}
          required={field.required}
          onChange={(event) => setFormValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select
          className={commonClasses}
          value={formValues[field.name] || options?.[0]?.value || ''}
          required={field.required}
          onChange={(event) => setFormValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
        >
          {options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
    }

    if (field.name === 'supplierPublicId' && supplierOptions.length > 0) {
      return (
        <select
          className={commonClasses}
          value={formValues[field.name] || supplierOptions[0]?.value || ''}
          required
          onChange={(event) => setFormValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
        >
          <option value="">Select supplier</option>
          {supplierOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
    }

    if (field.type === 'purchaseItems') {
      return (
        <div className="mt-2 space-y-3">
          {(formValues[field.name] || []).map((row: any, index: number) => (
            <div key={index} className="grid gap-3 rounded-lg border border-surface-700 bg-surface-900/60 p-3 md:grid-cols-[1fr_100px_120px_auto]">
              <input className="input-field" placeholder="Item name" value={row.itemName} onChange={(event) => updateArrayRow(field.name, index, 'itemName', event.target.value)} required />
              <input className="input-field" type="number" min="1" placeholder="Qty" value={row.quantity} onChange={(event) => updateArrayRow(field.name, index, 'quantity', event.target.value)} required />
              <input className="input-field" type="number" min="0" step="0.01" placeholder="Unit cost" value={row.unitCost} onChange={(event) => updateArrayRow(field.name, index, 'unitCost', event.target.value)} required />
              <button type="button" className="btn-outline" onClick={() => removeArrayRow(field.name, index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => addArrayRow(field)}>Add Item</button>
        </div>
      );
    }

    if (field.type === 'projectTasks') {
      return (
        <div className="mt-2 space-y-3">
          {(formValues[field.name] || []).map((row: any, index: number) => (
            <div key={index} className="grid gap-3 rounded-lg border border-surface-700 bg-surface-900/60 p-3 md:grid-cols-[1fr_150px_145px_130px_auto]">
              <input className="input-field" placeholder="Task title" value={row.title} onChange={(event) => updateArrayRow(field.name, index, 'title', event.target.value)} required />
              <input className="input-field" placeholder="Assignee" value={row.assigneeName || ''} onChange={(event) => updateArrayRow(field.name, index, 'assigneeName', event.target.value)} />
              <input className="input-field" type="date" value={dateInputValue(row.dueDate)} onChange={(event) => updateArrayRow(field.name, index, 'dueDate', event.target.value)} required />
              <select className="input-field" value={row.status || 'todo'} onChange={(event) => updateArrayRow(field.name, index, 'status', event.target.value)}>
                {['todo', 'in_progress', 'done', 'blocked'].map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
              </select>
              <button type="button" className="btn-outline" onClick={() => removeArrayRow(field.name, index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={() => addArrayRow(field)}>Add Task</button>
        </div>
      );
    }

    return (
      <input
        className={commonClasses}
        type={field.type}
        value={formValues[field.name] || ''}
        required={field.required}
        onChange={(event) => setFormValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
      />
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-surface-700 bg-surface-800 text-brand-300">
            {(() => {
              const Icon = config.icon;
              return <Icon size={23} />;
            })()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{config.title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{config.description}</p>
          </div>
        </div>
        {canCreate && (
          <button type="button" onClick={openCreate} className="btn-primary w-fit gap-2">
            <Plus size={18} />
            Add {config.singularTitle}
          </button>
        )}
      </div>

      <div className="card">
        <div className="border-b border-surface-700/50 bg-surface-800/50 p-4">
          <SearchBar onSearch={(value) => { setSearchTerm(value); setPage(1); }} placeholder={config.searchable} />
        </div>
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          keyExtractor={(item) => item.publicId}
          emptyMessage={`No ${config.title.toLowerCase()} found.`}
        />
        {data?.meta && (
          <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={`${editingItem ? 'Edit' : 'Add'} ${config.singularTitle}`} maxWidth="2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' || field.type === 'purchaseItems' || field.type === 'projectTasks' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-slate-300">
                  {field.label}{field.required ? ' *' : ''}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 border-t border-surface-700/50 pt-4">
            <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary min-w-28">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => deletingItem && deleteMutation.mutate(deletingItem.publicId)}
        title={`Delete ${config.singularTitle}`}
        message="This record will be removed from the database. This action cannot be undone."
        confirmText="Delete"
      />

    </div>
  );
};

export default ErpResourcePage;
