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
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import './product.css';

const product = () => {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: "Relaxing Herbal Tea",
            description: "A soothing blend of chamomile, lavender and mint for relaxation.",
            price: 48000,
            category: "Tea",
            image: "https://i.pinimg.com/1200x/9f/ea/33/9fea33e4aebd714640f6064b154cbe3e.jpg",
            badge: "New"
        },
        {
            id: 2,
            name: "Lavender Essential Oil",
            description: "Pure lavender essential oil for aromatherapy and relaxation.",
            price: 72000,
            category: "Oil",
            image: "https://i.pinimg.com/1200x/d6/cf/47/d6cf47d45692e2320bad9f86c40b07ec.jpg",
            badge: null
        },
        {
            id: 3,
            name: "Turmeric Capsules",
            description: "Anti-inflammatory turmeric capsules for joint health.",
            price: 95000,
            category: "Capsules",
            image: "https://i.pinimg.com/736x/5d/7b/c6/5d7bc6529bd95a851009aa224ceba0da.jpg",
            badge: null
        },
        {
            id: 4,
            name: "Aloe Vera Gel",
            description: "Pure aloe vera gel for skin hydration and soothing sunburns.",
            price: 62000,
            category: "Skincare",
            image: "https://i.pinimg.com/736x/2d/21/a1/2d21a13df06d3fec4cd30a4d16c4d28d.jpg",
            badge: "Bestseller"
        },
        {
            id: 5,
            name: "Ginger Root Capsules",
            description: "Digestive aid and nausea relief with pure ginger root.",
            price: 78000,
            category: "Capsules",
            image: "https://i.pinimg.com/736x/5f/c8/e9/5fc8e9e68157c1095c2c1ac0da01a507.jpg",
            badge: null
        },
        {
            id: 6,
            name: "Herbal Shampoo",
            description: "Natural shampoo with rosemary and mint for hair growth.",
            price: 59000,
            category: "Skincare",
            image: "https://i.pinimg.com/736x/a4/9f/06/a49f06391dcbc338bcfd9fd99f385e22.jpg",
            badge: null
        },
        {
            id: 7,
            name: "Echinacea Tincture",
            description: "Immune-boosting echinacea extract in alcohol-free base.",
            price: 85000,
            category: "Tincture",
            image: "https://i.pinimg.com/1200x/06/7a/8f/067a8fab94c09970467a04c22793ce61.jpg",
            badge: "Sale"
        },
        {
            id: 8,
            name: "Peppermint Essential Oil",
            description: "Pure peppermint oil for digestion and mental clarity.",
            price: 68000,
            category: "Oil",
            image: "https://i.pinimg.com/736x/cf/e2/38/cfe238cd6298761b9a15a6077d057721.jpg",
            badge: null
        }
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [priceRange, setPriceRange] = useState(250000);
    const [activeCategory, setActiveCategory] = useState("All");
    const [isOrganicOnly, setIsOrganicOnly] = useState(true);
    const [viewMode, setViewMode] = useState("grid");
    const [filteredProducts, setFilteredProducts] = useState(products);

    useEffect(() => {
        let filtered = products;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (activeCategory !== "All") {
            filtered = filtered.filter(product => product.category === activeCategory);
        }

        // Price filter
        filtered = filtered.filter(product => product.price <= priceRange);

        setFilteredProducts(filtered);
    }, [searchTerm, priceRange, activeCategory, isOrganicOnly, products]);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    const formatPrice = (price) => {
        return price.toLocaleString('en-US');
    };

    // Convert UGX numeric price to USD to align with Cart.jsx which applies convertToUGX
    const ugxToUsd = (ugx) => {
        const rate = 3800; // must match Cart.jsx convertToUGX
        return Math.round((ugx / rate) * 100) / 100; // keep 2 decimals
    };

    const addToCart = (p) => {
        try {
            // Keep legacy storage for other Cart implementation (USD-based)
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
                    price: ugxToUsd(p.price),
                    quantity: 1,
                });
            }
            localStorage.setItem('herbalCart', JSON.stringify(legacy));

            // Primary storage for current Cart.jsx (UGX-based)
            const storeKey = 'cartPageItems';
            const raw = localStorage.getItem(storeKey);
            const cartPage = raw ? JSON.parse(raw) : [];
            const existing = cartPage.find((item) => item.id === p.id);
            if (existing) {
                existing.qty = (existing.qty || 1) + 1;
            } else {
                cartPage.push({
                    id: p.id,
                    name: p.name,
                    desc: p.description,
                    img: p.image,
                    price: p.price, // UGX
                    qty: 1,
                });
            }
            localStorage.setItem(storeKey, JSON.stringify(cartPage));

            // Notify Navbar/cart badge to update immediately
            window.dispatchEvent(new Event('cartUpdated'));

            // Do not auto-navigate; user will go to cart via navbar icon
            
        } catch (e) {
            console.error('Failed to add to cart', e);
        }
    };

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
                                placeholder="Search for herbal products..."
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
                                  {["All", "Teas", "Oils", "Capsules", "Skincare", "Tinctures"].map(category => (
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
                                <button className="btn btn-primary">Apply Filters</button>
                                <button className="btn btn-outline-secondary">Reset Filters</button>
                            </div>
                        </div>
                    </div>

                {/* Products Section */}
                <div className="row mt-4">
                    {/* Sort and Results Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <p className="results-count">Showing {filteredProducts.length} of {products.length} products</p>
                        <div className="sort-options">
                            <div className="dropdown">
                                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    Sort by: Recommended
                                </button>
                                <ul className="dropdown-menu">
                                    <li><a className="dropdown-item" href="#">Price: Low to High</a></li>
                                    <li><a className="dropdown-item" href="#">Price: High to Low</a></li>
                                    <li><a className="dropdown-item" href="#">Highest Rated</a></li>
                                    <li><a className="dropdown-item" href="#">Most Popular</a></li>
                                    <li><a className="dropdown-item" href="#">Newest First</a></li>
                                </ul>
                            </div>
                            <div className="btn-group view-toggle" role="group">
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
                    <div className={`products-${viewMode}`} id="products-container">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="position-relative product-img-container">
                                    {product.badge && <span className="badge-new">{product.badge}</span>}
                                    <span className="product-category">{product.category}</span>
                                    <img
                                        src={product.image}
                                        className="product-img"
                                        alt={product.name}
                                        loading="lazy"
                                        decoding="async"
                                        fetchPriority="low"
                                        width={600}
                                        height={400}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>
                                <div className="card-body">
                                    <h5 className="card-title product-title">{product.name}</h5>
                                    <p className="card-text">{product.description}</p>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <span className="product-price">
                                            <span className="currency">UGX</span> {formatPrice(product.price)}
                                        </span>
                                        <button type="button" className="btn btn-primary" onClick={() => addToCart(product)}>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <nav className="mt-5">
                        <ul className="pagination justify-content-center">
                            <li className="page-item disabled">
                                <a className="page-link" href="#" tabIndex="-1">Previous</a>
                            </li>
                            <li className="page-item active"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                            <li className="page-item">
                                <a className="page-link" href="#">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default product;