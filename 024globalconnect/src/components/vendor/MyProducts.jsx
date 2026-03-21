// src/components/vendor/MyProducts.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/my_products/`);
      const data = res.data;
      setProducts(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      toast.error("Failed to load your products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock) => {
    const val = parseInt(newStock, 10);
    if (isNaN(val) || val < 0) return;
    try {
      await apiClient.patch(`/products/${productId}/`, { quantity_kg: val, stock: val });
      toast.success("Stock updated");
      fetchVendorProducts();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  useEffect(() => { fetchVendorProducts(); }, []);

  if (loading) return <p className="text-gray-500 py-4">Loading your products...</p>;

  const getPrice = (p) =>
    p.farmer_price || p.wholesaler_price || p.retailer_price || 0;

  const getStock = (p) =>
    p.is_farm_product ? p.quantity_kg : p.stock;

  const getStockLabel = (p) =>
    p.is_farm_product ? `${getStock(p)} kg` : `${getStock(p)} units`;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => {
            const stock = getStock(product);
            const outOfStock = stock === 0;

            return (
              <div key={product.id} className="border p-4 rounded-lg shadow bg-white relative">
                {outOfStock && (
                  <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}

                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}

                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.description}</p>

                <p className="text-sm font-semibold text-green-700 mb-2">
                  Price: KES {Number(getPrice(product)).toLocaleString()}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Stock ({product.is_farm_product ? 'kg' : 'units'}):
                  </label>
                  <input
                    type="number"
                    value={stock}
                    min="0"
                    onChange={(e) => updateStock(product.id, e.target.value)}
                    className="w-24 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-xs text-gray-500">{getStockLabel(product)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Visible to: <span className="font-semibold text-gray-600">{product.visible_to}</span>
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {product.approved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProducts;