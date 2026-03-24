import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Phone, ArrowLeft, Briefcase, Truck } from 'lucide-react';

const ContactServiceProvider = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceId = searchParams.get('id');

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) {
      toast.error('No service specified');
      navigate('/services');
      return;
    }
    apiClient.get(`/services/${serviceId}/`)
      .then((res) => setService(res.data))
      .catch(() => {
        toast.error('Failed to load service details');
        navigate('/services');
      })
      .finally(() => setLoading(false));
  }, [serviceId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
      </div>
    );
  }

  if (!service) return null;

  const phone = service.provider_phone;
  const typeLabels = {
    veterinary: 'Veterinary',
    transport: 'Transport',
    storage: 'Storage',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {service.image && (
            <div className="h-56 bg-gray-200">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ml-2">
                {typeLabels[service.service_type] || service.service_type}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{service.description}</p>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Provider Contact</h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Provider Name</p>
                  <p className="font-semibold text-gray-800">{service.provider_name}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Service Type</p>
                  <p className="font-semibold text-gray-800">{typeLabels[service.service_type] || service.service_type}</p>
                </div>
              </div>

              {phone ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-800">{phone}</p>
                    </div>
                  </div>

                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
                  >
                    <Phone className="w-5 h-5" />
                    Call Provider
                  </a>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No phone number available for this provider.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactServiceProvider;
