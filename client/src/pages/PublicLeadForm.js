import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicLeadAPI } from '../services/api';
import { User, Mail, Phone, MessageSquare, Globe, Send, CheckCircle, ArrowRight, Star, Shield, Clock, Headphones, Users, TrendingUp, Image, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLeadForm = () => {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    requirements: '',
    source: 'website'
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const photoInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: '' });
    setPhotoPreview('');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicLeadAPI.submit(formData);
      setSubmitted(true);
      toast.success('Thank you! We have received your inquiry.');
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      requirements: '',
      source: 'website'
    });
    navigate('/');
  };

  const sourceOptions = [
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'referral', label: 'Referral', icon: User },
    { value: 'social_media', label: 'Social Media', icon: Globe },
    { value: 'email_campaign', label: 'Email Campaign', icon: Mail },
    { value: 'other', label: 'Other', icon: Globe }
  ];

  if (submitted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/50 to-pink-900/60"></div>
        <div className="relative max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.5s_ease-out_0.2s_both]">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 animate-[fadeInDown_0.5s_ease-out_0.3s_both]">Thank You!</h2>
          <p className="text-white/80 mb-6 animate-[fadeInUp_0.5s_ease-out_0.4s_both]">
            We have received your inquiry. Our team will contact you shortly.
          </p>
          <div className="space-y-3 animate-[fadeInUp_0.5s_ease-out_0.5s_both]">
            <p className="text-white/60 text-sm">What happens next?</p>
            <div className="text-left bg-white/10 rounded-xl p-4 space-y-2 text-white/80 text-sm">
              <p className="animate-[slideInRight_0.3s_ease-out_0.6s_both]">📞 Our team will call you within 24 hours</p>
              <p className="animate-[slideInRight_0.3s_ease-out_0.7s_both]">💬 We'll help you set up your CRM account</p>
              <p className="animate-[slideInRight_0.3s_ease-out_0.8s_both]">✅ We'll guide you through the lead management process</p>
            </div>
          </div>
          <button 
            onClick={handleBackToHome}
            className="mt-6 inline-block text-white/70 hover:text-white animate-[fadeIn_0.5s_ease-out_0.9s_both]"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 via-purple-900/50 to-pink-900/60"></div>
      
      {/* Left Side - Company Info */}
      <div className="relative w-1/2 hidden lg:flex flex-col p-6 justify-between h-screen animate-[fadeInLeft_0.6s_ease-out]">
        <div className="overflow-y-auto animate-[fadeInDown_0.5s_ease-out]">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-4 group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">Mini CRM</span>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            {['about', 'services', 'whyUs', 'contact'].map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tab === 'about' && 'About'}
                {tab === 'services' && 'Features'}
                {tab === 'whyUs' && 'Why Us'}
                {tab === 'contact' && 'Contact'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'about' && (
              <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
                <h2 className="text-4xl font-bold text-white leading-tight animate-[slideInLeft_0.5s_ease-out]">
                  About <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Mini CRM</span>
                </h2>
                <p className="text-white/80 text-lg leading-relaxed animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
                  We provide a powerful Lead Management System to help businesses capture, track, and convert potential customers into loyal clients.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 animate-[slideInUp_0.4s_ease-out_0.2s_both]">
                    <Users className="text-white mb-2 animate-[bounce_2s_infinite]" size={28} />
                    <h3 className="text-white font-bold text-xl">10K+ Leads</h3>
                    <p className="text-white/60 text-sm">Successfully Managed</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 hover:bg-white/20 hover:scale-105 transition-all duration-300 animate-[slideInUp_0.4s_ease-out_0.3s_both]">
                    <TrendingUp className="text-white mb-2 animate-[bounce_2s_infinite_0.5s]" size={28} />
                    <h3 className="text-white font-bold text-xl">85% Convert</h3>
                    <p className="text-white/60 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
                <h2 className="text-4xl font-bold text-white leading-tight animate-[slideInLeft_0.5s_ease-out]">
                  CRM <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Features</span>
                </h2>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-2xl p-5 hover:bg-white/20 hover:translate-x-2 transition-all duration-300 animate-[slideInRight_0.4s_ease-out]">
                    <h3 className="text-white font-bold text-lg mb-2">Lead Capture</h3>
                    <p className="text-white/70">Collect leads from website forms automatically</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 hover:bg-white/20 hover:translate-x-2 transition-all duration-300 animate-[slideInRight_0.4s_ease-out_0.1s_both]">
                    <h3 className="text-white font-bold text-lg mb-2">Lead Tracking</h3>
                    <p className="text-white/70">Track lead status through the sales pipeline</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 hover:bg-white/20 hover:translate-x-2 transition-all duration-300 animate-[slideInRight_0.4s_ease-out_0.2s_both]">
                    <h3 className="text-white font-bold text-lg mb-2">Contact Management</h3>
                    <p className="text-white/70">Manage client information and communication notes</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 hover:bg-white/20 hover:translate-x-2 transition-all duration-300 animate-[slideInRight_0.4s_ease-out_0.3s_both]">
                    <h3 className="text-white font-bold text-lg mb-2">Analytics Dashboard</h3>
                    <p className="text-white/70">View conversion stats and team performance</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'whyUs' && (
              <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
                <h2 className="text-4xl font-bold text-white leading-tight animate-[slideInLeft_0.5s_ease-out]">
                  Why <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Choose Us</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 animate-[slideInUp_0.4s_ease-out]">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300">
                      <Star className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Easy Lead Management</h3>
                      <p className="text-white/70">Simple and intuitive interface for managing leads</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 animate-[slideInUp_0.4s_ease-out_0.1s_both]">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300">
                      <Shield className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Secure Data Storage</h3>
                      <p className="text-white/70">Enterprise-grade security to protect your data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 animate-[slideInUp_0.4s_ease-out_0.2s_both]">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Quick Lead Assignment</h3>
                      <p className="text-white/70">Automatically assign leads to sales agents</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 animate-[slideInUp_0.4s_ease-out_0.3s_both]">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform duration-300">
                      <Headphones className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">Role-based Access</h3>
                      <p className="text-white/70">Admin and agent roles with proper permissions</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
                <h2 className="text-4xl font-bold text-white leading-tight animate-[slideInLeft_0.5s_ease-out]">
                  Get In <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Touch</span>
                </h2>
                <p className="text-white/80 text-lg animate-[fadeInUp_0.4s_ease-out_0.1s_both]">
                  Have questions about our CRM system? Fill out the form and we'll help you get started.
                </p>
                <div className="space-y-3 animate-[fadeInUp_0.4s_ease-out_0.2s_both]">
                  <div className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300">
                    <CheckCircle className="text-white animate-[pulse_2s_infinite]" size={20} />
                    <span className="text-white/90">Quick response within 24 hours</span>
                  </div>
                  <div className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300">
                    <CheckCircle className="text-white animate-[pulse_2s_infinite_0.5s]" size={20} />
                    <span className="text-white/90">Professional consultation</span>
                  </div>
                  <div className="flex items-center space-x-3 hover:translate-x-2 transition-transform duration-300">
                    <CheckCircle className="text-white animate-[pulse_2s_infinite_1s]" size={20} />
                    <span className="text-white/90">No obligation, free to ask</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 mt-4 hover:scale-105 transition-transform duration-300 animate-[fadeInUp_0.4s_ease-out_0.3s_both]">
                  <h3 className="text-white font-bold mb-2">Contact Info</h3>
                  <p className="text-white/70">📧 info@minicrm.com</p>
                  <p className="text-white/70">📞 +1 234 567 8900</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-white/50 text-sm animate-[fadeIn_0.5s_ease-out_0.5s_both]">
          © 2026 Mini CRM. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-4 h-screen overflow-hidden">
        <div className="w-full max-w-xl h-full flex flex-col justify-center">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-6 group cursor-pointer animate-[fadeInDown_0.5s_ease-out]">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors duration-300">Mini CRM</span>
          </div>

          {/* Mobile Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="lg:hidden w-full mb-4 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold flex items-center justify-between hover:bg-white/20 transition-all hover:scale-[1.02] animate-[fadeInUp_0.5s_ease-out]"
          >
            <span className="flex items-center space-x-2">
              <Users size={20} />
              <span>Learn more about us</span>
            </span>
            <ArrowRight className={`transform transition-transform duration-300 ${showInfo ? 'rotate-90' : ''}`} size={20} />
          </button>

          {/* Mobile Info Panel */}
          {showInfo && (
            <div className="lg:hidden mb-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden animate-[slideDown_0.3s_ease-out]">
              <div className="flex border-b border-white/10">
                {['about', 'services', 'whyUs', 'contact'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-2 py-3 text-xs font-medium transition-all ${
                      activeTab === tab ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {tab === 'about' && 'About'}
                    {tab === 'services' && 'Features'}
                    {tab === 'whyUs' && 'Why Us'}
                    {tab === 'contact' && 'Contact'}
                  </button>
                ))}
              </div>
              <div className="p-4 max-h-48 overflow-y-auto">
                {activeTab === 'about' && (
                  <div className="space-y-2 animate-[fadeInUp_0.3s_ease-out]">
                    <h3 className="text-white font-bold">About Mini CRM</h3>
                    <p className="text-white/70 text-sm">We provide a powerful Lead Management System to help businesses capture, track, and convert leads.</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white/10 rounded-lg p-2 text-center hover:scale-105 transition-transform">
                        <Users className="text-white mx-auto mb-1" size={16} />
                        <p className="text-white text-xs font-bold">10K+ Leads</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-2 text-center hover:scale-105 transition-transform">
                        <TrendingUp className="text-white mx-auto mb-1" size={16} />
                        <p className="text-white text-xs font-bold">85% Convert</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'services' && (
                  <div className="space-y-2 animate-[fadeInUp_0.3s_ease-out]">
                    <h3 className="text-white font-bold">CRM Features</h3>
                    <p className="text-white/60 text-xs">• Lead Capture • Lead Tracking • Contact Management • Analytics Dashboard</p>
                  </div>
                )}
                {activeTab === 'whyUs' && (
                  <div className="space-y-2 animate-[fadeInUp_0.3s_ease-out]">
                    <h3 className="text-white font-bold">Why Choose Us</h3>
                    <p className="text-white/60 text-xs">• Easy Lead Management • Secure Data • Quick Assignment • Role-based Access</p>
                  </div>
                )}
                {activeTab === 'contact' && (
                  <div className="space-y-2 animate-[fadeInUp_0.3s_ease-out]">
                    <h3 className="text-white font-bold">Get In Touch</h3>
                    <p className="text-white/70 text-sm">info@minicrm.com</p>
                    <p className="text-white/70 text-sm">+1 234 567 8900</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-4 sm:p-5 w-full max-w-xl animate-[fadeInRight_0.6s_ease-out_0.2s_both]">
            <div className="text-center mb-3 animate-[fadeInDown_0.5s_ease-out_0.3s_both]">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Contact Us</h2>
              <p className="text-white/70 text-sm mt-1">Fill out the form below and we'll get back to you</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="space-y-1 animate-[slideInUp_0.4s_ease-out_0.4s_both]">
                <label className="text-xs font-semibold text-white/90">Full Name *</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                    <User className="h-4 w-4 text-white/50" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all hover:bg-white/15"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 animate-[slideInUp_0.4s_ease-out_0.5s_both]">
                <label className="text-xs font-semibold text-white/90">Email Address *</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-4 w-4 text-white/50" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all hover:bg-white/15"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 animate-[slideInUp_0.4s_ease-out_0.55s_both]">
                <label className="text-xs font-semibold text-white/90">Photo (optional)</label>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {photoPreview || formData.photo ? (
                      <div className="relative">
                        <img 
                          src={photoPreview || formData.photo} 
                          alt="Preview" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-white/30" 
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => photoInputRef.current?.click()}
                        className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                      >
                        <Image className="h-5 w-5 text-white/50" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs hover:bg-white/20 transition-colors"
                  >
                    <Upload size={14} />
                    <span>Choose</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1 animate-[slideInUp_0.4s_ease-out_0.6s_both]">
                <label className="text-xs font-semibold text-white/90">Phone Number</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-4 w-4 text-white/50" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all hover:bg-white/15"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="space-y-1 animate-[slideInUp_0.4s_ease-out_0.7s_both]">
                <label className="text-xs font-semibold text-white/90">How did you find us?</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-4 w-4 text-white/50" />
                  </div>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-full text-white text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all appearance-none cursor-pointer hover:bg-white/15"
                  >
                    {sourceOptions.map(option => (
                      <option key={option.value} value={option.value} className="text-gray-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 animate-[slideInUp_0.4s_ease-out_0.8s_both]">
                <label className="text-xs font-semibold text-white/90">Your Requirements *</label>
                <div className="relative group">
                  <div className="absolute left-3 top-3 pointer-events-none group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-4 w-4 text-white/50" />
                  </div>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 text-sm focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all resize-none hover:bg-white/15"
                    rows="2"
                    placeholder="Tell us about what you're looking for..."
                    required
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm animate-[fadeInUp_0.5s_ease-out_0.9s_both]"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                ) : (
                  <>
                    <span>Submit Inquiry</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-3 pt-2 border-t border-white/20 text-center animate-[fadeIn_0.5s_ease-out_1s_both]">
              <p className="text-white/60 text-xs">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-bold hover:underline transition-colors">
                  Agent Login
                </Link>
              </p>
            </div>

          {/* Mobile Footer */}
          <div className="lg:hidden text-center mt-2 animate-[fadeIn_0.5s_ease-out]">
            <p className="text-white/50 text-xs">© 2026 Mini CRM</p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicLeadForm;