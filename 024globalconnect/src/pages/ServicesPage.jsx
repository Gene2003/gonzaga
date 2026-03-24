import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Search, Filter, Briefcase, X } from 'lucide-react';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const navigate = useNavigate();

  const serviceTypes = [
    { value: 'All', label: 'All Services' },
    { value: 'veterinary', label: 'Veterinary' },
    { value: 'transport', label: 'Transport' },
    { value: 'storage', label: 'Storage' },
  ];

  useEffect(() => {
    apiClient.get('/services/')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setServices(data);
      })
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || service.service_type === selectedType;
    return matchesSearch && matchesType;
  });

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Services</h1>
          <p className="text-gray-600">Find professional services from verified providers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {(searchQuery || selectedType !== 'All') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedType('All'); }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

        <div className="mb-4 text-gray-600">
          Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No services found</h3>
            <p className="text-gray-500">
              {services.length === 0 ? 'No services available yet.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
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

const typeLabels = {
  veterinary: 'Veterinary',
  transport: 'Transport',
  storage: 'Storage',
};

const ServiceCard = ({ service, onClick }) => {
  const imageUrl = service.image || 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400';

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
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400'; }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            {typeLabels[service.service_type] || service.service_type}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl text-gray-900 mb-2">{service.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
        <div className="mb-4 pb-4 border-b">
          <p className="text-sm text-gray-500">
            Provider: <span className="font-medium text-gray-700">{service.provider_name}</span>
          </p>
        </div>
        <button
          onClick={onClick}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Contact Provider
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;
