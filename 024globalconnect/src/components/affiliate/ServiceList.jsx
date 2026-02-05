// src/components/affiliate/ServiceList.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import apiClient from "../../api/client";
import { Clipboard, Check } from "lucide-react";
import toast from "react-hot-toast";

const ServiceList = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/services/');
        console.log("✅ Services response:", res.data);
        
        const fetchedServices = Array.isArray(res.data) 
          ? res.data 
          : res.data.results || [];
        
        setServices(fetchedServices);
      } catch (error) {
        console.error("❌ Service fetch error:", error);
        toast.error("Failed to load services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleCopy = (serviceId) => {
    const link = `${window.location.origin}/services/${serviceId}?ref=${user?.username}`;
    navigator.clipboard.writeText(link);
    setCopied(serviceId);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-6">Services You Can Promote</h2>

      {services.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No services available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const isUnavailable = !service.availability;
            return (
              <div
                key={service.id}
                className={`relative bg-white p-4 rounded-2xl shadow-md border hover:shadow-lg transition ${
                  isUnavailable ? "opacity-60" : ""
                }`}
              >
                <img
                  src={
                    service.image ||
                    "https://via.placeholder.com/300x150.png?text=No+Image"
                  }
                  alt={service.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />

                <h3 className="text-lg font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {service.description}
                </p>

                {service.provider_name && (
                  <p className="text-xs text-gray-400 mb-2">
                    Offered by <span className="font-medium">{service.provider_name}</span>
                  </p>
                )}

                {service.duration && (
                  <p className="text-xs text-gray-500 mb-2">
                    Duration: {service.duration}
                  </p>
                )}

                <p className={`text-sm mb-2 ${isUnavailable ? "text-red-600" : "text-green-600"}`}>
                  {isUnavailable ? "Not Available" : "Available"}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-bold text-base">
                    KES {service.price}
                  </span>
                  {!isUnavailable && (
                    <button
                      onClick={() => handleCopy(service.id)}
                      className="flex items-center text-sm text-blue-600 hover:underline"
                    >
                      {copied === service.id ? (
                        <>
                          <Check size={16} className="mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} className="mr-1" /> Copy Link
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isUnavailable && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceList;