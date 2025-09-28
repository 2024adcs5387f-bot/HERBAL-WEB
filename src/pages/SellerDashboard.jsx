import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/authService';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserAndLoadHtml = async () => {
      try {
        // Check user authentication and role
        const { data: { user } } = await getUser();
        if (!user || !user.user_metadata?.user_type?.includes('seller')) {
          navigate('/login');
          return;
        }

        // Load the HTML file
        const response = await fetch('/Seller.html');
        if (!response.ok) {
          throw new Error('Failed to load seller dashboard');
        }
        
        let content = await response.text();
        
        // Update base URLs for assets to work with React Router
        content = content.replace(/<head>/, `<head><base href="/">`);
        
        setHtmlContent(content);
        setLoading(false);
      } catch (error) {
        console.error('Error loading seller dashboard:', error);
        setError('Failed to load seller dashboard. Please try again later.');
        setLoading(false);
      }
    };

    checkUserAndLoadHtml();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render the HTML content in a div with dangerouslySetInnerHTML
  // Note: This is generally not recommended for untrusted content,
  // but it's okay here since we control the content
  return (
    <div 
      className="w-full min-h-screen"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default SellerDashboard;
