// Seller Logout Functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                // Call the logout API endpoint
                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'  // Important for including cookies
                });

                if (response.ok) {
                    // Clear any local storage if needed
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Redirect to the login page
                    window.location.href = '/login';
                } else {
                    console.error('Logout failed');
                    window.location.href = '/login'; // Still redirect even if API call fails
                }
            } catch (error) {
                console.error('Error during logout:', error);
                window.location.href = '/login';
            }
        });
    }
});
