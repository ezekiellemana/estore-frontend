// src/pages/admin/AdminAnalyticsCharts.jsx

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import AnimatedButton from '../../components/AnimatedButton';

export default function AdminAnalyticsCharts() {
  // 1) Summary counts
  const [counts, setCounts] = useState(null);

  // 2) Sales data + date filters
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // 3) Top products + category sales
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);

  // 4) Recent orders
  const [recentOrders, setRecentOrders] = useState([]);

  // 5) Top customers
  const [topCustomers, setTopCustomers] = useState([]);

  // 6) Low‐inventory alerts
  const [lowInventory, setLowInventory] = useState([]);

  // Custom color palette
  const COLORS = ['#7C3AED', '#A78BFA', '#C084FC', '#DDD6FE', '#EDE9FE'];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/counts');
        setCounts(data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load summary counts.');
        setCounts({ users: 0, products: 0, orders: 0, reviews: 0 });
      }
    };

    const fetchSales = async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/sales', {
          params: { start: startDate, end: endDate },
        });
        if (Array.isArray(data)) {
          setSalesData(data);
        } else {
          setSalesData([]);
          console.warn('Sales endpoint did not return an array:', data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load sales data.');
        setSalesData([]);
      }
    };

    const fetchTopProducts = async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/top-products', {
          params: { limit: 5, start: startDate, end: endDate },
        });
        if (Array.isArray(data)) {
          setTopProducts(data);
        } else {
          setTopProducts([]);
          console.warn('Top-products endpoint did not return an array:', data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load top products.');
        setTopProducts([]);
      }
    };

    const fetchCategorySales = async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/category-sales');
        if (Array.isArray(data)) {
          setCategorySales(data);
        } else {
          setCategorySales([]);
          console.warn('Category-sales endpoint did not return an array:', data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load category sales.');
        setCategorySales([]);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const { data } = await api.get('/api/admin/orders', {
          params: { limit: 5, sort: 'createdAt_desc' },
        });
        if (Array.isArray(data)) {
          setRecentOrders(data);
        } else {
          setRecentOrders([]);
          console.warn('Admin-orders endpoint did not return an array:', data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load recent orders.');
        setRecentOrders([]);
      }
    };

    const fetchTopCustomers = async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/top-customers', {
          params: { limit: 5 },
        });
        if (data && Array.isArray(data.customers)) {
          setTopCustomers(data.customers);
        } else {
          setTopCustomers([]);
          console.warn('Top-customers endpoint did not return data.customers array:', data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load top customers.');
        setTopCustomers([]);
      }
    };

    const fetchLowInventory = async () => {
      try {
        const { data } = await api.get('/api/admin/analytics/low-stock', {
          params: { threshold: 10 },
        });
        if (data && Array.isArray(data.products)) {
          setLowInventory(data.products);
        } else {
          setLowInventory([]);
          console.warn('Low-stock endpoint did not return data.products array:', data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load inventory alerts.');
        setLowInventory([]);
      }
    };

    fetchCounts();
    fetchSales();
    fetchTopProducts();
    fetchCategorySales();
    fetchRecentOrders();
    fetchTopCustomers();
    fetchLowInventory();
  }, [startDate, endDate]);

  const totalSalesRange = Array.isArray(salesData)
    ? salesData.reduce((sum, e) => sum + (e.totalSales || 0), 0)
    : 0;

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Report_${startDate}_to_${endDate}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <>
      {/* Print-specific CSS */}
      <style>
        {`
        /* Hide elements not needed in print */
        @media print {
          .no-print { display: none !important; }
        }

        /* Reset backgrounds & shadows for print */
        @media print {
          body, 
          .shadow-card, 
          .border-l-4, 
          .bg-white, 
          .bg-neutral-50,
          .bg-neutral-100,
          .bg-neutral-200,
          .bg-primary-50 {
            background: #fff !important;
            box-shadow: none !important;
          }
        }

        /* Typography adjustments */
        @media print {
          h3, 
          .text-xl, 
          .font-semibold {
            font-size: 18pt !important;
            font-weight: bold !important;
          }
          p, td, th, label {
            font-size: 10pt !important;
            color: #000 !important;
          }
          .text-sm, .font-medium {
            font-size: 9pt !important;
          }
        }

        /* Tables: solid borders, no stripes */
        @media print {
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 6px !important;
            background: none !important;
          }
          thead tr {
            background: #f0f0f0 !important;
          }
        }

        /* Charts: make SVGs scale full width */
        @media print {
          .chart-container svg {
            width: 100% !important;
            height: auto !important;
          }
        }

        /* Page breaks */
        @media print {
          .table-container, .chart-container {
            page-break-inside: avoid !important;
          }
          .print-header {
            page-break-after: avoid;
          }
          .section {
            margin-bottom: 24px;
          }
        }

        /* Enhanced header styling */
        .print-header h2 {
          font-size: 28px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #7C3AED;  /* deep purple */
          margin: 0;
        }
        .print-header p {
          font-size: 12px;
          letter-spacing: 1px;
          margin-top: 4px;
          color: #6D28D9; /* muted purple */
        }
        .print-header .underline {
          width: 80px;
          height: 4px;
          background-color: #D8B4FE; /* lavender accent */
          margin: 8px auto 0;
        }

        /* Also apply header styling in print mode */
        @media print {
          .print-header h2 { font-size: 32pt !important; letter-spacing: 3px; }
          .print-header p { font-size: 10pt !important; }
          .print-header .underline { height: 2px !important; background-color: #C4B5FD !important; }
        }

        /* Ensure containers stretch full width on small screens */
        .chart-container, 
        .table-container, 
        .shadow-card, 
        .print-header, 
        .section {
          width: 100%;
          max-width: 100%;
        }
      `}
      </style>

      <div className="space-y-8 p-6 max-w-full">
        {/* Print Button */}
        <div className="flex justify-end no-print">
          <AnimatedButton onClick={handlePrint} className="px-6 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700">
            Print Report
          </AnimatedButton>
        </div>

        {/* Header showing report title + date range */}
        <div className="print-header text-center w-full">
          <h2>eStore Analytics Report</h2>
          <div className="underline"></div>
          <p>
            {startDate}  —  {endDate}
          </p>
        </div>

        {/* Date Filters (hidden in print) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 no-print w-full">
          <div className="flex items-center gap-2">
            <label htmlFor="start-date" className="text-purple-700 font-medium">
              Start:
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-purple-300 rounded-2xl px-3 py-2 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="end-date" className="text-purple-700 font-medium">
              End:
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-purple-300 rounded-2xl px-3 py-2 bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>

        {/* Summary Counts */}
        {counts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 section w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-50 border-l-4 border-purple-600 rounded-2xl p-6 shadow-card w-full"
            >
              <p className="text-sm text-purple-700">Total Users</p>
              <p className="mt-1 text-2xl font-bold text-purple-600">{counts.users}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-purple-50 border-l-4 border-purple-500 rounded-2xl p-6 shadow-card w-full"
            >
              <p className="text-sm text-purple-700">Total Products</p>
              <p className="mt-1 text-2xl font-bold text-purple-500">{counts.products}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-purple-50 border-l-4 border-purple-400 rounded-2xl p-6 shadow-card w-full"
            >
              <p className="text-sm text-purple-700">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-purple-400">{counts.orders}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-purple-50 border-l-4 border-purple-300 rounded-2xl p-6 shadow-card w-full"
            >
              <p className="text-sm text-purple-700">Sales Selected Range</p>
              <p className="mt-1 text-2xl font-bold text-purple-300">
                ${totalSalesRange.toLocaleString()}
              </p>
            </motion.div>
          </div>
        )}

        {/* Tables Grid: Recent Orders & Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 section w-full">
          {/* Recent Orders */}
          <div className="p-6 bg-purple-50 rounded-2xl shadow-card table-container w-full">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📄 Recent Orders</h3>
            {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-purple-100 rounded-lg">
                  <thead>
                    <tr className="bg-purple-200">
                      <th className="px-4 py-2 text-left text-sm font-medium text-purple-600">
                        Order ID
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-purple-600">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-purple-600">
                        Date
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-purple-600">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, idx) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b even:bg-white hover:bg-gray-100 transition-colors"
                      >
                        <td className="px-4 py-2 text-purple-800">
                          {order._id.slice(-6)}
                        </td>
                        <td className="px-4 py-2 text-purple-700">
                          {order.user?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-2 text-purple-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-right text-purple-800">
                          ${order.total?.toFixed(2) || '0.00'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-purple-600">No recent orders.</p>
            )}
          </div>

          {/* Top Customers */}
          <div className="p-6 bg-purple-50 rounded-2xl shadow-card table-container w-full">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🏆 Top Customers</h3>
            {Array.isArray(topCustomers) && topCustomers.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <table className="min-w-full bg-purple-100 rounded-lg">
                  <thead>
                    <tr className="bg-purple-200">
                      <th className="px-4 py-2 text-left text-sm font-medium text-purple-600">
                        Customer
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-purple-600">
                        Total Spent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((cust, idx) => (
                      <motion.tr
                        key={cust._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b even:bg-white hover:bg-gray-100 transition-colors"
                      >
                        <td className="px-4 py-2 text-purple-800">{cust.name}</td>
                        <td className="px-4 py-2 text-right text-purple-800">
                          ${cust.totalSpent?.toLocaleString() || '0'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-purple-600">No top customers found.</p>
            )}
          </div>
        </div>

        {/* Inventory Alerts - full width below tables */}
        <div className="p-6 bg-purple-50 rounded-2xl shadow-card table-container section w-full">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">🚨 Inventory Alerts</h3>
          {Array.isArray(lowInventory) && lowInventory.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-purple-100 rounded-lg">
                <thead>
                  <tr className="bg-purple-200">
                    <th className="px-4 py-2 text-left text-sm font-medium text-purple-600">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-purple-600">
                      In Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowInventory.map((prod, idx) => (
                    <motion.tr
                      key={prod._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b even:bg-white hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-4 py-2 text-purple-800">{prod.name}</td>
                      <td className="px-4 py-2 text-right text-red-600 font-semibold">
                        {prod.countInStock}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-purple-600">No low‐stock products.</p>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 section w-full">
          {/* Sales Over Time */}
          <div className="p-6 bg-purple-50 rounded-2xl shadow-card chart-container w-full">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📈 Sales Over Time</h3>
            {Array.isArray(salesData) && salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#6B21A8' }} />
                  <YAxis tick={{ fill: '#6B21A8' }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke={COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-purple-600">Loading sales data…</p>
            )}
          </div>

          {/* Top Products */}
          <div className="p-6 bg-purple-50 rounded-2xl shadow-card chart-container w-full">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">
              🏆 Top 5 Products by Revenue
            </h3>
            {Array.isArray(topProducts) && topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topProducts.map((p) => ({
                    name: p.name,
                    revenue: p.totalRevenue,
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    tick={{ fill: '#6B21A8' }}
                  />
                  <YAxis tick={{ fill: '#6B21A8' }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-purple-600">Loading top products…</p>
            )}
          </div>

          {/* Category Sales (span two columns on small screens) */}
          <div className="lg:col-span-2 p-6 bg-purple-50 rounded-2xl shadow-card chart-container w-full">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">
              📊 Revenue by Category
            </h3>
            {Array.isArray(categorySales) && categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    dataKey="totalRevenue"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill={COLORS[2]}
                    label={(entry) => entry._id}
                  >
                    {categorySales.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-purple-600">Loading category sales…</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
