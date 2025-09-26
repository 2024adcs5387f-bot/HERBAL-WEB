import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the HTML file
    window.location.href = '/sell.html';
    
    // Fallback in case the redirect doesn't work
    const timer = setTimeout(() => {
      navigate('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h2>Redirecting to Seller Dashboard...</h2>
      <p>If you're not redirected automatically, <a href="/sell.html">click here</a>.</p>
    </div>
  );
};

export default SellerDashboard;
