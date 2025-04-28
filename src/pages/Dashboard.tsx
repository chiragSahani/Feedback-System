import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Search, Filter, RefreshCcw, Download, 
  Calendar, Users, MessageSquare, TrendingUp, Bell,
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
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
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

  useEffect(() => {
    let result = [...feedbackItems];

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

    setFilteredItems(result);
    setCurrentPage(1);
  }, [feedbackItems, selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="min-h-screen bg-dashboard-bg text-dashboard-text">
      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dashboard-card backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-dashboard-text hover:text-white font-medium flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-dashboard-text hover:text-white"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-dashboard-accent"></span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dashboard-text-light" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dashboard-card border border-white/10 rounded-xl text-dashboard-text placeholder-dashboard-text-light focus:outline-none focus:ring-2 focus:ring-dashboard-accent"
              />
            </div>
          </div>
          
          <motion.select
            whileHover={{ scale: 1.02 }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-dashboard-card border border-white/10 rounded-xl px-4 py-2 text-dashboard-text focus:outline-none focus:ring-2 focus:ring-dashboard-accent"
          >
            <option value="all">All Categories</option>
            <option value="bug_report">Bug Reports</option>
            <option value="feature_request">Feature Requests</option>
            <option value="suggestion">Suggestions</option>
          </motion.select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportData}
            className="bg-dashboard-accent hover:bg-dashboard-accent-light text-white rounded-xl px-6 py-2 flex items-center space-x-2 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          <FeedbackAnalytics feedbackItems={feedbackItems} />
          <FeedbackList feedbackItems={paginatedItems} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8 space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-dashboard-card border border-white/10 rounded-xl disabled:opacity-50"
          >
            Previous
          </motion.button>
          
          <span className="px-4 py-2 bg-dashboard-card border border-white/10 rounded-xl">
            {currentPage} of {totalPages}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-dashboard-card border border-white/10 rounded-xl disabled:opacity-50"
          >
            Next
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
