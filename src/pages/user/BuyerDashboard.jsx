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

  
}
