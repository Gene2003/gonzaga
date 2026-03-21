// src/pages/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { addToCart, getCartCount } from '../api/utils/cart';
import {
  ShoppingCart,
  Search,
  Filter,
  X,
  Package,
  Store,
} from 'lucide-react';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVendorType, setSelectedVendorType] = useState('All');
  const [cartCount, setCartCount] = useState(getCartCount());

  const categories = [
    'All',
    'Electronics',
    'Fashion',
    'Health & Beauty',
    'Home & Kitchen',
    'Books',
    'Food & Grocery',
    'Toys & Games',
    'Sports & Outdoors',
    'Automotive',
    'Others'
  ];

  const vendorTypes = ['All', 'Farmer', 'Wholesaler', 'Retailer'];

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products/');
      const data = response.data; // ✅ Debug log
      setProducts(Array.isArray(data) ? data : (data.results || [])); // Handle pagination if needed
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // ✅ FIX: category might be null or an object
    const productCategory = product.category?.name || product.category || '';
    const matchesCategory = selectedCategory === 'All' || productCategory === selectedCategory;
    
    const matchesVendorType = selectedVendorType === 'All' || 
                              product.vendor_type?.toLowerCase() === selectedVendorType.toLowerCase();
    
    // ✅ FIX: Don't filter by approved and is_active on frontend (backend should handle this)
    return matchesSearch && matchesCategory && matchesVendorType;
  });

  // Get price based on vendor type
  const getPrice = (product) => {
    if (Number(product.retailer_price) > 0) return Number(product.retailer_price);
    if (Number(product.wholesaler_price) > 0) return Number(product.wholesaler_price);
    if (Number(product.farmer_price) > 0) return Number(product.farmer_price);
    return 0;
  };

  const handleAddToCart = (product) => {
    const price = getPrice(product);
    addToCart({ ...product, price });
    const newCount = getCartCount();
    setCartCount(newCount);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Products
          </h1>
          <p className="text-gray-600">
            Discover products from our verified vendors
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline w-4 h-4 mr-2" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Vendor Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Store className="inline w-4 h-4 mr-2" />
              Vendor Type
            </label>
            <div className="flex gap-2">
              {vendorTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedVendorType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedVendorType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCategory !== 'All' || selectedVendorType !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedVendorType('All');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500">
              {products.length === 0 
                ? 'No products available yet. Check back soon!'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                getPrice={getPrice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          Go to Cart
          <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, getPrice }) => {
  const navigate = useNavigate();
  const price = getPrice(product);
  const imageUrl = product.image || 'https://placehold.co/300x300?text=No+Image';
  
  const isFarm = product.is_farm_product;
  const stockValue = isFarm ? (product.quantity_kg ?? 0) : (product.stock ?? product.quantity_kg ?? 0);
  const isOutOfStock = stockValue === 0;

  const handleBuyNow = () => {

    const params = new URLSearchParams(window.location.search);
    const affiliateCode = params.get('ref');

    if (affiliateCode) {
      navigate(`/products/${product.id}?ref=${affiliateCode}`);
    } else {
      // ✅ No affiliate code, just navigate to guest checkout
      const productData = {
        id: product.id,
        name: product.name,
        retailer_price: product.retailer_price,
        wholesaler_price: product.wholesaler_price,
        farmer_price: product.farmer_price,
        price: price,
        image: product.image,
        vendor_type: product.vendor_type,
      };

      localStorage.setItem("buyNowProduct", JSON.stringify(productData));
      navigate('/guest-checkout', {
        state: {
          product: productData,
          affiliate_code: affiliateCode || null,
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if placeholder also fails
            e.target.src = 'https://placehold.co/300x300?text=No+Image';
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Vendor Info */}
        <div className="flex items-center gap-2 mb-3">
          <Store className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            {product.vendor_type && (
              <span className="font-medium">{product.vendor_type}</span>
            )}
            {product.vendor_name && ` - ${product.vendor_name}`}
          </span>
        </div>

        {/* Price and Stock */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold text-green-600">
              KES {price.toLocaleString()}
            </span>
            {stockValue > 0 && (
              <p className="text-xs text-gray-500">
                {stockValue} {isFarm ? 'kg' : 'units'} available
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition mb-2 ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>

        {/* Buy Now Button */}
        <button
         onClick={handleBuyNow}
         disabled={isOutOfStock}
         className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
          isOutOfStock
           ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
           : 'bg-green-600 text-white hover:bg-green-700'
      }`}
        > 
        🛒 Buy Now
        </button>
        </div>
      </div>
  );
};

export default ProductsPage;