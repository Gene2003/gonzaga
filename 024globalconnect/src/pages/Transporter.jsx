import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Search, Truck, X, MapPin } from 'lucide-react';

const Transporter = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorCity, setVendorCity] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      // Fetch transporters near the vendor
      apiClient.get(`/services/transport-near-vendor/?order_id=${orderId}`)
        .then((res) => {
          setServices(res.data.results || []);
          setVendorCity(res.data.vendor_city || '');
        })
        .catch(() => toast.error('Failed to load transport services'))
        .finally(() => setLoading(false));
    } else {
      // No order — fetch all transport services
      apiClient.get('/services/?service_type=transport')
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : res.data.results || [];
          setServices(data.filter((s) => s.service_type === 'transport'));
        })
        .catch(() => toast.error('Failed to load transport services'))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  const filtered = services.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Transport Services</h1>
          {vendorCity ? (
            <div className="flex items-center gap-2 text-blue-700 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Showing transporters near <strong>{vendorCity}</strong> (vendor location)</span>
            </div>
          ) : (
            <p className="text-gray-600">Find verified transporters for your goods</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transporters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear search
            </button>
          )}
        </div>

        <div className="mb-4 text-gray-600">
          Showing {filtered.length} transporter{filtered.length !== 1 ? 's' : ''}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No transporters found</h3>
            <p className="text-gray-500">
              {services.length === 0 ? 'No transport services available in this area yet.' : 'Try adjusting your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((service) => (
              <TransporterCard
                key={service.id}
                service={service}
                onClick={() => navigate(`/contact-service-provider?id=${service.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TransporterCard = ({ service, onClick }) => {
  const imageUrl = service.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={imageUrl}
          alt={service.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400'; }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            Transport
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl text-gray-900 mb-2">{service.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
        {(service.county || service.provider_city) && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{service.county || service.provider_city}</span>
          </div>
        )}
        <div className="mb-4 pb-4 border-b">
          <p className="text-sm text-gray-500">
            Provider: <span className="font-medium text-gray-700">{service.provider_name}</span>
          </p>
        </div>
        <button
          onClick={onClick}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Contact Transporter
        </button>
      </div>
    </div>
  );
};

export default Transporter;
