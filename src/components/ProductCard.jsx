import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Leaf, Package, Star, Truck } from 'lucide-react';

const ProductCard = ({ product, viewMode, onAddToCart, onWishlist, onQuickView }) => {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-wheat rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
      >
        <div className="flex gap-6">
          {/* Product Image */}
          <div 
            className="w-full h-full flex items-center justify-center bg-cover bg-center rounded-xl"
            style={{
              backgroundImage: product.image ? `url(${product.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: product.image ? 'transparent' : 'wheat'
            }}
          >
            {!product.image && (
              <Package className="h-12 w-12 text-amber-800/60" />
            )}
          </div>

          {/* Product Info */}
          <div className="py-4 pr-4 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-medium text-green-600 uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-green-800 mt-1 font-['Montserrat']">{product.name}</h3>
              </div>
              <button 
                className="p-2 text-amber-600 hover:text-amber-800 transition-colors"
                onClick={() => onWishlist(product)}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-amber-800/80 mt-2 line-clamp-2">
              {product.description}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(product.rating)
                          ? 'text-amber-400 fill-current'
                          : 'text-amber-200'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-amber-600">
                    ({product.totalReviews || 0})
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-lg font-bold text-amber-900">
                    UGX {(product.price * 3800)?.toLocaleString() || '0'}
                  </span>
                  {product.compareAtPrice && (
                    <span className="ml-2 text-sm text-amber-600 line-through">
                      UGX {(product.compareAtPrice * 3800).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                onClick={() => onAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700">
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-1" />
                <span>Free shipping</span>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                <span>In Stock ({product.stock || 0})</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-wheat rounded-2xl shadow-lg border border-amber-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
    >
      {/* Product Image */}
      <div 
        className="relative h-48"
        style={{
          backgroundImage: product.image 
            ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${product.image})` 
            : 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(https://static.vecteezy.com/system/resources/previews/017/607/403/non_2x/blur-abstract-image-with-shining-lights-green-bokeh-background-vector.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'wheat'
        }}
      >
        {!product.image && (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-amber-800/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isOrganic && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              Organic
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Featured
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-amber-100 transition-colors"
            onClick={() => onWishlist(product)}
          >
            <Heart className="h-4 w-4 text-amber-700" />
          </button>
          <button
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-amber-100 transition-colors"
            onClick={() => onQuickView(product)}
          >
            <Eye className="h-4 w-4 text-amber-700" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
              {product.category}
            </span>
            <h3 className="text-lg font-bold text-amber-900 mt-1 font-['Montserrat']">{product.name}</h3>
          </div>
          {product.isOrganic && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <Leaf className="h-3 w-3 inline-block" />
            </span>
          )}
        </div>

        <p className="text-sm text-amber-800/80 mt-2 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(product.rating || 0)
                      ? 'text-amber-400 fill-current'
                      : 'text-amber-200'
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-amber-600">
                ({product.totalReviews || 0})
              </span>
            </div>

            <div className="mt-2">
              <span className="text-lg font-bold text-amber-900">
                UGX {(product.price * 3800)?.toLocaleString() || '0'}
              </span>
              {product.compareAtPrice && (
                <span className="ml-2 text-sm text-amber-600 line-through">
                  UGX {(product.compareAtPrice * 3800).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
