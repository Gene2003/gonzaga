// src/components/vendor/AddProductForm.jsx

import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Listbox } from "@headlessui/react";
import {
  Tv,
  Shirt,
  HeartPulse,
  Home,
  BookOpen,
  UtensilsCrossed,
  Gamepad2,
  Dumbbell,
  Car,
  Tags,
  Check,
  ChevronDown,
} from "lucide-react";
import { authService } from "../../api/services/authService";
import { API_ENDPOINTS } from "../../api/endpoints";

// Category options with icon and description
const categories = [
  { name: "Electronics", description: "Phones, TVs, laptops", icon: Tv },
  { name: "Fashion", description: "Clothing & accessories", icon: Shirt },
  { name: "Health & Beauty", description: "Wellness products", icon: HeartPulse },
  { name: "Home & Kitchen", description: "Appliances & decor", icon: Home },
  { name: "Books", description: "Printed and eBooks", icon: BookOpen },
  { name: "Food & Grocery", description: "Everyday items", icon: UtensilsCrossed },
  { name: "Toys & Games", description: "For kids and adults", icon: Gamepad2 },
  { name: "Sports & Outdoors", description: "Fitness & gear", icon: Dumbbell },
  { name: "Automotive", description: "Car tools & parts", icon: Car },
  { name: "Others", description: "Miscellaneous", icon: Tags },
];

const AddProductForm = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // In your AddProductForm.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const token = await authService.getAuthToken(); // ✅ Now async
    if (!token) {
      toast.error("You must be logged in to add a product.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));

    const response = await axios.post(API_ENDPOINTS.VENDOR_PRODUCTS, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("✅ Product added successfully");
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      image: null,
    });
  } catch (err) {
    console.error("Error adding product:", err?.response?.data || err.message || err);
    toast.error(err?.response?.data?.detail || "Failed to add product");
  } finally {
    setIsSubmitting(false);
  }
};


  const selectedCategory = categories.find((c) => c.name === form.category) || null;

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <Listbox value={selectedCategory} onChange={(cat) => setForm((prev) => ({ ...prev, category: cat.name }))}>
            <div className="relative">
              <Listbox.Button className="w-full border border-gray-300 rounded-lg px-3 py-2 flex justify-between items-center focus:ring-2 focus:ring-blue-500">
                <span>{form.category || "Select category"}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Listbox.Button>

              <Listbox.Options className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {categories.map((cat) => (
                  <Listbox.Option
                    key={cat.name}
                    value={cat}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 flex items-start gap-3 ${
                        active ? "bg-blue-50" : ""
                      }`
                    }
                  >
                    <cat.icon className="w-5 h-5 mt-1 text-blue-600" />
                    <div>
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-sm text-gray-500">{cat.description}</div>
                    </div>
                    {form.category === cat.name && (
                      <Check className="w-4 h-4 ml-auto text-green-600 mt-1" />
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
