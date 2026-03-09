// src/components/vendor/AddProductForm.jsx

import React, { useState } from "react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";
import { Listbox } from "@headlessui/react";
import {
  Tv, Shirt, HeartPulse, Home, BookOpen, UtensilsCrossed,
  Gamepad2, Dumbbell, Car, Tags, Check, ChevronDown
} from "lucide-react";
import { API_ENDPOINTS } from "../../api/endpoints";

/* 🔑 Backend-safe category values */
const categories = [
  { label: "Electronics", value: "electronics", icon: Tv },
  { label: "Fashion", value: "fashion", icon: Shirt },
  { label: "Health & Beauty", value: "health_beauty", icon: HeartPulse },
  { label: "Home & Kitchen", value: "home_kitchen", icon: Home },
  { label: "Books", value: "books", icon: BookOpen },
  { label: "Food & Grocery", value: "food", icon: UtensilsCrossed },
  { label: "Toys & Games", value: "toys", icon: Gamepad2 },
  { label: "Sports & Outdoors", value: "sports", icon: Dumbbell },
  { label: "Automotive", value: "automotive", icon: Car },
  { label: "Others", value: "others", icon: Tags },
];

const AddProductForm = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const vendorType = user?.vendor_type || '';

  const [form, setForm] = useState({
    name: "",
    description: "",
    farmer_price: "",
    wholesaler_price: "",
    retailer_price: "",
    quantity_kg: "",
    category: "",
    product_type: "good", // ✅ DEFAULT
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("quantity_kg", Number(form.quantity_kg));
      formData.append("category", form.category);
      formData.append("product_type", form.product_type);

      if (form.farmer_price) formData.append("farmer_price", Number(form.farmer_price));
      if (form.wholesaler_price) formData.append("wholesaler_price", Number(form.wholesaler_price));
      if (form.retailer_price) formData.append("retailer_price", Number(form.retailer_price));

      if (form.image) {
        formData.append("image", form.image);
      }

      await apiClient.post(API_ENDPOINTS.ADD_PRODUCT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Product added successfully");

      setForm({
        name: "",
        description: "",
        farmer_price: "",
        wholesaler_price: "",
        retailer_price: "",
        quantity_kg: "",
        category: "",
        product_type: "good",
        image: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory =
    categories.find((c) => c.value === form.category) || null;

    const quantityPlaceholder = 
    vendorType === "farmer" ? "Quantity (kg) - min 600" :
    vendorType === "wholesaler" ? "Quantity (kg) - min 300" :
    vendorType === "retailer" ? "Quantity (kg) - min 100" :
    "Quantity in KG";

  return (
    <div className="max-w-xl mx-auto bg-white shadow-lg p-6 rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Type</label>
          <select
            name="product_type"
            value={form.product_type}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="good">Goods</option>
            <option value="service">Service</option>
          </select>
        </div>

        {/* Name */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product name"
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          {vendorType === "farmer" && (
            <input
              type="number"
              name="farmer_price"
              value={form.farmer_price}
              onChange={handleChange}
              placeholder="Farmer Price (KES)"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          )}
          {vendorType === "wholesaler" && (
            <input
              type="number"
              name="wholesaler_price"
              value={form.wholesaler_price}
              onChange={handleChange}
              placeholder="Wholesaler Price (KES)"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          )}
          {vendorType === "retailer" && (
            <input
              type="number"
              name="retailer_price"
              value={form.retailer_price}
              onChange={handleChange}
              placeholder="Retailer Price (KES)"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          )}
          <input
            type="number"
            name="quantity_kg"
            value={form.quantity_kg}
            onChange={handleChange}
            placeholder={
              vendorType === "farmer" ? "Quantity (kg) - min 600":
              vendorType === "wholesaler" ? "Quantity (kg) - min 300":
              "Quantity in KG (MIN 100)"
            }
            required
          />
        </div>

        {/* Category */}
        <Listbox
          value={selectedCategory}
          onChange={(cat) =>
            setForm((prev) => ({ ...prev, category: cat.value }))
          }
        >
          <Listbox.Button className="w-full border rounded-lg px-3 py-2 flex justify-between">
            {selectedCategory?.label || "Select category"}
            <ChevronDown size={16} />
          </Listbox.Button>

          <Listbox.Options className="bg-white shadow rounded mt-1">
            {categories.map((cat) => (
              <Listbox.Option
                key={cat.value}
                value={cat}
                className="cursor-pointer px-3 py-2 hover:bg-blue-50 flex gap-2"
              >
                <cat.icon size={18} />
                {cat.label}
                {form.category === cat.value && <Check size={16} />}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>

        {/* Image */}
        <input type="file" name="image" accept="image/*" onChange={handleChange} />

        <button
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          {isSubmitting ? "Submitting..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;

