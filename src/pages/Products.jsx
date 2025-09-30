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
  const R2_BASE = import.meta.env.VITE_R2_PUBLIC_URL || '';
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    organicOnly: false,
    sortBy: 'featured'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Core fetcher
  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products/supabase-list', { cache: 'no-store' });
      const data = await response.json();

      console.log('API Response:', data);
      console.log('Products count:', data.data?.products?.length);

      if (data.success && Array.isArray(data.data?.products)) {
        // Transform Supabase data to match component expectations
        const transformedProducts = data.data.products.map((raw) => {
            // Normalize field names (snake_case -> camelCase)
            const p = {
              id: raw.id,
              name: raw.name || raw.title || 'Unnamed Product',
              description: raw.description || '',
              price: Number(raw.price ?? raw.unit_price ?? 0),
              compareAtPrice: raw.compare_at_price ?? raw.compareAtPrice ?? null,
              rating: Number(raw.rating ?? 0),
              totalReviews: Number(raw.total_reviews ?? raw.totalReviews ?? 0),
              isOrganic: Boolean(raw.is_organic ?? raw.isOrganic ?? false),
              category: raw.category || 'Other',
              subcategory: raw.subcategory || '',
              stock: Number(raw.stock ?? 0),
              isFeatured: Boolean(raw.is_featured ?? raw.isFeatured ?? false),
              tags: Array.isArray(raw.tags) ? raw.tags : [],
              seller: raw.users?.name || raw.users?.business_name || 'Unknown Seller',
              origin: raw.origin || 'Unknown',
              botanicalName: raw.botanical_name || raw.botanicalName || '',
              medicinalUses: Array.isArray(raw.medicinal_uses) ? raw.medicinal_uses : [],
              contraindications: Array.isArray(raw.contraindications) ? raw.contraindications : [],
              dosage: raw.dosage || '',
              preparation: raw.preparation || ''
            };

            // Image extraction: supports array, single string, or JSON string
            let image = null;
            if (Array.isArray(raw.images) && raw.images.length > 0) {
              image = raw.images[0];
            } else if (typeof raw.images === 'string') {
              // Try parse JSON array string; if not JSON, treat as direct URL
              try {
                const parsed = JSON.parse(raw.images);
                if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
                else image = raw.images; // likely direct URL
              } catch {
                image = raw.images; // direct URL string
              }
            } else if (raw.image_url || raw.imageUrl) {
              image = raw.image_url || raw.imageUrl;
            }
            // If image is an R2 key (no protocol), prefix with public base URL when available
            if (image && !/^https?:\/\//i.test(image) && R2_BASE) {
              image = `${R2_BASE.replace(/\/$/, '')}/${String(image).replace(/^\//, '')}`;
            }
            p.image = image || null;

            return p;
          });

        // Fallback: if transform yielded 0 but API has items, use minimal mapping
        if (transformedProducts.length === 0 && data.data.products.length > 0) {
          const minimal = data.data.products.map((r) => ({
            id: r.id,
            name: r.name || 'Product',
            description: r.description || '',
            price: Number(r.price ?? 0),
            image: Array.isArray(r.images) ? r.images[0] : (r.image_url || r.imageUrl || null),
            category: r.category || 'Other',
            rating: Number(r.rating ?? 0),
            totalReviews: Number(r.total_reviews ?? 0)
          }));
          setProducts(minimal);
        } else {
          setProducts(transformedProducts);
        }
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load + polling and focus refresh
  useEffect(() => {
    let timer;
    loadProducts();
    // Poll every 15 seconds
    timer = setInterval(loadProducts, 15000);

    // Refresh on tab focus / visibility change
    const onFocus = () => loadProducts();
    const onVisibility = () => { if (document.visibilityState === 'visible') loadProducts(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const categories = [
    { value: 'herbs', label: 'Herbs', icon: Leaf },
    { value: 'supplements', label: 'Supplements', icon: Package },
    { value: 'teas', label: 'Teas', icon: Package },
    { value: 'oils', label: 'Oils', icon: Package },
    { value: 'powders', label: 'Powders', icon: Package },
    { value: 'capsules', label: 'Capsules', icon: Package },
    { value: 'tinctures', label: 'Tinctures', icon: Package },
    { value: 'other', label: 'Other', icon: Package }
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
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.includes('+') 
        ? [parseFloat(filters.priceRange.replace('+', '')), Infinity]
        : filters.priceRange.split('-').map(p => parseFloat(p));
      const priceInCents = product.price * 100;
      if (priceInCents < min || priceInCents > max) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        product.name,
        product.description,
        product.botanicalName,
        ...(product.tags || []),
        ...(product.medicinalUses || [])
      ].join(' ').toLowerCase();
      if (!searchableText.includes(query)) return false;
    }
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
  };

  const handleQuickView = (product) => {
    console.log('Quick view:', product.name);
  };

  const handleWishlist = (product) => {
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

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Error loading products</h3>
                <p className="text-red-200 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : sortedProducts.length > 0 ? (
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
