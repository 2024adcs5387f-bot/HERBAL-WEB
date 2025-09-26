import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  ShoppingCart, 
  Leaf, 
  Shield, 
  Heart,
  Package,
  Truck,
  CheckCircle,
  ArrowLeft,
  Minus,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data - replace with your API data
  const product = {
    id: 1,
    name: 'Organic Turmeric Powder',
    scientificName: 'Curcuma longa',
    price: 24.99,
    compareAtPrice: 32.99,
    rating: 4.8,
    reviewCount: 127,
    description: 'Premium organic turmeric powder with high curcumin content. Sourced from the finest organic farms and carefully processed to preserve its natural properties. This golden spice has been used for centuries in traditional medicine for its powerful anti-inflammatory and antioxidant benefits.',
    benefits: [
      'Powerful anti-inflammatory properties',
      'Boosts immune system function',
      'Rich in antioxidants and curcumin',
      'Supports joint health and mobility',
      'Promotes healthy digestion',
      'Natural pain relief support'
    ],
    usage: 'Mix 1/2 to 1 teaspoon in warm water, smoothies, or add to your favorite recipes. Best taken with black pepper to enhance absorption.',
    ingredients: '100% Organic Turmeric Root (Curcuma longa)',
    storage: 'Store in a cool, dry place away from direct sunlight. Keep container tightly sealed.',
    weight: '250g (8.8 oz)',
    origin: 'India',
    certifications: ['USDA Organic', 'Non-GMO', 'Vegan', 'Gluten-Free'],
    image: '/images/turmeric.jpg',
    gallery: [
      '/images/turmeric.jpg',
      '/images/turmeric-2.jpg',
      '/images/turmeric-3.jpg'
    ],
    inStock: true,
    stockCount: 45
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    try {
      // Update 'herbalCart' (uses 'quantity')
      const legacyRaw = localStorage.getItem('herbalCart');
      const legacy = legacyRaw ? JSON.parse(legacyRaw) : [];
      const existingLegacy = legacy.find((item) => item.id === product.id);
      if (existingLegacy) {
        existingLegacy.quantity = (existingLegacy.quantity || 0) + quantity;
      } else {
        legacy.push({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          quantity: quantity,
        });
      }
      localStorage.setItem('herbalCart', JSON.stringify(legacy));

      // Update 'cartPageItems' (uses 'qty') for Cart.jsx page
      const pageRaw = localStorage.getItem('cartPageItems');
      const pageItems = pageRaw ? JSON.parse(pageRaw) : [];
      const existingPage = pageItems.find((item) => item.id === product.id);
      if (existingPage) {
        existingPage.qty = (existingPage.qty || 0) + quantity;
      } else {
        pageItems.push({
          id: product.id,
          name: product.name,
          desc: product.description,
          img: product.image,
          price: Math.round(product.price * 3800),
          qty: quantity,
        });
      }
      localStorage.setItem('cartPageItems', JSON.stringify(pageItems));

      // Notify Navbar to update count immediately
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="min-h-screen pt-40" style={{ backgroundColor: '#1B5E20' }}>
      <div className="container">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <nav className="flex items-center space-x-2 text-sm text-primary-200">
            <Link to="/" className="hover:text-primary-300 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary-300 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </nav>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <div className="w-full h-96 bg-white dark:bg-neutral-800 flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="h-24 w-24 text-neutral-400 dark:text-neutral-500 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">Product Image</p>
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-3">
              {product.gallery.map((image, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
<div className="w-full h-24 bg-white dark:bg-neutral-800 flex items-center justify-center">
                    <Leaf className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-primary-200 italic mb-4">
                {product.scientificName}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-neutral-300 dark:text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-primary-200">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-white">
                  ${product.price}
                </span>
                {product.compareAtPrice && (
                  <span className="text-xl text-primary-200 line-through">
                    ${product.compareAtPrice}
                  </span>
                )}
                {product.compareAtPrice && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm font-medium rounded-full">
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
              <p className="text-white leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center font-medium text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn btn-primary btn-lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-400 dark:text-neutral-500 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-sm">
              {product.inStock ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>In Stock ({product.stockCount} available)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-neutral-200 dark:border-neutral-700">
              <div>
                <span className="text-sm text-primary-200">Weight:</span>
                <p className="font-medium text-white">{product.weight}</p>
              </div>
              <div>
                <span className="text-sm text-primary-200">Origin:</span>
                <p className="font-medium text-white">{product.origin}</p>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-full flex items-center gap-2"
                  >
                    <Shield className="h-3 w-3" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 space-y-8"
        >
          {/* Benefits */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Leaf className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              Health Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {product.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-white">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage & Storage */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Usage Instructions
              </h3>
              <p className="text-white leading-relaxed">
                {product.usage}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Storage & Handling
              </h3>
              <p className="text-white leading-relaxed">
                {product.storage}
              </p>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Ingredients</h3>
            <p className="text-white">
              {product.ingredients}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;