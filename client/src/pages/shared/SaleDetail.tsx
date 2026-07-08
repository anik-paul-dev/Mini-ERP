import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { Sale } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ArrowLeft, Printer } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SaleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { get } = useApi();
  const { user } = useAuth();
  
  const basePath = user ? `/${user.roleName.toLowerCase()}/sales` : '/sales';

  const { data: sale, isLoading } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => get<Sale>(`/sales/${id}`),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-slate-100">Sale not found</h2>
        <Link to={basePath} className="mt-4 text-brand-400 hover:text-brand-300 inline-block transition-colors">
          Return to sales list
        </Link>
      </div>
    );
  }

  return (
    <div className="invoice-print-page space-y-6 max-w-4xl mx-auto animate-in fade-in print:max-w-none print:m-0">
      <div className="flex justify-between items-center print:hidden">
        <Link to={basePath} className="flex items-center text-surface-400 hover:text-slate-200 transition-colors">
          <ArrowLeft size={20} className="mr-1" />
          Back to Sales
        </Link>
        <button onClick={handlePrint} className="btn-secondary flex items-center">
          <Printer size={18} className="mr-2" />
          Print Invoice
        </button>
      </div>

      <div className="invoice-print-area card p-8 border border-surface-700 relative overflow-hidden bg-surface-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl print:hidden"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start border-b border-surface-700 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight print:text-black">Invoice</h1>
              <p className="text-surface-400 mt-1 print:text-gray-600">Sale ID: <span className="font-mono text-slate-300 print:text-black">{sale.publicId}</span></p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent print:text-black">Mini ERP</h2>
              <p className="text-surface-400 text-sm mt-1 print:text-gray-600">123 Business Rd, Tech City</p>
              <p className="text-surface-400 text-sm print:text-gray-600">support@minierp.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 border-b border-surface-700">
            <div>
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-2 print:text-gray-500">Billed To</h3>
              <p className="font-semibold text-slate-200 print:text-black">{sale.customerName}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-2 print:text-gray-500">Invoice Details</h3>
              <p className="text-slate-200 print:text-black"><span className="text-surface-500 mr-2 print:text-gray-500">Date:</span> {formatDate(sale.createdAt)}</p>
              <p className="text-slate-200 print:text-black"><span className="text-surface-500 mr-2 print:text-gray-500">Issued By:</span> {sale.createdByName}</p>
            </div>
          </div>

          <div className="py-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-600">
                  <th className="py-3 font-semibold text-slate-300 print:text-gray-800">Item</th>
                  <th className="py-3 font-semibold text-slate-300 text-center print:text-gray-800">Qty</th>
                  <th className="py-3 font-semibold text-slate-300 text-right print:text-gray-800">Price</th>
                  <th className="py-3 font-semibold text-slate-300 text-right print:text-gray-800">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-slate-200 font-medium print:text-black">{item.productName}</td>
                    <td className="py-4 text-surface-300 text-center print:text-gray-700">{item.quantity}</td>
                    <td className="py-4 text-surface-300 text-right print:text-gray-700">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 text-slate-200 text-right font-medium print:text-black">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-8">
            <div className="w-full sm:w-1/2 max-w-sm">
              <div className="flex justify-between items-center py-3 px-4 text-lg font-bold text-slate-100 bg-surface-800 rounded-lg border border-surface-700 print:border-gray-900 print:bg-white print:text-black">
                <span>Grand Total</span>
                <span className="text-brand-400 print:text-black">{formatCurrency(sale.grandTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center text-sm text-surface-500 print:mt-32 print:text-gray-500">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetail;
