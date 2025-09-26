import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ShoppingCart, BookOpen, Leaf, Heart } from "lucide-react";
import "./TopSearchBar.css";

const TopSearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="topbar-wrapper">
      <div className="container-system container-xl topbar">
        <form onSubmit={onSubmit} className="topbar-search">
          <Search className="icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, herbs, research..."
            aria-label="Search"
          />
          <button type="submit" className="topbar-btn">Search</button>
        </form>
        <div className="topbar-quicklinks">
          <Link to="/products" className="qlink"><ShoppingCart className="icon" /> Products</Link>
          <Link to="/research" className="qlink"><BookOpen className="icon" /> Research</Link>
          <Link to="/plant-scanner" className="qlink"><Leaf className="icon" /> Scanner</Link>
          <Link to="/symptom-checker" className="qlink"><Heart className="icon" /> Symptoms</Link>
        </div>
      </div>
    </div>
  );
};

export default TopSearchBar;
