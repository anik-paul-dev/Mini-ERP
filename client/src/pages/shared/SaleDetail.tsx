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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Sale not found</h2>
        <Link to={basePath} className="mt-4 text-brand-600 hover:text-brand-500 inline-block">
          Return to sales list
        </Link>
      </div>
    );
  }

  return (
    <div className="invoice-print-page space-y-6 max-w-4xl mx-auto animate-in fade-in print:max-w-none print:m-0">
      <div className="flex justify-between items-center print:hidden">
        <Link to={basePath} className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} className="mr-1" />
          Back to Sales
        </Link>
        <button onClick={handlePrint} className="btn-secondary flex items-center">
          <Printer size={18} className="mr-2" />
          Print Invoice
        </button>
      </div>

      <div className="invoice-print-area bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoice</h1>
              <p className="text-gray-500 mt-1">Sale ID: {sale.publicId}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-brand-600">Mini ERP</h2>
              <p className="text-gray-500 text-sm mt-1">123 Business Rd, Tech City</p>
              <p className="text-gray-500 text-sm">support@minierp.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="font-semibold text-gray-900">{sale.customerName}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Invoice Details</h3>
              <p className="text-gray-900"><span className="text-gray-500 mr-2">Date:</span> {formatDate(sale.createdAt)}</p>
              <p className="text-gray-900"><span className="text-gray-500 mr-2">Issued By:</span> {sale.createdByName}</p>
            </div>
          </div>

          <div className="py-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 font-semibold text-gray-900">Item</th>
                  <th className="py-3 font-semibold text-gray-900 text-center">Qty</th>
                  <th className="py-3 font-semibold text-gray-900 text-right">Price</th>
                  <th className="py-3 font-semibold text-gray-900 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-gray-900 font-medium">{item.productName}</td>
                    <td className="py-4 text-gray-600 text-center">{item.quantity}</td>
                    <td className="py-4 text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 text-gray-900 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-8">
            <div className="w-1/2 max-w-sm">
              <div className="flex justify-between items-center py-2 text-lg font-bold text-gray-900 border-t-2 border-gray-900">
                <span>Grand Total</span>
                <span className="text-brand-600">{formatCurrency(sale.grandTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center text-sm text-gray-500 print:mt-32">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetail;
