import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  User, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  ArrowUp,
  Building,
  Rocket,
  Users,
  Lightbulb,
  AlertCircle,
  Loader2
} from 'lucide-react';
import logo from '../../assets/024global_logo_200x200.png';
import { submitContactForm } from '../../api/contactAPI';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error and success status
    if (errors.general || submitStatus) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
      setSubmitStatus('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (optional but must be valid if provided)
    if (formData.phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Subject validation
    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus('');

    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload ={
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      };
      // TODO: Replace with actual API call
      // const response = await contactAPI.submitForm({
      //   name: formData.name.trim(),
      //   email: formData.email.trim(),
      //   phone: formData.phone.trim(),
      //   subject: formData.subject,
      //   message: formData.message.trim()
      // });
      await submitContactForm(payload);
      
      setSubmitStatus('success');
      
      // Reset form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
    } catch (err) {
      setErrors({ general: handleApiError(err) });
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-md">
                <img 
                  src={logo} 
                  alt="024 Global Connect Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                024 Global Connect
              </div>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <a href="tel:+254711917376" className="text-gray-600 hover:text-blue-600 transition-colors">
                  +254 711 917 376
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <a href="mailto:info@024globalconnect.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                  024globalconnect@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 h-fit">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center space-x-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <span>Connect With Us</span>
              </h2>
              
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Our Office</h4>
                  <p className="text-gray-600">Nairobi, Kenya</p>
                  <p className="text-gray-600">024GlobalConnect</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Call Us</h4>
                  <a href="tel:+254711917376" className="text-blue-600 hover:text-purple-500 transition-colors">
                    +254 711 917 376
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Email Us</h4>
                  <a href="mailto:info@024globalconnect.com" className="text-blue-600 hover:text-purple-500 transition-colors break-all">
                    024globalconnect@gmail.com
                  </a>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Business Hours</h4>
                  <p className="text-gray-600">Mon - Fri: 8AM - 6PM</p>
                  <p className="text-gray-600">Sat: 9AM - 4PM</p>
                  <p className="text-gray-600">24/7 Online Support</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Global Reach</h4>
                  <p className="text-gray-600">Connecting businesses</p>
                  <p className="text-gray-600">worldwide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Get In Touch
                </h1>
                <p className="text-gray-600">
                  Ready to expand your business globally? We're here to help you connect, 
                  grow, and succeed in the international marketplace.
                </p>
              </div>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">Thank you! Your message has been sent successfully. We'll connect with you soon.</p>
                  </div>
                </div>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm">{errors.general}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your phone number"
                      disabled={isSubmitting}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      <option value="">Select a subject</option>
                      <option value="business-inquiry">Business Inquiry</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="global-expansion">Global Expansion</option>
                      <option value="consulting">Consulting Services</option>
                      <option value="technology-solutions">Technology Solutions</option>
                      <option value="support">Support</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="text-red-600 text-xs mt-1">{errors.subject}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message *</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                    placeholder="Tell us about your business goals, challenges, or how we can help you connect globally..."
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-red-600 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <a
        href="https://wa.me/254711917376"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 left-5 bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-50"
        aria-label="Contact us on WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
      </a>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 right-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-50"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* Additional Features Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose 024 Global Connect?</h2>
            <p className="text-lg opacity-90">Your trusted partner for global business expansion</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
              <p className="opacity-90">Connect with markets and opportunities worldwide</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Partnerships</h3>
              <p className="opacity-90">Build lasting relationships with verified partners</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="opacity-90">Cutting-edge solutions for modern business challenges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;