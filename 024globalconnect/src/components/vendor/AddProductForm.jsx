// src/components/vendor/AddProductForm.jsx

import React, { useState } from "react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";
import { Listbox } from "@headlessui/react";
import {
  Tv, Shirt, HeartPulse, Home, BookOpen, UtensilsCrossed,
  Gamepad2, Dumbbell, Car, Tags, Check, ChevronDown, Wheat
} from "lucide-react";
import { API_ENDPOINTS } from "../../api/endpoints";

const categories = [
  { label: "Farm Products", value: "farm_products", icon: Wheat, isFarm: true },
  { label: "Food & Grocery", value: "food", icon: UtensilsCrossed, isFarm: true },
  { label: "Electronics", value: "electronics", icon: Tv, isFarm: false },
  { label: "Fashion", value: "fashion", icon: Shirt, isFarm: false },
  { label: "Health & Beauty", value: "health_beauty", icon: HeartPulse, isFarm: false },
  { label: "Home & Kitchen", value: "home_kitchen", icon: Home, isFarm: false },
  { label: "Books", value: "books", icon: BookOpen, isFarm: false },
  { label: "Toys & Games", value: "toys", icon: Gamepad2, isFarm: false },
  { label: "Sports & Outdoors", value: "sports", icon: Dumbbell, isFarm: false },
  { label: "Automotive", value: "automotive", icon: Car, isFarm: false },
  { label: "Others", value: "others", icon: Tags, isFarm: false },
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
    stock: "",
    category: "",
    product_type: "good",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Check if selected category is a farm category
  const selectedCategoryObj = categories.find((c) => c.value === form.category) || null;
  const isFarmCategory = selectedCategoryObj?.isFarm || false;

  // ✅ Minimum quantity based on vendor type (only for farm categories)
  const minQuantity =
    vendorType === "farmer" ? 600 :
    vendorType === "wholesaler" ? 300 :
    100;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Frontend validation
    if (isFarmCategory) {
      const qty = Number(form.quantity_kg);
      if (qty < minQuantity) {
        toast.error(`Minimum quantity for farm products is ${minQuantity} kg`);
        return;
      }
    } else {
      const stock = Number(form.stock);
      if (stock < 1) {
        toast.error("Stock must be at least 1");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("product_type", form.product_type);

      if (isFarmCategory) {
        formData.append("quantity_kg", Number(form.quantity_kg));
        formData.append("stock", 0); // not used for farm
      } else {
        formData.append("stock", Number(form.stock));
        formData.append("quantity_kg", 0); // not used for non-farm
      }

      if (form.farmer_price) formData.append("farmer_price", Number(form.farmer_price));
      if (form.wholesaler_price) formData.append("wholesaler_price", Number(form.wholesaler_price));
      if (form.retailer_price) formData.append("retailer_price", Number(form.retailer_price));

      if (form.image) formData.append("image", form.image);

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
        stock: "",
        category: "",
        product_type: "good",
        image: null,
      });
    } catch (err) {
      console.error("Full error:", err?.response?.data);
      const errorMsg = err?.response?.data?.detail || 
                       err?.response?.data?.non_field_errors?.[0] ||
                       "Failed to add product";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          placeholder="Product description"
          rows={4}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {/* Category — must be selected FIRST so quantity field updates */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <Listbox
            value={selectedCategoryObj}
            onChange={(cat) =>
              setForm((prev) => ({ ...prev, category: cat.value, quantity_kg: "", stock: "" }))
            }
          >
            <Listbox.Button className="w-full border rounded-lg px-3 py-2 flex justify-between items-center">
              <span className="flex items-center gap-2">
                {selectedCategoryObj ? (
                  <>
                    <selectedCategoryObj.icon size={16} />
                    {selectedCategoryObj.label}
                    {selectedCategoryObj.isFarm && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">
                        Farm
                      </span>
                    )}
                  </>
                ) : (
                  "Select category"
                )}
              </span>
              <ChevronDown size={16} />
            </Listbox.Button>

            <Listbox.Options className="bg-white shadow rounded mt-1 z-10 relative">
              {categories.map((cat) => (
                <Listbox.Option
                  key={cat.value}
                  value={cat}
                  className="cursor-pointer px-3 py-2 hover:bg-blue-50 flex gap-2 items-center"
                >
                  <cat.icon size={18} />
                  {cat.label}
                  {cat.isFarm && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Farm
                    </span>
                  )}
                  {form.category === cat.value && <Check size={16} className="ml-auto" />}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-1">Price (KES)</label>
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
        </div>

        {/* ✅ Quantity OR Stock — depends on category */}
        {form.category ? (
          isFarmCategory ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity (kg)
                <span className="text-red-500 ml-1">
                  — minimum {minQuantity} kg required
                </span>
              </label>
              <input
                type="number"
                name="quantity_kg"
                value={form.quantity_kg}
                onChange={handleChange}
                placeholder={`Min ${minQuantity} kg`}
                min={minQuantity}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
              {form.quantity_kg && Number(form.quantity_kg) < minQuantity && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ Minimum is {minQuantity} kg for this category
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock (units)
                <span className="text-gray-500 ml-1">— minimum 1 unit</span>
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Number of units in stock"
                min={1}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          )
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-yellow-700 text-sm">
            ⚠️ Please select a category first to see quantity requirements
          </div>
        )}

        {/* Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Product Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !form.category}
          className={`w-full py-2 rounded-lg text-white font-semibold transition ${
            isSubmitting || !form.category
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;