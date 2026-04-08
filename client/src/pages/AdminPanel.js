import React, { useState, useEffect } from 'react';
import { authAPI, leadsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Users, Trash2, Edit, UserPlus, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  useAuth(); // Required for auth context
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentLeads, setAgentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '', role: '', password: '' });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentLeads = async (agentId) => {
    try {
      const response = await leadsAPI.getByAgent(agentId);
      setAgentLeads(response.data);
    } catch (error) {
      console.error('Error fetching agent leads:', error);
      toast.error('Failed to fetch leads');
    }
  };

  const handleSelectAgent = async (agent) => {
    setSelectedAgent(agent);
    await fetchAgentLeads(agent._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? All their leads will also be deleted.')) {
      try {
        await authAPI.deleteUser(id);
        toast.success('User deleted successfully');
        fetchAgents();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (agent) => {
    setEditData({
      id: agent._id,
      username: agent.username,
      email: agent.email,
      role: agent.role,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleApprove = async (agentId, isApproved) => {
    try {
      await authAPI.approveUser(agentId, isApproved);
      toast.success(isApproved ? 'User approved successfully' : 'User rejected');
      fetchAgents();
      if (selectedAgent && selectedAgent._id === agentId) {
        setSelectedAgent({ ...selectedAgent, isApproved });
      }
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        username: editData.username,
        email: editData.email,
        role: editData.role
      };
      
      // Only include password if it's not empty
      if (editData.password && editData.password.trim() !== '') {
        updateData.password = editData.password;
      }
      
      await authAPI.updateUser(editData.id, updateData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchAgents();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'contacted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'converted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="text-purple-600" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-gray-500">Manage agents and view all leads</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="mr-2" size={20} />
                All Users
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                {agents.map((agent) => (
                  <div
                    key={agent._id}
                    onClick={() => handleSelectAgent(agent)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedAgent?._id === agent._id
                        ? 'bg-purple-100 dark:bg-purple-900 border-2 border-purple-500'
                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {agent.photo ? (
                          <img 
                            src={agent.photo} 
                            alt={agent.username} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {agent.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{agent.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.role === 'admin' ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                        }`}>
                          {agent.role}
                        </span>
                        {agent.role !== 'admin' && (
                          agent.isApproved ? (
                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                              <CheckCircle size={12} className="mr-1" /> Approved
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-orange-600 dark:text-orange-400">
                              <Clock size={12} className="mr-1" /> Pending
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(agent); }}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      {agent.role !== 'admin' && (
                        <>
                          {!agent.isApproved && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(agent._id, true); }}
                              className="p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {!agent.isApproved && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(agent._id, false); }}
                              className="p-2 text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-900 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(agent._id); }}
                            className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agent Leads */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <UserPlus className="mr-2" size={20} />
                {selectedAgent ? `${selectedAgent.username}'s Leads` : 'Select an Agent'}
              </h2>
            </div>

            {!selectedAgent ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>Click on an agent to view their leads</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {agentLeads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{lead.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{lead.email}</td>
                        <td className="px-4 py-3 text-gray-600">{lead.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {agentLeads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No leads found for this agent
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit User Profile</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editData.password || ''}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditData({ ...editData, password: '' }); }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;