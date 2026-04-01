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

// ✅ Preset farm products with local images
const PRESET_PRODUCTS = [
  { name: "Watermelon",           image: "/products/watermelon.jpg",   category: "farm_products" },
  { name: "Tomatoes",             image: "/products/tomato.jpg",        category: "farm_products" },
  { name: "Ginger",               image: "/products/ginger.jpg",        category: "farm_products" },
  { name: "Terere (Amaranth)",    image: "/products/terere.jpg",        category: "farm_products" },
  { name: "Beans",                image: "/products/beans.jpg",         category: "farm_products" },
  { name: "Kunde (Cowpeas)",      image: "/products/kunde.jpg",         category: "farm_products" },
  { name: "Sweet Potatoes",       image: "/products/sweetpotato.jpg",   category: "farm_products" },
  { name: "Sukuma Wiki (Kales)",  image: "/products/sukumawiki.jpg",    category: "farm_products" },
  { name: "Managu",               image: "/products/managu.jpg",        category: "farm_products" },
  { name: "Pumpkin",              image: "/products/pumpkin.jpg",       category: "farm_products" },
  { name: "Rosemary",             image: "/products/rosemary.jpg",      category: "farm_products" },
  { name: "Garlic",               image: "/products/garlic.jpg",        category: "farm_products" },
  { name: "Strawberries",         image: "/products/strawberry.jpg",    category: "farm_products" },
  { name: "Coriander (Dania)",    image: "/products/dania.jpg",         category: "farm_products" },
  { name: "Mrenda",               image: "/products/mrenda.jpg",        category: "farm_products" },
  { name: "Carrots",              image: "/products/carrots.jpg",       category: "farm_products" },
  { name: "Irish Potatoes",       image: "/products/potato.jpg",        category: "farm_products" },
  { name: "Green Chilli",         image: "/products/green-chilli.jpg",  category: "farm_products" },
  { name: "Green Capsicum (Pilipili Hoho)", image: "/products/capsicum.jpg", category: "farm_products" },
];

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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // ✅ Select a preset product — auto-fills name, category, and image
  const selectPreset = (preset) => {
    setSelectedPreset(preset);
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      quantity_kg: "",
      stock: "",
    }));
  };

  // ✅ Check if selected category is a farm category
  const selectedCategoryObj = categories.find((c) => c.value === form.category) || null;
  const isFarmCategory = selectedCategoryObj?.isFarm || false;

  // ✅ Minimum quantity based on vendor type (only for farm categories)
  const minQuantity =
    vendorType === "farmer" ? 600 :
    vendorType === "wholesaler" ? 300 :
    100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getAutoImage = () => {
    // ✅ Use preset image if a preset was selected
    if (selectedPreset) return selectedPreset.image;
    const name = form.name.toLowerCase();
    const cat = (selectedCategoryObj?.value || '').toLowerCase();

    const keywords = {
      laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      tv: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400',
      shirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      shoe: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
      corn: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
      rice: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
      milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
      tomato: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400',
      potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
      chicken: 'https://images.unsplash.com/photo-1560717845-968823efbee1?w=400',
      beef: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
      book: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      car: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    };
    for (const [kw, url] of Object.entries(keywords)) {
      if (name.includes(kw)) return url;
    }

    const catMap = {
      farm_products: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
      food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
      health_beauty: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      home_kitchen: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
      books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400',
      sports: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400',
      automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    };
    return catMap[cat] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
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

        {/* ✅ Preset Farm Product Picker */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Quick Select a Farm Product <span className="text-gray-400 font-normal">(optional — click to auto-fill)</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
            {PRESET_PRODUCTS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition cursor-pointer text-center ${
                  selectedPreset?.name === preset.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <img
                  src={preset.image}
                  alt={preset.name}
                  className="w-14 h-14 object-cover rounded-md"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=100'; }}
                />
                <span className="text-xs font-medium text-gray-700 leading-tight">{preset.name}</span>
              </button>
            ))}
          </div>
          {selectedPreset && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-blue-600 font-medium">✅ Selected: {selectedPreset.name}</span>
              <button
                type="button"
                onClick={() => { setSelectedPreset(null); setForm((prev) => ({ ...prev, name: "", category: "" })); }}
                className="text-xs text-gray-400 hover:text-red-500 underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

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

        {/* Auto-generated image preview */}
        {(form.name || form.category) && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">
              Auto-generated product image
            </label>
            <img
              src={getAutoImage()}
              alt="Auto preview"
              className="w-full h-40 object-cover rounded-lg border border-gray-200"
            />
            <p className="text-xs text-gray-400 mt-1">
              Image is assigned automatically based on your product name and category.
            </p>
          </div>
        )}

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