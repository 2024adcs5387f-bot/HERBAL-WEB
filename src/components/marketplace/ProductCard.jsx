import { Star, ShoppingCart, Heart, Leaf, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const {
    id,
    name,
    description,
    price,
    rating = 0,
    image,
    isOrganic = false,
    category
  } = product;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="product-card group bg-wheat rounded-xl overflow-hidden border border-amber-100 shadow-lg" style={{ backgroundColor: 'wheat' }}
    >
      {/* Product Image */}
      <div className="relative h-56 overflow-hidden" style={{ backgroundColor: 'wheat' }}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800">{name}</h3>
              <p className="text-sm text-green-600 mt-1">{category}</p>
              <span className="text-sm text-green-600/80">No image available</span>
            </div>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOrganic && (
            <div className="organic-badge flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              <Leaf className="h-3 w-3" />
              <span>Organic</span>
            </div>
          )}
          <div className="herbal-badge bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Herbal</span>
          </div>
        </div>

        {/* Wishlist Button */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors group"
        >
          <Heart className="h-4 w-4 text-white group-hover:text-red-400 transition-colors" />
        </motion.button>

        {/* Quick Actions */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full btn-primary py-2 text-sm backdrop-blur-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Quick Add
          </motion.button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-content p-5">
        <div className="mb-3">
          <span className="text-xs text-green-600 uppercase tracking-wider font-medium">
            {category}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-green-800 group-hover:text-green-600 transition-colors font-montserrat">
          {name}
        </h3>
        
        <p className="text-sm text-green-700/90 mt-2 font-sans">
          {description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-green-700/80 ml-2">
            ({rating.toFixed(1)})
          </span>
          <span className="text-xs text-green-700/60 ml-auto">
            {Math.floor(Math.random() * 50 + 10)} reviews
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-green-800">
              UGX {(price * 3800).toLocaleString()}
            </span>
            <span className="text-xs text-green-600/70 line-through">
              UGX {(price * 1.2 * 3800).toLocaleString()}
            </span>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Add to Cart
          </button>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-green-100">
          <div className="flex items-center gap-4 text-xs text-green-700/80">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              In Stock
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Free Shipping
            </span>
          </div>
          <span className="text-xs text-green-600/80 font-medium">2-3 days delivery</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
