import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const ServiceProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    service_type: 'veterinary',
    duration: '',
    image: null,
  });

  // ✅ Fetch services from backend on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/services/');
      console.log('✅ Fetched services:', response.data);
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  // Sales data for charts
  const salesData = [
    { month: 'Jan', sales: 0 },
    { month: 'Feb', sales: 0 },
    { month: 'Mar', sales: 0 },
    { month: 'Apr', sales: 0 },
    { month: 'May', sales: 0 },
    { month: 'Jun', sales: 0 },
  ];

  const recentSales = [];
  const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.amount, 0);
  const completedSales = recentSales.filter(sale => sale.status === 'Completed').length;

  // ✅ Save service to backend
  const handleAddService = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', newService.title);
      formData.append('description', newService.description);
      formData.append('price', parseFloat(newService.price));
      formData.append('service_type', newService.service_type);
      
      if (newService.image) {
        formData.append('image', newService.image);
      }

      // ✅ POST to backend
      const response = await apiClient.post('/services/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Service created:', response.data);
      toast.success('Service added successfully!');

      // Reset form
      setNewService({
        title: '',
        description: '',
        price: '',
        service_type: 'veterinary',
        duration: '',
        image: null,
      });
      
      setShowAddServiceModal(false);
      
      // Refresh services list
      fetchServices();
    } catch (error) {
      console.error('❌ Error creating service:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete service from backend
  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await apiClient.delete(`/services/${id}/`);
      toast.success('Service deleted successfully!');
      fetchServices(); // Refresh list
    } catch (error) {
      console.error('❌ Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  // ✅ Toggle service availability
  const toggleAvailability = async (id, currentStatus) => {
    try {
      await apiClient.patch(`/services/${id}/`, {
        is_active: !currentStatus,
      });
      toast.success('Service status updated!');
      fetchServices(); // Refresh list
    } catch (error) {
      console.error('❌ Error updating service:', error);
      toast.error('Failed to update service');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Provider Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your services and track your performance</p>
            </div>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Add New Service
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Services</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{services.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{completedSales}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">KES {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0.0 ⭐</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sales Overview
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'services'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Services
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'sales'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Sales
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Sales Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Sales Overview</h2>
                
                {recentSales.length > 0 ? (
                  <>
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
                      <div className="flex items-end justify-between h-64 gap-4">
                        {salesData.map((data, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                              style={{ height: `${(data.sales / 10000) * 100}%` }}
                            ></div>
                            <p className="text-sm font-semibold mt-2">KES {(data.sales / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-gray-500">{data.month}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                        <p className="text-blue-600 text-sm font-semibold">This Month</p>
                        <p className="text-3xl font-bold text-blue-900 mt-2">KES 0</p>
                        <p className="text-sm text-blue-600 mt-1">No sales yet</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                        <p className="text-green-600 text-sm font-semibold">Total Earnings</p>
                        <p className="text-3xl font-bold text-green-900 mt-2">KES 0</p>
                        <p className="text-sm text-green-600 mt-1">Start providing services</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                        <p className="text-purple-600 text-sm font-semibold">Avg. Sale</p>
                        <p className="text-3xl font-bold text-purple-900 mt-2">KES 0</p>
                        <p className="text-sm text-purple-600 mt-1">No transactions yet</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-gray-500 text-lg font-medium mb-2">No sales data yet</p>
                    <p className="text-gray-400 text-sm mb-6">Start by adding your services and wait for clients to book them</p>
                    <button
                      onClick={() => setActiveTab('services')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                      Go to My Services
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* My Services Tab */}
            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">My Services</h2>
                  <button
                    onClick={() => setShowAddServiceModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add Service
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading services...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">🛠️</div>
                    <p className="text-gray-500 text-lg">No services yet. Add your first service!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {services.map((service) => (
                          <tr key={service.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{service.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{service.service_type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">KES {service.price}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  service.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {service.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => toggleAvailability(service.id, service.is_active)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Toggle
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Recent Sales Tab */}
            {activeTab === 'sales' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Recent Sales</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg font-medium">No sales yet</p>
                  <p className="text-gray-400 text-sm mt-2">Sales will appear here once clients book your services</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Service</h2>
                <button
                  onClick={() => setShowAddServiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddService}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Veterinary Consultation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                      placeholder="Describe your service..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (KES) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1000.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Type *
                      </label>
                      <select
                        required
                        value={newService.service_type}
                        onChange={(e) => setNewService({ ...newService, service_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="veterinary">Veterinary</option>
                        <option value="transport">Transport</option>
                        <option value="storage">Storage</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewService({ ...newService, image: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400"
                  >
                    {loading ? 'Adding...' : 'Add Service'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderDashboard;