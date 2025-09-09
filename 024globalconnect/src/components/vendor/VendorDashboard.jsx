import React, { useState, useEffect } from "react";
import MyProduct from "./MyProducts";
import AddProductForm from "./AddProductForm";
import SalesOverview from "./SalesOverview";

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    // Fetch existing feedbacks for this vendor
    fetch("http://127.0.0.1:8000/api/vendor-feedback/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setFeedbacks(data))
      .catch((err) => console.error("Error loading feedbacks:", err));
  }, []);

  const handleFeedbackSubmit = () => {
    fetch("http://127.0.0.1:8000/api/vendor-feedback/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ rating, feedback }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSubmitted(true);
        setRating(0);
        setFeedback("");
        setFeedbacks([data, ...feedbacks]); // add new feedback to top
      })
      .catch((err) => console.error("Error submitting feedback:", err));
  };

  const renderTab = () => {
    switch (activeTab) {
      case "products":
        return <MyProduct />;
      case "add":
        return <AddProductForm />;
      case "sales":
        return <SalesOverview />;
      default:
        return <MyProduct />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Vendor Dashboard</h1>

      {/* Tab Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border"
          }`}
        >
          📦 My Products
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 rounded ${
            activeTab === "add"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border"
          }`}
        >
          ➕ Add Product
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded ${
            activeTab === "sales"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border"
          }`}
        >
          📊 Sales Overview
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl p-6 shadow border border-gray-200 mb-10">
        {renderTab()}
      </div>

      {/* Feedback Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          ⭐ Rate and Give Feedback
        </h2>

        {/* Star Rating */}
        <div className="flex gap-2 mb-4 text-yellow-400 text-2xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={rating >= star ? "text-yellow-400" : "text-gray-300"}
            >
              ★
            </button>
          ))}
        </div>

        {/* Feedback Textarea */}
        <textarea
          className="w-full md:w-1/2 p-3 border rounded-lg resize-none mb-4 focus:outline-none focus:ring"
          placeholder="Write your feedback here..."
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        ></textarea>

        <div>
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleFeedbackSubmit}
          >
            Submit Feedback
          </button>
        </div>

        {submitted && (
          <p className="mt-3 text-green-600 font-medium">
            ✅ Thank you for your feedback!
          </p>
        )}
      </div>

      {/* Display Past Feedback */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-3">📝 Past Feedback</h3>

        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback yet.</p>
        ) : (
          <ul className="space-y-4">
            {feedbacks.map((fb) => (
              <li
                key={fb.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <div className="text-yellow-400 text-lg">
                  {"★".repeat(fb.rating)}
                  {"☆".repeat(5 - fb.rating)}
                </div>
                <p className="mt-2 text-gray-800">{fb.feedback}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted: {new Date(fb.submitted_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;


