// src/pages/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  X
} from 'lucide-react';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const serviceTypes = [
    { value: 'All', label: 'All Services', icon: '🔍' },
    { value: 'veterinary', label: 'Veterinary', icon: '🏥' },
    { value: 'transport', label: 'Transport', icon: '🚚' },
    { value: 'storage', label: 'Storage', icon: '📦' },
    { value: 'other', label: 'Other', icon: '⚙️' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/services/');
      console.log('Services fetched:', response.data);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch = 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.location && service.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'All' || service.service_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Browse Services
          </h1>
          <p className="text-gray-600">
            Find professional services from verified providers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline w-4 h-4 mr-2" />
              Service Type
            </label>
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
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedType !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No services found
            </h3>
            <p className="text-gray-500">
              {services.length === 0 
                ? 'No services available yet. Check back soon!'
                : 'Try adjusting your filters or search query'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service }) => {
  const imageUrl = service.image || 'https://via.placeholder.com/400x300?text=Service';
  
  const getServiceTypeLabel = (type) => {
    const types = {
      'veterinary': '🏥 Veterinary',
      'transport': '🚚 Transport',
      'storage': '📦 Storage',
      'other': '⚙️ Other'
    };
    return types[type] || type;
  };

  const handleContact = () => {
    if (service.contact_phone) {
      window.location.href = `tel:${service.contact_phone}`;
    } else if (service.contact_email) {
      window.location.href = `mailto:${service.contact_email}`;
    } else {
      toast.info('No contact information available');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Service Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={imageUrl}
          alt={service.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=Service';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            {getServiceTypeLabel(service.service_type)}
          </span>
        </div>
      </div>

      {/* Service Info */}
      <div className="p-5">
        <h3 className="font-bold text-xl text-gray-900 mb-2">
          {service.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>

        {/* Provider Info */}
        <div className="mb-3 pb-3 border-b">
          <p className="text-sm text-gray-500">
            Provider: <span className="font-medium text-gray-700">{service.provider_name}</span>
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-green-600">
            KES {service.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            {service.price_unit}
          </span>
        </div>

        {/* Location */}
        {service.location && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{service.location}</span>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {service.contact_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{service.contact_phone}</span>
            </div>
          )}
          {service.contact_email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{service.contact_email}</span>
            </div>
          )}
        </div>

        {/* Contact Button */}
        <button
          onClick={handleContact}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          Contact Provider
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;