// src/components/service-provider/AddServiceForm.jsx
import React, { useState } from "react";
import apiClient from "../../api/client";
import toast from "react-hot-toast";
import { Briefcase, DollarSign, MapPin, Phone, Mail, Image } from "lucide-react";

const serviceTypes = [
  { value: "veterinary", label: "Veterinary Services", icon: "🏥" },
  { value: "transport", label: "Transport Services", icon: "🚚" },
  { value: "storage", label: "Storage Services", icon: "📦" },
  { value: "other", label: "Other Services", icon: "⚙️" },
];

const AddServiceForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    service_type: "",
    price: "",
    price_unit: "per service",
    location: "",
    contact_phone: "",
    contact_email: "",
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
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await apiClient.post("/services/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("✅ Service added successfully!");
      
      // Reset form
      setForm({
        title: "",
        description: "",
        service_type: "",
        price: "",
        price_unit: "per service",
        location: "",
        contact_phone: "",
        contact_email: "",
        image: null,
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error("Error adding service:", err?.response?.data || err.message);
      toast.error(err?.response?.data?.detail || "Failed to add service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Service</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Service Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Briefcase className="inline w-4 h-4 mr-1" />
            Service Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Veterinary Consultation"
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
            placeholder="Describe your service in detail..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select
            name="service_type"
            value={form.service_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select service type</option>
            {serviceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Price (KES)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="1000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Unit</label>
            <select
              name="price_unit"
              value={form.price_unit}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="per service">Per Service</option>
              <option value="per hour">Per Hour</option>
              <option value="per day">Per Day</option>
              <option value="per km">Per KM</option>
              <option value="per month">Per Month</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline w-4 h-4 mr-1" />
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Nairobi, Kenya"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline w-4 h-4 mr-1" />
              Contact Phone
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={form.contact_phone}
              onChange={handleChange}
              placeholder="+254..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline w-4 h-4 mr-1" />
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={form.contact_email}
              onChange={handleChange}
              placeholder="service@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Image className="inline w-4 h-4 mr-1" />
            Service Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Adding Service..." : "Add Service"}
        </button>
      </form>
    </div>
  );
};

export default AddServiceForm;