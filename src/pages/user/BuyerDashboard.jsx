import React, { useEffect, useState } from "react";
import { Leaf, BookOpen, Star } from 'lucide-react';
import { getCurrentUser } from "../../services/userService";
import { signOut } from "../../services/userService";
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { setUser(await getCurrentUser()); } catch { setUser(null); }
    })();
  }, []);
  const orders = [
    { id: '1', orderNumber: 'HM-12345678-ABCD', status: 'paid', totalAmount: 89.97, createdAt: '2024-01-15T10:30:00Z', items: [ { name: 'Organic Turmeric Powder', quantity: 2, price: 24.99 }, { name: 'Ashwagandha Root Extract', quantity: 1, price: 34.99 } ] },
    { id: '2', orderNumber: 'HM-12345679-EFGH', status: 'shipped', totalAmount: 45.98, createdAt: '2024-01-14T15:45:00Z', items: [ { name: 'Chamomile Tea Blend', quantity: 2, price: 18.99 } ] },
  ];

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  })[status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="pt-28 pb-16 w-full lg:w-[70%] mx-auto px-4 lg:px-0">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Buyer Dashboard</h1>

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
              <div className="text-xs text-neutral-400 capitalize">Role: {user?.profile?.user_type || 'buyer'}</div>
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

      <div className="mt-6 space-y-6">
        <div className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <button className="px-3 py-2 rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800">View All</button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${order.totalAmount}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center hover:shadow-lg transition-shadow">
            <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h4 className="font-medium">Plant Scanner</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Identify plants</p>
          </button>
          <button className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center hover:shadow-lg transition-shadow">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h4 className="font-medium">Symptom Checker</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Check symptoms</p>
          </button>
          <button className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center hover:shadow-lg transition-shadow">
            <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h4 className="font-medium">Get Recommendations</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">AI-powered advice</p>
          </button>
        </div>
      </div>
    </div>
  );
}
