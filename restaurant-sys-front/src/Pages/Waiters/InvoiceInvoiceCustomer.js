import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InvoiceInvoiceCustomer.css';

export default function InvoiceCustomer() {
  const [tables, setTables] = useState([]);
  const [occupied, setOccupied] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invcModalOpen, setInvcModalOpen] = useState(false);

  const token = Cookies.get('authToken');

  const loadOccupiedTables = async () => {
    try {
      setLoadingTables(true);
      // Open modal immediately for faster UX; content will populate when loaded
      setInvcModalOpen(true);
      const res = await axios.get('http://127.0.0.1:8000/api/Manager/getTableinRestaurant', {
        headers: { Authorization: ` Bearer ${token} ` },
      });
      const allTables = res.data?.tables || [];
      setTables(allTables);
      const occ = allTables.filter(t => (t.status || '').toLowerCase() === 'reserved');
      setOccupied(occ);
      if (occ.length === 0) toast.info('لا توجد طاولات مشغولة حالياً');
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء جلب الطاولات');
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchInvoice = async (table) => {
    try {
      setSelectedTable(table);
      setLoadingInvoice(true);
      setInvoice(null);
      const res = await axios.get(`http://127.0.0.1:8000/api/Employee/getInvoice/${table.id}`, {
        headers: { Authorization: ` Bearer ${token} ` },
      });
      setInvoice(res.data);
      // Close modal after selecting a table
      setInvcModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('فشل جلب الفاتورة للطاولة المحددة');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const printInvoice = () => {
    if (!invoice) return;
    const area = document.getElementById('invoice-print-area');
    if (!area) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Invoice - Table ${selectedTable?.table_number || selectedTable?.id || ''}</title>
          <style>
            body { font-family: Arial, Tahoma, sans-serif; background: #fff; color: #222; }
            .invoice { max-width: 800px; margin: 0 auto; padding: 24px; }
            .header { display:flex; justify-content: space-between; align-items:center; margin-bottom: 16px; }
            .brand { font-weight: 700; font-size: 20px; }
            .meta { color: #666; font-size: 14px; }
            .card { border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
            .section-title { font-weight: 700; margin: 12px 0 8px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: start; }
            th { background: #f9f9f9; }
            .totals { text-align: end; font-weight: 700; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="invoice">${area.innerHTML}</div>
          <script>window.onload = function(){ window.print(); window.onafterprint = () => window.close(); };<\/script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div className="RightPare invc-root" style={{padding:'20px',width:"100vw"}}>
      <ToastContainer />

      <div className="invc-toolbar">
        <button className="invc-btn invc-btn-gold" onClick={loadOccupiedTables} disabled={loadingTables}>
          {loadingTables ? 'جاري التحميل...' : 'تحميل الطاولات المشغولة'}
        </button>
      </div>

      {invcModalOpen && (
        <div className="invc-modal">
          <div className="invc-modal-box">
            <div className="invc-modal-head">
              <h3 className="invc-title">الطاولات المحجوزة</h3>
              <button className="invc-btn invc-btn-ghost" onClick={() => setInvcModalOpen(false)}>إغلاق</button>
            </div>
            <div className="invc-modal-body">
              {loadingTables && <div className="invc-hint">جاري التحميل...</div>}
              {!loadingTables && occupied.length === 0 && (
                <div className="invc-hint">لا توجد طاولات محجوزة حالياً</div>
              )}
              {!loadingTables && occupied.length > 0 && (
                <div className="invc-cards">
                  {occupied.map((t) => (
                    <div
                      key={t.id}
                      className="invc-card invc-table-card"
                      onClick={() => fetchInvoice(t)}
                    >
                      <div className="invc-table-header">
                        <div className="invc-table-number">طاولة {t.table_number || t.id}</div>
                        <span className="invc-badge invc-badge-occupied">محجوزة</span>
                      </div>
                      <div className="invc-table-body">اضغط لاختيار هذه الطاولة</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* بعد اختيار الطاولة ستظهر الفاتورة في الأسفل */}

      {selectedTable && (
        <div className="invc-wrapper">
          <div className="invc-header">
            <h2 className="invc-title">فاتورة الزبون</h2>
            <div className="invc-actions">
              <button onClick={printInvoice} className="invc-btn invc-btn-print">
                <i className="fa-solid fa-print" style={{ marginInlineEnd: 6 }}></i>
                طباعة
              </button>
            </div>
          </div>

          {loadingInvoice && <p className="invc-hint">جاري تحميل الفاتورة...</p>}

          {!loadingInvoice && invoice && (
            <div id="invoice-print-area" className="invc-paper">
              <div className="invc-card">
                <div className="invc-paper-head">
                  <div className="invc-brand">Restaurant System</div>
                  <div className="invc-meta">Table: {selectedTable.table_number || selectedTable.id}</div>
                </div>
                <div className="invc-meta">Customer ID: {invoice.customer?.id}</div>
              </div>

              {Array.isArray(invoice.lists) && invoice.lists.length > 0 ? (
                invoice.lists.map((list) => (
                  <div className="invc-card" key={list.list_id}>
                    <div className="invc-section-title">قائمة #{list.list_id}</div>
                    {Array.isArray(list.orders) && list.orders.length > 0 ? (
                      list.orders.map((order) => (
                        <div key={order.order_id} className="invc-order-block">
                          <div className="invc-meta">طلب #{order.order_id} - الحالة: {order.status}</div>
                          <table className="invc-table">
                            <thead>
                              <tr>
                                <th>الوجبة</th>
                                <th>الكمية</th>
                                <th>السعر الفردي</th>
                                <th>السعر الإجمالي</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(order.foods || []).map((f, idx) => (
                                <tr key={idx}>
                                  <td>{f.name}</td>
                                  <td>{f.quantity}</td>
                                  <td>{f.price_per_unit}</td>
                                  <td>{f.total_price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="invc-totals">مجموع الطلب: {order.order_total}</div>
                        </div>
                      ))
                    ) : (
                      <div className="invc-hint">لا يوجد طلبات</div>
                    )}
                    <div className="invc-totals">مجموع القائمة: {list.list_total}</div>
                  </div>
                ))
              ) : (
                <div className="invc-card invc-hint">لا توجد قوائم</div>
              )}

              <div className="invc-card invc-grand">
                <div className="invc-section-title">الإجمالي النهائي</div>
                <div className="invc-grand-value">{invoice.grand_total}</div>
              </div>
            </div>
          )}
        </div>
      )}

      
    </div>
  );
}