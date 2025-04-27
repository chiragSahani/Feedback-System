import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, RefreshCcw, BarChart, Download, 
  Calendar, Users, MessageSquare, TrendingUp, Bell, FileText,
  ChevronDown, AlertTriangle, CheckCircle
} from 'lucide-react';
import { supabase } from '../App';
import FeedbackList from '../components/FeedbackList';
import FeedbackAnalytics from '../components/FeedbackAnalytics';
import { Feedback } from '../types/feedback';
import { format } from 'date-fns';

interface Notification {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [filteredItems, setFilteredItems] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      message: 'New feedback trend detected',
      type: 'info',
      timestamp: new Date()
    },
    {
      id: 2,
      message: 'Monthly report is ready',
      type: 'success',
      timestamp: new Date()
    }
  ]);

  const itemsPerPage = 5;

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('feedback_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'feedback' 
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [{
            id: Date.now(),
            message: 'New feedback received',
            type: 'info',
            timestamp: new Date()
          }, ...prev]);
          fetchFeedback();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFeedbackItems(data || []);
      setFilteredItems(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Apply Filters, Search, and Sort
  useEffect(() => {
    let result = [...feedbackItems];

    // Date range filter
    result = result.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.user_name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.feedback_text.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredItems(result);
    setCurrentPage(1);
  }, [feedbackItems, selectedCategory, searchTerm, sortOrder, dateRange]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Quick Stats
  const stats = {
    total: feedbackItems.length,
    recent: feedbackItems.filter(item => 
      new Date(item.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    categories: feedbackItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Name', 'Email', 'Category', 'Feedback'],
      ...filteredItems.map(item => [
        format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
        item.user_name,
        item.email,
        item.category,
        item.feedback_text
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 top-16">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {notifications.map(notification => (
                        <div key={notification.id} className="flex items-start space-x-3">
                          {notification.type === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
                          {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          <div>
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {format(notification.timestamp, 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.recent}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(feedbackItems.map(item => item.email)).size}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(stats.categories).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Toggle & Export */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowAnalytics(prev => !prev)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all"
          >
            <BarChart className="w-5 h-5" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <div className="mb-8">
            <FeedbackAnalytics feedbackItems={feedbackItems} />
          </div>
        )}

        {/* Filters & Search Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="suggestion">Suggestions</option>
                <option value="bug_report">Bug Reports</option>
                <option value="feature_request">Feature Requests</option>
              </select>
              <ChevronDown className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Date Range */}
            <div className="relative">
              <Calendar className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              />
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all"
            >
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <FeedbackList feedbackItems={paginatedItems} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;