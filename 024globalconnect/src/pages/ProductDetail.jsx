import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import toast from "react-hot-toast";
import { API_ENDPOINTS } from "../api/endpoints";
import { Star } from "lucide-react";

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-6 h-6 cursor-pointer transition ${
          star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
        onClick={() => onChange && onChange(star)}
      />
    ))}
  </div>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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
    fetchRatings();
  }, [id]);

  const fetchRatings = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.PRODUCT_RATINGS(id));
      setRatings(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch {
      setRatings([]);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewRating) {
      toast.error("Please enter your name and a star rating.");
      return;
    }
    setSubmittingReview(true);
    try {
      await apiClient.post(API_ENDPOINTS.PRODUCT_RATINGS(id), {
        rating: reviewRating,
        comment: reviewComment,
        reviewer_name: reviewName,
        reviewer_email: reviewEmail,
      });
      toast.success("Review submitted!");
      setReviewName("");
      setReviewEmail("");
      setReviewRating(5);
      setReviewComment("");
      fetchRatings();
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

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
  const isFarm = product.is_farm_product;
  const stock = isFarm ? product.quantity_kg : product.stock;
  const outOfStock = stock === 0;
  const avgRating = product.avg_rating ? Number(product.avg_rating).toFixed(1) : null;

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4 pb-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          {/* Average rating */}
          {avgRating && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating value={Math.round(product.avg_rating)} />
              <span className="text-sm text-gray-500">{avgRating} ({product.rating_count} review{product.rating_count !== 1 ? 's' : ''})</span>
            </div>
          )}

          <p className="text-2xl font-semibold text-green-600 mb-2">
            KES {price.toLocaleString()}
          </p>

          {outOfStock ? (
            <p className="text-sm font-semibold text-red-500 mb-4">Out of Stock</p>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              {stock} {isFarm ? 'kg' : 'units'} available
            </p>
          )}

          {refCode && (
            <div className="text-sm text-green-600 bg-green-50 rounded p-2 mb-4">
              Referral code applied: <strong>{refCode}</strong>
            </div>
          )}

          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className={`w-full font-semibold py-3 rounded-lg transition mb-3 ${
              outOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {outOfStock ? 'Out of Stock' : 'Buy Now'}
          </button>

          <button
            onClick={() => navigate('/products')}
            className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
          >
            ← Back to Products
          </button>
        </div>

        {/* Ratings Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Reviews</h2>

          {ratings.length === 0 ? (
            <p className="text-gray-500 text-sm mb-6">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4 mb-6">
              {ratings.map((r) => (
                <div key={r.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating value={r.rating} />
                    <span className="text-sm font-semibold text-gray-700">{r.reviewer_name || 'Anonymous'}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Submit Review Form */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={reviewEmail}
              onChange={(e) => setReviewEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating</label>
              <StarRating value={reviewRating} onChange={setReviewRating} />
            </div>
            <textarea
              placeholder="Share your experience (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;