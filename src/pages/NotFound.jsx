import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center mt-20">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! Page not found.</p>
      <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
    </div>
  );
};

export default NotFound;
