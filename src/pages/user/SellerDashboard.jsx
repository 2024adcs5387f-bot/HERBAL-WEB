import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, DollarSign, Package, Users, Plus, Edit, Eye } from 'lucide-react';
import { getCurrentUser } from "../../services/userService";
import { signOut } from "../../services/userService";
import { useNavigate } from "react-router-dom";

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      try { setUser(await getCurrentUser()); } catch { setUser(null); }
    })();
  }, []);
  const stats = useMemo(() => ({
    totalOrders: 156,
    totalRevenue: 2847.50,
    totalProducts: 24,
    totalCustomers: 89,
  }), []);

  const orders = [
    { id: '1', orderNumber: 'HM-12345678-ABCD', status: 'paid', totalAmount: 89.97, createdAt: '2024-01-15T10:30:00Z' },
    { id: '2', orderNumber: 'HM-12345679-EFGH', status: 'shipped', totalAmount: 45.98, createdAt: '2024-01-14T15:45:00Z' },
  ];

  const products = [
    { id: '1', name: 'Organic Turmeric Powder', price: 24.99, stock: 50, status: 'active', views: 1250 },
    { id: '2', name: 'Ashwagandha Root Extract', price: 34.99, stock: 30, status: 'active', views: 890 },
  ];

  const StatusPill = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status}</span>
  );

  return (
    <div className="pt-28 pb-16 w-full lg:w-[80%] mx-auto px-4 lg:px-0">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Seller Dashboard</h1>

      {/* Account Details */}
      {user && (
        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-4 justify-between">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold">
                  {(user?.profile?.name || user?.email || 'U')?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm text-neutral-400">Signed in as</div>
              <div className="text-base font-semibold text-neutral-100">{user?.profile?.name || user?.email}</div>
              <div className="text-xs text-neutral-400">Email: {user?.email}</div>
              <div className="text-xs text-neutral-400 capitalize">Role: {user?.profile?.user_type || 'seller'}</div>
            </div>
            <div>
              <button
                onClick={async () => { try { await signOut(); navigate('/login', { replace: true }); } catch (e) { console.error('Logout failed', e); } }}
                className="px-3 py-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg"><ShoppingCart className="h-6 w-6 text-blue-600" /></div>
            <div className="ml-3"><p className="text-sm text-neutral-500">Total Orders</p><p className="text-2xl font-semibold">{stats.totalOrders}</p></div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="h-6 w-6 text-green-600" /></div>
            <div className="ml-3"><p className="text-sm text-neutral-500">Revenue</p><p className="text-2xl font-semibold">${stats.totalRevenue}</p></div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg"><Package className="h-6 w-6 text-purple-600" /></div>
            <div className="ml-3"><p className="text-sm text-neutral-500">Products</p><p className="text-2xl font-semibold">{stats.totalProducts}</p></div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg"><Users className="h-6 w-6 text-orange-600" /></div>
            <div className="ml-3"><p className="text-sm text-neutral-500">Customers</p><p className="text-2xl font-semibold">{stats.totalCustomers}</p></div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <button className="px-3 py-2 rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left py-2">Order</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="py-3">
                    <p className="font-medium">{o.orderNumber}</p>
                    <p className="text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-3">
                    <p className="font-medium">Customer Name</p>
                    <p className="text-neutral-500">customer@email.com</p>
                  </td>
                  <td className="py-3 font-semibold">${o.totalAmount}</td>
                  <td className="py-3"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">{o.status}</span></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="h-4 w-4" /></button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded"><Package className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Management */}
      <div className="mt-6 p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Product Management</h3>
          <button className="px-3 py-2 rounded-md bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Product
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium">{p.name}</h4>
                <StatusPill status={p.status} />
              </div>
              <p className="text-lg font-semibold text-green-600">${p.price}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>
                  <p className="text-neutral-500">Stock</p>
                  <p className="font-medium">{p.stock}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Views</p>
                  <p className="font-medium">{p.views}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 px-3 py-2 rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"><Edit className="h-4 w-4 mr-1" /> Edit</button>
                <button className="flex-1 px-3 py-2 rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"><Eye className="h-4 w-4 mr-1" /> View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
