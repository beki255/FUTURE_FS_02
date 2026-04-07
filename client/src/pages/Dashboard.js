import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Users, PhoneCall, TrendingUp, Plus, UserPlus, CheckCircle, Clock, ArrowRight, BarChart3, PieChart, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    converted: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allLeadsResponse = await leadsAPI.getAll();
      const allLeads = allLeadsResponse.data;
      
      setStats({
        total: allLeads.length,
        new: allLeads.filter(lead => lead.status === 'new').length,
        contacted: allLeads.filter(lead => lead.status === 'contacted').length,
        converted: allLeads.filter(lead => lead.status === 'converted').length
      });
      
      setLeads(allLeads);
      setRecentLeads(allLeads.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const conversionRate = stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0;

  const monthlyData = useMemo(() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      months[monthKey] = { total: 0, converted: 0 };
    }
    
    leads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      if (months[monthKey]) {
        months[monthKey].total += 1;
        if (lead.status === 'converted') {
          months[monthKey].converted += 1;
        }
      }
    });
    
    return Object.entries(months).map(([name, data]) => ({
      name,
      total: data.total,
      converted: data.converted
    }));
  }, [leads]);

  const sourceData = useMemo(() => {
    const sources = {};
    leads.forEach(lead => {
      const source = lead.source || 'other';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    const colors = {
      website: '#3B82F6',
      referral: '#8B5CF6',
      social_media: '#EC4899',
      email_campaign: '#F59E0B',
      other: '#6B7280'
    };
    
    return Object.entries(sources).map(([name, value]) => ({
      name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      color: colors[name] || '#6B7280'
    }));
  }, [leads]);

  const maxMonthlyValue = Math.max(...monthlyData.map(d => d.total), 1);
  const totalSource = sourceData.reduce((sum, d) => sum + d.value, 0);

  const workflowSteps = [
    { 
      id: 1, 
      title: 'New Lead', 
      description: 'Visitor submits inquiry',
      icon: UserPlus,
      color: 'from-blue-500 to-cyan-500',
      status: 'new'
    },
    { 
      id: 2, 
      title: 'Review', 
      description: 'Agent reviews lead',
      icon: Clock,
      color: 'from-yellow-500 to-amber-500',
      status: 'new'
    },
    { 
      id: 3, 
      title: 'Contact', 
      description: 'Reach out to lead',
      icon: PhoneCall,
      color: 'from-violet-500 to-fuchsia-500',
      status: 'contacted'
    },
    { 
      id: 4, 
      title: 'Convert', 
      description: 'Close the deal',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-500',
      status: 'converted'
    }
  ];

  const statCards = [
    { 
      title: 'Total Leads', 
      value: stats.total, 
      icon: Users, 
      color: 'from-cyan-500 to-blue-500',
      description: 'All inquiries received'
    },
    { 
      title: 'New Leads', 
      value: stats.new, 
      icon: UserPlus, 
      color: 'from-amber-500 to-orange-500',
      description: 'Awaiting first contact'
    },
    { 
      title: 'In Progress', 
      value: stats.contacted, 
      icon: PhoneCall, 
      color: 'from-violet-500 to-fuchsia-500',
      description: 'Actively following up'
    },
    { 
      title: 'Converted', 
      value: stats.converted, 
      icon: TrendingUp, 
      color: 'from-emerald-500 to-teal-500',
      description: 'Successfully converted'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'new': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'contacted': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      case 'converted': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="relative">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lead Management Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.username}! Here's your lead overview.</p>
            <div className="absolute -left-4 top-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <Link
            to="/leads/new"
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-xl"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold">Add New Lead</span>
          </Link>
        </div>

        {/* Workflow Progress Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lead Conversion Pipeline</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your leads through each stage</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const counts = [stats.new, stats.new, stats.contacted, stats.converted];
              const count = counts[index];
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`bg-gradient-to-br ${step.color} p-5 rounded-3xl shadow-lg mb-4 group hover:scale-110 transition-transform duration-300`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{step.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 max-w-[100px]">{step.description}</p>
                    <div className="mt-3 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                    </div>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-700 dark:to-gray-700 rounded-full relative">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const gradients = [
              'from-cyan-500 to-blue-500',
              'from-amber-500 to-orange-500', 
              'from-violet-500 to-fuchsia-500',
              'from-emerald-500 to-teal-500'
            ];
            const shadows = [
              'shadow-cyan-500/20',
              'shadow-amber-500/20',
              'shadow-violet-500/20',
              'shadow-emerald-500/20'
            ];
            return (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all hover:-translate-y-2 group relative overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradients[index]} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                    <p className="text-5xl font-bold text-gray-900 dark:text-white mt-3 tracking-tight">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradients[index]}`}></div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 ml-2">{stat.description}</p>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${gradients[index]} p-4 rounded-2xl shadow-lg ${shadows[index]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={32} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Bar Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BarChart3 className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leads by Month</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 months overview</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(data.total / maxMonthlyValue) * 140}px`, minHeight: '4px' }}
                    ></div>
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg opacity-70"
                      style={{ height: `${(data.converted / maxMonthlyValue) * 140}px`, minHeight: '0px' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">{data.name}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Total Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Converted</span>
              </div>
            </div>
          </div>

          {/* Source Pie Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <PieChart className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lead Sources</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Distribution by source</p>
                </div>
              </div>
            </div>
            
            {totalSource === 0 ? (
              <div className="flex flex-col items-center justify-center h-48">
                <PieChart size={48} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No leads data yet</p>
              </div>
            ) : (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSource}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    </div>
                  </div>
                  <svg className="absolute w-48 h-48 -rotate-90" viewBox="0 0 100 100">
                    {sourceData.map((data, index) => {
                      const percent = data.value / totalSource;
                      const prevPercent = sourceData.slice(0, index).reduce((sum, d) => sum + (d.value / totalSource), 0);
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={data.color}
                          strokeWidth="20"
                          strokeDasharray={`${percent * 100} ${100 - percent * 100}`}
                          strokeDashoffset={-prevPercent * 100}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {sourceData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{data.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{data.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Conversion Rate & Recent Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversion Rate */}
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            <div className="relative">
              <h3 className="text-lg font-semibold mb-6">Conversion Performance</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-7xl font-bold tracking-tight">{conversionRate}%</p>
                  <p className="text-purple-200 mt-2 font-medium">Conversion Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stats.converted}</p>
                  <p className="text-purple-200 text-sm">of {stats.total} leads</p>
                </div>
              </div>
              <div className="mt-8 bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-white h-4 rounded-full transition-all duration-1000 shadow-lg" 
                  style={{ width: `${conversionRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Leads</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest inquiries from potential customers</p>
              </div>
              <Link to="/leads" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </Link>
            </div>
            
            {recentLeads.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No leads yet. Start by adding your first lead!</p>
                <Link to="/leads/new" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Add Lead →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentLeads.map((lead, index) => {
                  const gradients = [
                    'from-blue-500 to-cyan-500',
                    'from-purple-500 to-pink-500',
                    'from-emerald-500 to-teal-500',
                    'from-amber-500 to-orange-500',
                    'from-violet-500 to-fuchsia-500'
                  ];
                  return (
                    <Link 
                      key={lead._id} 
                      to={`/leads/${lead._id}`}
                      className="flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        {lead.photo ? (
                          <img 
                            src={lead.photo} 
                            alt={lead.name} 
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-200 shadow-lg"
                          />
                        ) : (
                          <div className={`w-12 h-12 bg-gradient-to-br ${gradients[index % 5]} rounded-2xl flex items-center justify-center text-white font-bold shadow-lg`}>
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)} capitalize`}>
                          {lead.status}
                        </span>
                        <ArrowRight className="text-gray-400" size={20} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;