import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { ArrowLeft, Send, Calendar, User, Mail, Globe, Clock, Edit2, Save, X, CheckCircle, XCircle, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [agents, setAgents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  useEffect(() => {
    fetchLead();
    if (user?.role === 'admin') {
      fetchAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAgents = async () => {
    try {
      const response = await authAPI.getUsers();
      setAgents(response.data.filter(u => u.role === 'agent'));
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchLead = async () => {
    try {
      const response = await leadsAPI.getById(id);
      setLead(response.data);
      setEditForm({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || '',
        source: response.data.source,
        status: response.data.status
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast.error('Failed to fetch lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async () => {
    try {
      await leadsAPI.update(id, editForm);
      toast.success('Lead updated successfully');
      fetchLead();
      setEditing(false);
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await leadsAPI.addNote(id, noteContent);
      toast.success('Note added successfully');
      setNoteContent('');
      fetchLead();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await leadsAPI.update(id, { status: newStatus });
      toast.success(`Lead marked as ${newStatus}`);
      fetchLead();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleRespondToLead = async (action) => {
    try {
      await leadsAPI.respondToLead(id, action);
      toast.success(action === 'accept' ? 'Lead accepted!' : 'Lead rejected');
      fetchLead();
    } catch (error) {
      console.error('Error responding to lead:', error);
      toast.error('Failed to respond to lead');
    }
  };

  const handleAssignToAgent = async (agentId, username) => {
    try {
      await leadsAPI.assignToAgent(id, agentId, username);
      toast.success('Lead assigned successfully');
      setShowAssignModal(false);
      fetchLead();
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error('Failed to assign lead');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'pending_admin': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!lead) return null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/leads')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Leads</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Lead Information</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateLead}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                    >
                      <Save size={18} />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          name: lead.name,
                          email: lead.email,
                          source: lead.source,
                          status: lead.status
                        });
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                      <select
                        value={editForm.source}
                        onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="social_media">Social Media</option>
                        <option value="email_campaign">Email Campaign</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="text-lg font-medium text-gray-900">{lead.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-lg font-medium text-gray-900">{lead.email}</p>
                      </div>
                    </div>
                    {lead.phone && (
                      <div className="flex items-start space-x-3">
                        <Phone className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-lg font-medium text-gray-900">{lead.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <Globe className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Source</p>
                        <p className="text-lg font-medium text-gray-900 capitalize">{lead.source.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <User className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Assigned To</p>
                        <p className="text-lg font-medium text-gray-900">{lead.assignedTo || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(lead.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-lg font-medium text-gray-900">
                          {new Date(lead.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6 border-b bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Notes & Follow-ups</h3>
                <p className="text-sm text-gray-600 mt-1">Track all interactions with this lead</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddNote} className="mb-6">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                    >
                      <Send size={18} />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {lead.notes && lead.notes.length > 0 ? (
                    lead.notes.map((note, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 transition-colors">
                        <p className="text-gray-800">{note.content}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>By: {note.createdBy}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No notes yet. Add your first note above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            {/* Admin Assign Button - Show for pending_admin leads */}
            {user?.role === 'admin' && lead.status === 'pending_admin' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Assign to Agent
                  </button>
                </div>
              </div>
            )}

            {/* Agent Accept/Reject Buttons */}
            {lead.status === 'pending' && user?.role === 'agent' && user?._id === lead.user && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Lead</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleRespondToLead('accept')}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={18} />
                    <span>Accept Lead</span>
                  </button>
                  <button
                    onClick={() => handleRespondToLead('reject')}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle size={18} />
                    <span>Reject Lead</span>
                  </button>
                </div>
              </div>
            )}

            {/* Admin - Show assign button for other statuses too */}
            {user?.role === 'admin' && lead.status !== 'pending_admin' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Reassign to Agent
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusChange('contacted')}
                  disabled={lead.status === 'contacted' || lead.status === 'pending' || lead.status === 'pending_admin'}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Contacted
                </button>
                <button
                  onClick={() => handleStatusChange('converted')}
                  disabled={lead.status === 'converted'}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as Converted
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Lead Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Notes:</span>
                  <span className="font-semibold">{lead.notes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Since Created:</span>
                  <span className="font-semibold">
                    {Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Lead to Agent</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {agents.map((agent) => (
                  <button
                    key={agent._id}
                    onClick={() => handleAssignToAgent(agent._id, agent.username)}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    <p className="font-semibold text-gray-800">{agent.username}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-4 w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeadDetail;