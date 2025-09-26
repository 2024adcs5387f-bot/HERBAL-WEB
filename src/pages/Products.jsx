import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Filter,
  Search,
  Grid,
  List,
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Leaf,
  Package,
  Award,
  Truck
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    organicOnly: false,
    sortBy: 'featured'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced mock products data
  const products = [
    {
      id: 1,
      name: 'Organic Turmeric Powder',
      description: 'Premium quality turmeric powder with powerful anti-inflammatory properties. Sourced from organic farms in India.',
      price: 24.99,
      compareAtPrice: 29.99,
      rating: 4.8,
      totalReviews: 156,
      image: null,
      isOrganic: true,
      category: 'Spices & Herbs',
      subcategory: 'Roots & Rhizomes',
      stock: 50,
      isFeatured: true,
      tags: ['anti-inflammatory', 'antioxidant', 'digestive'],
      seller: 'Organic Farms Co.',
      origin: 'India'
    },
    {
      id: 2,
      name: 'Ashwagandha Root Extract',
      description: 'Natural adaptogen for stress relief, energy boost, and improved mental clarity. Third-party tested for purity.',
      price: 34.99,
      compareAtPrice: 39.99,
      rating: 4.6,
      totalReviews: 89,
      image: null,
      isOrganic: false,
      category: 'Supplements',
      subcategory: 'Adaptogens',
      stock: 30,
      isFeatured: true,
      tags: ['stress-relief', 'energy', 'cognitive'],
      seller: 'Wellness Labs',
      origin: 'India'
    },
    {
      id: 3,
      name: 'Chamomile Tea Blend',
      description: 'Soothing herbal tea blend for relaxation and better sleep. Hand-picked flowers from certified organic gardens.',
      price: 18.99,
      compareAtPrice: 22.99,
      rating: 4.9,
      totalReviews: 234,
      image: null,
      isOrganic: true,
      category: 'Teas',
      subcategory: 'Herbal Blends',
      stock: 75,
      isFeatured: false,
      tags: ['relaxation', 'sleep', 'calming'],
      seller: 'Tea Garden Co.',
      origin: 'Germany'
    },
    {
      id: 4,
      name: 'Ginkgo Biloba Extract',
      description: 'Premium cognitive support supplement for memory and mental focus. Standardized extract with 24% flavonoids.',
      price: 29.99,
      compareAtPrice: 34.99,
      rating: 4.5,
      totalReviews: 67,
      image: null,
      isOrganic: false,
      category: 'Supplements',
      subcategory: 'Cognitive Support',
      stock: 45,
      isFeatured: false,
      tags: ['memory', 'focus', 'cognitive'],
      seller: 'Brain Health Inc.',
      origin: 'China'
    },
    {
      id: 5,
      name: 'Lavender Essential Oil',
      description: 'Pure therapeutic grade lavender oil for aromatherapy and relaxation. Steam distilled from French lavender.',
      price: 22.99,
      compareAtPrice: 26.99,
      rating: 4.7,
      totalReviews: 189,
      image: null,
      isOrganic: true,
      category: 'Essential Oils',
      subcategory: 'Floral Oils',
      stock: 60,
      isFeatured: true,
      tags: ['relaxation', 'aromatherapy', 'sleep'],
      seller: 'Pure Essence',
      origin: 'France'
    },
    {
      id: 6,
      name: 'Echinacea Immune Support',
      description: 'Natural immune system booster made from purple coneflower. Supports overall wellness and vitality.',
      price: 26.99,
      compareAtPrice: 31.99,
      rating: 4.4,
      totalReviews: 112,
      image: null,
      isOrganic: true,
      category: 'Supplements',
      subcategory: 'Immune Support',
      stock: 40,
      isFeatured: false,
      tags: ['immune', 'wellness', 'vitality'],
      seller: 'Nature\'s Best',
      origin: 'USA'
    }
  ];

  const categories = [
    { value: 'spices-herbs', label: 'Spices & Herbs', icon: Leaf },
    { value: 'supplements', label: 'Supplements', icon: Package },
    { value: 'teas', label: 'Herbal Teas', icon: Package },
    { value: 'essential-oils', label: 'Essential Oils', icon: Package },
    { value: 'powders', label: 'Powders & Extracts', icon: Package },
    { value: 'capsules', label: 'Capsules & Tablets', icon: Package }
  ];

  const priceRanges = [
    { value: '0-95000', label: 'Under UGX 95,000' },
    { value: '95000-190000', label: 'UGX 95,000 - 190,000' },
    { value: '190000-380000', label: 'UGX 190,000 - 380,000' },
    { value: '380000+', label: 'Over UGX 380,000' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const filteredProducts = products.filter(product => {
    if (filters.organicOnly && !product.isOrganic) return false;
    if (filters.category && product.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      case 'popular':
        return b.totalReviews - a.totalReviews;
      default:
        return b.isFeatured - a.isFeatured;
    }
  });

  const handleAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('herbalCart') || '[]');
    const existingItem = existingCart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('herbalCart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
    // You could add a toast notification here
  };

  const handleQuickView = (product) => {
    // Implement quick view modal
    console.log('Quick view:', product.name);
  };

  const handleWishlist = (product) => {
    // Implement wishlist functionality
    console.log('Added to wishlist:', product.name);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      organicOnly: false,
      sortBy: 'featured'
    });
    setSearchQuery('');
  };

  return (
    <div 
      className="min-h-screen pt-24 relative"
      style={{ backgroundColor: '#88E788', }}
    >
      <div className="container relative">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >

          <div className="text-center mb-8" style={{paddingTop:'40px',}}>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              Herbal Products
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
              Discover our curated collection of premium herbal remedies and natural wellness products.

              Each item is carefully selected and verified for quality and authenticity.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-200" />
              <input
                type="text"
                placeholder="Search for herbs, supplements, teas, or specific health benefits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-neutral-300 dark:border-neutral-600 rounded-2xl focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 bg-white dark:bg-neutral-800 text-white placeholder-primary-200"
              />
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80"
          >
            <div className="bg-[#1B5E20] text-white rounded-2xl shadow-lg p-6 sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-white">

                  <SlidersHorizontal className="h-5 w-5 text-white" />

                  Filters
                </h2>
                <button
                  onClick={clearFilters}

                  className="text-sm text-white/80 hover:text-white font-medium transition-colors"

                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="form-label text-white">Categories</label>

                  <select

                    className="form-input"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.label}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="form-label text-white">Price Range</label>

                  <select

                    className="form-input"
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                  >
                    <option value="">Any Price</option>
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Organic Filter */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="organicOnly"
                    checked={filters.organicOnly}
                    onChange={(e) => setFilters({ ...filters, organicOnly: e.target.checked })}
                    className="form-checkbox h-5 w-5 rounded border-white/50 bg-white/10 text-white focus:ring-white/50"
                  />

                  <label
                    htmlFor="organicOnly"
                    className="text-sm font-medium flex items-center gap-2 text-white/90"
                  >
                    <Leaf className="h-4 w-4 text-white" />

                    Organic Only
                  </label>
                </div>

                {/* Sort Filter */}
                <div>
                  <label className="form-label text-white">Sort By</label>

                  <select

                    className="form-input"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Count */}

                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-white/80">
                    Showing <span className="font-semibold text-white">{filteredProducts.length}</span> of{' '}
        <span className="font-semibold text-white">{products.length}</span> products
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products Section */}
          <div className="flex-1">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white">View:</span>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}

                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid'
                      ? 'bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}
      >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}

                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list'
                      ? 'bg-white dark:bg-neutral-600 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}

                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-primary-200">
                <Truck className="h-4 w-4" />
                <span>Free shipping on orders over UGX 190,000</span>
              </div>
            </div>

            {/* Products Grid/List */}
            {sortedProducts.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
                }`}>
                {sortedProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    onWishlist={handleWishlist}
                    onQuickView={handleQuickView}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-primary-200" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                <p className="text-primary-200 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}

            {/* Load More */}
            {sortedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-12"
              >
                <button className="btn btn-outline btn-lg">
                  Load More Products
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;