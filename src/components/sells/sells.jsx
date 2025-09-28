import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { FiPackage, FiDollarSign, FiUsers, FiShoppingCart, FiTrendingUp, FiCalendar, FiChevronDown } from 'react-icons/fi';

const SellsDashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { title: 'Total Orders', value: '1,250', change: '+15.3%', isUp: true, icon: <FiPackage className="text-blue-500" /> },
    { title: 'Total Sales', value: '$4,200', change: '+10.1%', isUp: true, icon: <FiDollarSign className="text-green-500" /> },
    { title: 'Total Customers', value: '1,250', change: '-2.7%', isUp: false, icon: <FiUsers className="text-purple-500" /> },
    { title: 'Total Products', value: '45', change: '+5.2%', isUp: true, icon: <FiShoppingCart className="text-orange-500" /> },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'John Doe', date: '2023-04-15', amount: '$120.00', status: 'Completed' },
    { id: '#12344', customer: 'Jane Smith', date: '2023-04-14', amount: '$85.50', status: 'Processing' },
    { id: '#12343', customer: 'Robert Johnson', date: '2023-04-14', amount: '$210.00', status: 'Completed' },
    { id: '#12342', customer: 'Emily Davis', date: '2023-04-13', amount: '$64.99', status: 'Pending' },
    { id: '#12341', customer: 'Michael Brown', date: '2023-04-12', amount: '$179.99', status: 'Completed' },
  ];

  const topProducts = [
    { name: 'Herbal Tea Blend', sales: '125', revenue: '$1,250' },
    { name: 'Lavender Essential Oil', sales: '98', revenue: '$980' },
    { name: 'Echinacea Tincture', sales: '76', revenue: '$760' },
    { name: 'Peppermint Oil', sales: '65', revenue: '$650' },
    { name: 'Turmeric Capsules', sales: '54', revenue: '$540' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back, Herbal Store!</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
            <FiCalendar className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Last 30 days</span>
            <FiChevronDown className="ml-2 text-gray-400" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <div className={`flex items-center mt-2 text-sm ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  <FiTrendingUp className="mr-1" />
                  <span>{stat.change}</span>
                  <span className="text-gray-400 ml-1">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sales Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Sales Overview</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md">Week</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-md">Month</button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-md">Year</button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Sales chart will be displayed here</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-xs text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">{product.sales}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">{product.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FiShoppingCart className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-xs text-gray-500">Order #12345 from John Doe</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellsDashboard;
