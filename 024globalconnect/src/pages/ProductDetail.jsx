import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref');

  useEffect(() => {
    apiClient.get(`/products/${id}/`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Product not found.");
        navigate('/products');
      });
  }, [id]);

  const getPrice = (product) => {
    if (product.retailer_price > 0) return Number(product.retailer_price);
    if (product.wholesaler_price > 0) return Number(product.wholesaler_price);
    if (product.farmer_price > 0) return Number(product.farmer_price);
    return 0;
  };

  const handleBuyNow = () => {
    const price = getPrice(product);
    const productData = {
      id: product.id,
      name: product.name,
      // ✅ Keep all price fields so checkout view can pick the right one
      retailer_price: product.retailer_price,
      wholesaler_price: product.wholesaler_price,
      farmer_price: product.farmer_price,
      price: price, // for display only
      image: product.image,
      vendor_type: product.vendor_type,
    };

    localStorage.setItem("buyNowProduct", JSON.stringify(productData));
    navigate('/guest-checkout', {
      state: {
        product: productData,
        affiliate_code: refCode || null,
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
    </div>
  );

  const price = getPrice(product);

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4 pb-10">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-semibold text-green-600 mb-2">
          KES {price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {product.quantity_kg} kg available
        </p>

        {refCode && (
          <div className="text-sm text-green-600 bg-green-50 rounded p-2 mb-4">
            ✅ Referral code applied: <strong>{refCode}</strong>
          </div>
        )}

        <button
          onClick={handleBuyNow}
          disabled={product.quantity_kg === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition mb-3"
        >
          🛒 Buy Now
        </button>

        <button
          onClick={() => navigate('/products')}
          className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
        >
          ← Back to Products
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;