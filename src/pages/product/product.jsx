import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSeedling,
    faRecycle,
    faTruck,
    faSearch,
    faTags,
    faDollarSign,
    faHeart,
    faTh,
    faList,
    faArrowRight,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import './product.css';

// Cloudflare R2 Public URLs from your configuration
const R2_PUBLIC_BASE_PRODUCTS = import.meta.env.VITE_R2_PUBLIC_BASE_PRODUCTS || 'https://pub-901df787547c44428bbb24a9c7447391.r2.dev';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const Product = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState(250000);
    const [activeCategory, setActiveCategory] = useState("All");
    const [isOrganicOnly, setIsOrganicOnly] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [sortBy, setSortBy] = useState('created_at');

    // Fetch products from Supabase
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                // Build query with sorting
                let query = `${SUPABASE_URL}/rest/v1/products?select=*&is_active=eq.true`;
                
                // Add sorting
                switch(sortBy) {
                    case 'price_low':
                        query += '&order=price.asc';
                        break;
                    case 'price_high':
                        query += '&order=price.desc';
                        break;
                    case 'name':
                        query += '&order=name.asc';
                        break;
                    case 'rating':
                        query += '&order=rating.desc';
                        break;
                    case 'popular':
                        query += '&order=purchase_count.desc';
                        break;
                    default:
                        query += '&order=created_at.desc';
                }

                const response = await fetch(query, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status}`);
                }

                const supabaseProducts = await response.json();
                
                // Transform Supabase data to match your frontend structure
                const transformedProducts = supabaseProducts.map(product => {
                    // Get the first image from the images array or use a fallback
                    let imageUrl = '';
                    
                    if (product.images && product.images.length > 0) {
                        const firstImage = product.images[0];
                        
                        if (typeof firstImage === 'string') {
                            // If it's a filename, construct R2 URL
                            if (firstImage.startsWith('http')) {
                                imageUrl = firstImage;
                            } else {
                                imageUrl = `${R2_PUBLIC_BASE_PRODUCTS}/${firstImage}`;
                            }
                        } else if (firstImage.url) {
                            // If it's an object with url property
                            imageUrl = firstImage.url;
                        } else if (firstImage.filename) {
                            // If it's an object with filename property
                            imageUrl = `${R2_PUBLIC_BASE_PRODUCTS}/${firstImage.filename}`;
                        } else {
                            // Fallback to the string value
                            imageUrl = firstImage;
                        }
                    } else {
                        // Fallback image
                        imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                    }

                    // Determine badge based on your business logic
                    let badge = null;
                    if (product.is_featured) {
                        badge = "Featured";
                    } else if (product.compare_at_price && product.compare_at_price > product.price) {
                        const discount = Math.round((1 - product.price / product.compare_at_price) * 100);
                        badge = `Sale ${discount}%`;
                    } else if (product.purchase_count > 50) {
                        badge = "Popular";
                    } else if (product.created_at) {
                        // Show "New" for products created in the last 30 days
                        const createdDate = new Date(product.created_at);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        if (createdDate > thirtyDaysAgo) {
                            badge = "New";
                        }
                    }

                    return {
                        id: product.id,
                        name: product.name,
                        description: product.description || product.short_description,
                        price: Math.round(Number(product.price)),
                        compare_at_price: product.compare_at_price ? Math.round(Number(product.compare_at_price)) : null,
                        category: product.category,
                        subcategory: product.subcategory,
                        image: imageUrl,
                        badge: badge,
                        is_organic: product.is_organic,
                        is_featured: product.is_featured,
                        stock: product.stock || 0,
                        rating: product.rating || 0,
                        total_reviews: product.total_reviews || 0,
                        tags: product.tags || [],
                        botanical_name: product.botanical_name,
                        origin: product.origin,
                        slug: product.slug,
                        created_at: product.created_at
                    };
                });

                setProducts(transformedProducts);
                setFilteredProducts(transformedProducts);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortBy]);

    // Filter products
    useEffect(() => {
        if (products.length === 0) return;

        let filtered = products;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.botanical_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.tags && product.tags.some(tag => 
                    typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            );
        }

        // Category filter
        if (activeCategory !== "All") {
            filtered = filtered.filter(product => product.category === activeCategory);
        }

        // Price filter
        filtered = filtered.filter(product => product.price <= priceRange);

        // Organic filter
        if (isOrganicOnly) {
            filtered = filtered.filter(product => product.is_organic);
        }

        // Only show in-stock products
        filtered = filtered.filter(product => product.stock > 0);

        setFilteredProducts(filtered);
    }, [searchTerm, priceRange, activeCategory, isOrganicOnly, products]);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    const handleSortChange = (sortType) => {
        setSortBy(sortType);
    };

    const formatPrice = (price) => {
        return price.toLocaleString('en-US');
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FontAwesomeIcon key={i} icon={faStar} className="text-warning" />);
        }

        if (hasHalfStar) {
            stars.push(<FontAwesomeIcon key="half" icon={faStar} className="text-warning" />);
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="text-light" />);
        }

        return stars;
    };

    const addToCart = (p) => {
        try {
            // Primary storage for current Cart.jsx (UGX-based)
            const storeKey = 'cartPageItems';
            const raw = localStorage.getItem(storeKey);
            const cartPage = raw ? JSON.parse(raw) : [];
            const existing = cartPage.find((item) => item.id === p.id);
            
            if (existing) {
                if (existing.qty >= p.stock) {
                    alert(`Only ${p.stock} items available in stock`);
                    return;
                }
                existing.qty += 1;
            } else {
                if (p.stock < 1) {
                    alert('This product is out of stock');
                    return;
                }
                cartPage.push({
                    id: p.id,
                    name: p.name,
                    desc: p.description,
                    img: p.image,
                    price: p.price,
                    qty: 1,
                    stock: p.stock,
                    slug: p.slug
                });
            }
            localStorage.setItem(storeKey, JSON.stringify(cartPage));

            // Legacy storage for compatibility
            const legacyRaw = localStorage.getItem('herbalCart');
            const legacy = legacyRaw ? JSON.parse(legacyRaw) : [];
            const legacyExisting = legacy.find((item) => item.id === p.id);
            if (legacyExisting) {
                legacyExisting.quantity = (legacyExisting.quantity || 1) + 1;
            } else {
                legacy.push({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    image: p.image,
                    price: p.price / 3800, // Convert to USD
                    quantity: 1,
                });
            }
            localStorage.setItem('herbalCart', JSON.stringify(legacy));

            // Notify Navbar/cart badge to update immediately
            window.dispatchEvent(new Event('cartUpdated'));
            
            // Show success feedback
            showToast(`${p.name} added to cart!`, 'success');
            
        } catch (e) {
            console.error('Failed to add to cart', e);
            showToast('Failed to add product to cart', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
        toast.style.zIndex = '1050';
        toast.style.minWidth = '300px';
        toast.innerHTML = `
            <strong>${type === 'success' ? 'Success!' : 'Error!'}</strong> ${message}
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // Get unique categories from products
    const categories = ["All", ...new Set(products.map(product => product.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="herbal-haven">
                <div className="container text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading natural herbal products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="herbal-haven">
                <div className="container text-center py-5">
                    <div className="alert alert-danger" role="alert">
                        <h4>Error loading products</h4>
                        <p>{error}</p>
                        <p className="small">Check your Supabase configuration and network connection.</p>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="herbal-haven">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container text-center">
                    <h1 className="display-4 fw-bold mb-4">Pure Herbal Products for Natural Wellness</h1>
                    <p className="lead mb-4">Discover our range of organic, sustainably sourced herbal remedies and supplements</p>
                    <a href="#products" className="btn btn-primary btn-lg">
                        Shop Now <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mb-5">
                <div className="row">
                    <div className="col-md-4">
                        <div className="feature-box">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faSeedling} />
                            </div>
                            <h4>100% Organic</h4>
                            <p>All our products are made from certified organic ingredients</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="feature-box">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faRecycle} />
                            </div>
                            <h4>Sustainable</h4>
                            <p>Ethically sourced and environmentally friendly packaging</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="feature-box">
                            <div className="feature-icon">
                                <FontAwesomeIcon icon={faTruck} />
                            </div>
                            <h4>Free Shipping</h4>
                            <p>Free delivery on orders over $50</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mb-5" id="products">
                {/* Search Bar */}
                <h2 className="section-title">Our Herbal Products</h2>
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="search-bar">
                            <FontAwesomeIcon icon={faSearch} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search for herbal products, botanical names, or benefits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="filter-section">
                    <h3 className="section-title">Filter Products</h3>

                    <div className="row filter-form-row">
                        {/* Category Filter */}
                        <div className="col-md-4">
                            <div className="filter-group">
                                <div className="filter-title">
                                    <FontAwesomeIcon icon={faTags} /> Category
                                </div>
                                <div className="filter-tags">
                                    {categories.map(category => (
                                        <div
                                            key={category}
                                            className={`filter-tag ${activeCategory === category ? 'active' : ''}`}
                                            onClick={() => handleCategoryClick(category)}
                                        >
                                            {category}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Price Filter */}
                        <div className="col-md-4">
                            <div className="filter-group">
                                <div className="filter-title">
                                    <FontAwesomeIcon icon={faDollarSign} /> Price Range
                                </div>
                                <input
                                    type="range"
                                    className="form-range price-slider"
                                    min="0"
                                    max="250000"
                                    step="10000"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                />
                                <div className="price-values">
                                    <span>UGX 0</span>
                                    <span>UGX {formatPrice(priceRange)}+</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="organicFilter"
                                    checked={isOrganicOnly}
                                    onChange={(e) => setIsOrganicOnly(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="organicFilter">
                                    Certified Organic Only
                                </label>
                            </div>
                        </div>
                        <div className="col-md-6 text-end">
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setActiveCategory("All");
                                    setSearchTerm("");
                                    setPriceRange(250000);
                                    setIsOrganicOnly(false);
                                    setSortBy('created_at');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="row mt-4">
                    {/* Sort and Results Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <p className="results-count">
                            Showing {filteredProducts.length} of {products.length} products
                        </p>
                        <div className="sort-options">
                            <div className="dropdown">
                                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    Sort by: {
                                        sortBy === 'price_low' ? 'Price: Low to High' :
                                        sortBy === 'price_high' ? 'Price: High to Low' :
                                        sortBy === 'name' ? 'Name' :
                                        sortBy === 'rating' ? 'Highest Rated' :
                                        sortBy === 'popular' ? 'Most Popular' :
                                        'Newest First'
                                    }
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#" onClick={() => handleSortChange('created_at')}>Newest First</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={() => handleSortChange('price_low')}>Price: Low to High</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={() => handleSortChange('price_high')}>Price: High to Low</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={() => handleSortChange('name')}>Name A-Z</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={() => handleSortChange('rating')}>Highest Rated</a></li>
                                    <li><a className="dropdown-item" href="#" onClick={() => handleSortChange('popular')}>Most Popular</a></li>
                                </ul>
                            </div>
                            <div className="btn-group view-toggle ms-2" role="group">
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <FontAwesomeIcon icon={faTh} />
                                </button>
                                <button
                                    type="button"
                                    className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <FontAwesomeIcon icon={faList} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <p className="lead">No products found matching your criteria.</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => {
                                    setActiveCategory("All");
                                    setSearchTerm("");
                                    setPriceRange(250000);
                                    setIsOrganicOnly(false);
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className={`products-${viewMode}`} id="products-container">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <div className="position-relative product-img-container">
                                        {product.badge && <span className="badge-new">{product.badge}</span>}
                                        {product.is_organic && <span className="product-category">Organic</span>}
                                        <img
                                            src={product.image}
                                            className="product-img"
                                            alt={product.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                // Fallback image if R2 image fails to load
                                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                                            }}
                                        />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title product-title">{product.name}</h5>
                                        {product.botanical_name && (
                                            <p className="card-text text-muted small mb-2">
                                                <em>{product.botanical_name}</em>
                                            </p>
                                        )}
                                        <p className="card-text">{product.description}</p>
                                        
                                        {/* Rating */}
                                        {product.rating > 0 && (
                                            <div className="mb-2">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-2">
                                                        {renderStars(product.rating)}
                                                    </div>
                                                    <small className="text-muted">
                                                        ({product.total_reviews || 0} reviews)
                                                    </small>
                                                </div>
                                            </div>
                                        )}

                                        {product.origin && (
                                            <p className="card-text small text-muted mb-2">
                                                Origin: {product.origin}
                                            </p>
                                        )}
                                        
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <div>
                                                <div className="d-flex align-items-center">
                                                    {product.compare_at_price && product.compare_at_price > product.price ? (
                                                        <>
                                                            <span className="product-price text-danger">
                                                                <span className="currency">UGX</span> {formatPrice(product.price)}
                                                            </span>
                                                            <span className="text-muted text-decoration-line-through small ms-2">
                                                                UGX {formatPrice(product.compare_at_price)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="product-price">
                                                            <span className="currency">UGX</span> {formatPrice(product.price)}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.stock < 10 && product.stock > 0 && (
                                                    <div className="text-warning small">Only {product.stock} left</div>
                                                )}
                                                {product.stock === 0 && (
                                                    <div className="text-danger small">Out of Stock</div>
                                                )}
                                            </div>
                                            <button 
                                                type="button" 
                                                className="btn btn-primary"
                                                disabled={product.stock === 0}
                                                onClick={() => addToCart(product)}
                                            >
                                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Product;