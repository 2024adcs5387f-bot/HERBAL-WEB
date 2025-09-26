// CartPage.jsx
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./CartPage.css"; // put your <style> content here

const CartPage = () => {
    // Cart items state (load from localStorage key used by Products page)
    const [cartItems, setCartItems] = useState(() => {
        try {
            const stored = localStorage.getItem('cartPageItems');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [recentProducts] = useState([
        {
            id: 1,
            title: "Turmeric Capsules",
            price: 95000,
            img: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=500&h=500&q=80",
            desc: "Anti-inflammatory turmeric capsules for joint health and overall wellness.",
        },
        {
            id: 2,
            title: "Herbal Shampoo",
            price: 59000,
            img: "https://images.unsplash.com/photo-1571781926291-47774e3ba5c6?auto=format&fit=crop&w=500&h=500&q=80",
            desc: "Natural shampoo with rosemary and mint for hair growth and scalp health.",
        },
        {
            id: 3,
            title: "Echinacea Tincture",
            price: 85000,
            img: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=500&h=500&q=80",
            desc: "Immune-boosting echinacea extract in alcohol-free base for daily wellness.",
        },
        {
            id: 4,
            title: "Peppermint Oil",
            price: 68000,
            img: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=500&h=500&q=80",
            desc: "Pure peppermint oil for digestion support and mental clarity enhancement.",
        },
    ]);

    // Functions
    const increaseQty = (id) => {
        setCartItems((items) => {
            const next = items.map((item) =>
                item.id === id ? { ...item, qty: item.qty + 1 } : item
            );
            localStorage.setItem('cartPageItems', JSON.stringify(next));
            window.dispatchEvent(new Event('cartUpdated'));
            return next;
        });
    };

    const decreaseQty = (id) => {
        setCartItems((items) => {
            const next = items.map((item) =>
                item.id === id && item.qty > 1
                    ? { ...item, qty: item.qty - 1 }
                    : item
            );
            localStorage.setItem('cartPageItems', JSON.stringify(next));
            window.dispatchEvent(new Event('cartUpdated'));
            return next;
        });
    };

    const removeItem = (id) => {
        setCartItems((items) => {
            const next = items.filter((item) => item.id !== id);
            localStorage.setItem('cartPageItems', JSON.stringify(next));
            window.dispatchEvent(new Event('cartUpdated'));
            return next;
        });
    };

    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.qty,
        0
    );

    return (
        <div className="cart-page">
            <div className="container my-5">
                {/* Title */}
                <div className="row">
                    <div className="col-12">
                        <h1 className="section-title">Shopping Cart</h1>
                        <Link to="/products" className="continue-shopping">
                            <i className="fas fa-arrow-left me-2"></i>Continue Shopping
                        </Link>
                    </div>
                </div>

                <div className="row mt-4">
                    {/* Cart Items */}
                    <div className="col-lg-8">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="row">
                                    <div className="col-md-3">
                                        <img src={item.img} alt={item.name} className="product-img" />
                                    </div>
                                    <div className="col-md-9">
                                        <div className="d-flex justify-content-between">
                                            <h4>
                                                {item.name}{" "}
                                                {item.tag && (
                                                    <span className="discount-badge">{item.tag}</span>
                                                )}
                                            </h4>
                                            <div>
                                                {item.oldPrice && (
                                                    <span className="text-muted text-decoration-line-through me-2">
                                                        UGX {item.oldPrice.toLocaleString()}
                                                    </span>
                                                )}
                                                <span className="product-price fw-bold">
                                                    UGX {item.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-muted">{item.desc}</p>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <label className="me-2">Qty:</label>
                                                <div className="input-group quantity-input-group" style={{ width: "120px" }}>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() => decreaseQty(item.id)}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        className="form-control text-center quantity-input"
                                                        value={item.qty}
                                                        readOnly
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() => increaseQty(item.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <i className="fas fa-trash me-1"></i> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Promo Code Section */}
                        <div className="promo-section">
                            <h5>
                                <i className="fas fa-tag me-2"></i>Have a promo code?
                            </h5>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter promo code"
                                />
                                <button className="btn btn-primary" type="button">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="col-lg-4">
                        <div className="summary-card">
                            <h3 className="mb-4">Cart Summary</h3>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold">Subtotal</span>
                                <span className="fw-bold">UGX {subtotal.toLocaleString()}</span>
                            </div>
                            <button className="btn btn-primary btn-lg w-100 mb-3">
                                Proceed to Checkout
                            </button>
                            <div className="text-center">
                                <p className="text-muted">or</p>
                                <button className="btn btn-outline-primary w-100">
                                    <i className="fab fa-paypal me-2"></i> Checkout with PayPal
                                </button>
                            </div>
                            <div className="mt-4">
                                <h6>We accept:</h6>
                                <div className="d-flex">
                                    <i className="fab fa-cc-visa fa-2x me-2 text-primary"></i>
                                    <i className="fab fa-cc-mastercard fa-2x me-2 text-danger"></i>
                                    <i className="fab fa-cc-paypal fa-2x me-2 text-primary"></i>
                                    <i className="fab fa-cc-apple-pay fa-2x me-2 text-dark"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recently Viewed */}
                <div className="row mt-5">
                    <div className="col-12">
                        <h3 className="section-title">Recently Viewed</h3>
                    </div>
                    {recentProducts.map((p) => (
                        <div key={p.id} className="col-md-3 col-sm-6 mb-4">
                            <div className="card recent-product-card h-100">
                                <img src={p.img} alt={p.title} className="recent-product-img" />
                                <div className="card-body">
                                    <h5 className="card-title">{p.title}</h5>
                                    <p className="recent-product-description">{p.desc}</p>
                                    <p className="card-text fw-bold">UGX {p.price.toLocaleString()}</p>
                                    <button className="btn btn-outline-primary btn-sm w-100">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-dark text-white py-5 mt-5">
                <div className="container">
                    <div className="row">
                        {/* About */}
                        <div className="col-md-4 mb-4">
                            <h5>Herbal Haven</h5>
                            <p>
                                Pure herbal products for natural wellness and sustainable living.
                            </p>
                            <div className="d-flex">
                                <a href="#" className="text-white me-3">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="text-white me-3">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="text-white me-3">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="text-white">
                                    <i className="fab fa-pinterest"></i>
                                </a>
                            </div>
                        </div>
                        {/* Shop */}
                        <div className="col-md-2 mb-4">
                            <h5>Shop</h5>
                            <ul className="list-unstyled">
                                <li><a href="#" className="text-white text-decoration-none">Herbal Teas</a></li>
                                <li><a href="#" className="text-white text-decoration-none">Essential Oils</a></li>
                                <li><a href="#" className="text-white text-decoration-none">Capsules</a></li>
                                <li><a href="#" className="text-white text-decoration-none">Skincare</a></li>
                            </ul>
                        </div>
                        {/* Company */}
                        <div className="col-md-2 mb-4">
                            <h5>Company</h5>
                            <ul className="list-unstyled">
                                <li><a href="#" className="text-white text-decoration-none">About Us</a></li>
                                <li><a href="#" className="text-white text-decoration-none">Sustainability</a></li>
                                <li><a href="#" className="text-white text-decoration-none">Blog</a></li>
                                <li><a href="#" className="text-white text-decoration-none">Careers</a></li>
                            </ul>
                        </div>
                        {/* Newsletter */}
                        <div className="col-md-4 mb-4">
                            <h5>Newsletter</h5>
                            <p>
                                Subscribe to get special offers, free giveaways, and herbal
                                wellness tips.
                            </p>
                            <div className="input-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Your email address"
                                />
                                <button className="btn btn-primary">Subscribe</button>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-md-6">
                            <p>&copy; 2023 Herbal Haven. All rights reserved.</p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <a href="#" className="text-white text-decoration-none me-3">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-white text-decoration-none me-3">
                                Terms of Service
                            </a>
                            <a href="#" className="text-white text-decoration-none">
                                Shipping & Returns
                            </a>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-12 text-center">
                            <p className="mb-0">
                                <small>Images from Unsplash and Pinterest</small>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CartPage;
