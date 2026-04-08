/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Eye, Edit, Trash2, X, Users, UserPlus, Download, Upload, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', source: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const photoInputRef = useRef(null);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
    requirements: '',
    source: 'website',
    status: 'new'
  });
  const { user } = useAuth();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Photo must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLead({ ...newLead, photo: reader.result });
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLeadPhoto = () => {
    setNewLead({ ...newLead, photo: '' });
    setPhotoPreview('');
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.source) params.source = filters.source;
      if (filters.search) params.search = filters.search;
      
      const response = await leadsAPI.getAll(params);
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await leadsAPI.update(id, { status: newStatus });
      toast.success('Status updated successfully');
      fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        await leadsAPI.delete(id);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await leadsAPI.create(newLead);
      toast.success('Lead added successfully');
      setShowAddModal(false);
      setNewLead({ name: '', email: '', phone: '', photo: '', requirements: '', source: 'website', status: 'new' });
      fetchLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_admin': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'converted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceLabel = (source) => {
    const labels = {
      website: 'Website',
      referral: 'Referral',
      social_media: 'Social Media',
      email_campaign: 'Email Campaign',
      other: 'Other'
    };
    return labels[source] || source;
  };

  const sourceOptions = ['website', 'referral', 'social_media', 'email_campaign', 'other'];
  const statusOptions = ['new', 'pending_admin', 'pending', 'contacted', 'converted', 'rejected'];

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Photo', 'Requirements', 'Source', 'Status', 'Assigned To', 'Created Date'];
    const csvData = leads.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.photo || '',
      lead.requirements || '',
      getSourceLabel(lead.source),
      lead.status,
      lead.assignedTo || 'Unassigned',
      new Date(lead.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all your client inquiries</p>
          </div>
          {user?.role === 'admin' && (
          <button
            onClick={exportToCSV}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
          >
            <Download size={20} />
            <span className="font-semibold">Export CSV</span>
          </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02]"
          >
            <UserPlus size={20} />
            <span className="font-semibold">Add New Lead</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-gray-50 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 border-2 border-gray-100 rounded-xl hover:bg-gray-50 flex items-center space-x-2 transition-colors"
            >
              <Filter size={20} />
              <span>Filters</span>
              {(filters.status || filters.source) && (
                <span className="ml-1 w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status} className="capitalize">{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="">All Sources</option>
                  {sourceOptions.map(source => (
                    <option key={source} value={source}>{getSourceLabel(source)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Leads Grid */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
              <p className="text-gray-500 mt-3">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Users size={56} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No leads found</p>
              {(filters.search || filters.status || filters.source) && (
                <button
                  onClick={() => setFilters({ status: '', source: '', search: '' })}
                  className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link to={`/leads/${lead._id}`} className="flex items-center space-x-3">
                          {lead.photo ? (
                            <img 
                              src={lead.photo} 
                              alt={lead.name} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{lead.name}</p>
                            {lead.phone && <p className="text-sm text-gray-500">{lead.phone}</p>}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{lead.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">{lead.phone || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {lead.assignedTo || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {getSourceLabel(lead.source)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize cursor-pointer ${getStatusColor(lead.status)}`}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <Link
                            to={`/leads/${lead._id}`}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </Link>
                          <Link
                            to={`/leads/${lead._id}/edit`}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Edit"
                          >
                            <Edit size={20} />
                          </Link>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(lead._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Lead</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Photo (optional)</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {photoPreview || newLead.photo ? (
                      <div className="relative">
                        <img 
                          src={photoPreview || newLead.photo} 
                          alt="Preview" 
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" 
                        />
                        <button
                          type="button"
                          onClick={removeLeadPhoto}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => photoInputRef.current?.click()}
                        className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
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
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Upload size={16} />
                      <span>Choose Photo</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Max 2MB, JPG/PNG</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
                  >
                    {sourceOptions.map(source => (
                      <option key={source} value={source}>{getSourceLabel(source)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements / Notes</label>
                <textarea
                  value={newLead.requirements}
                  onChange={(e) => setNewLead({ ...newLead, requirements: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500 transition-all resize-none"
                  rows="3"
                  placeholder="Describe what the customer is looking for..."
                ></textarea>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-[1.02]"
                >
                  Add Lead
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Leads;
