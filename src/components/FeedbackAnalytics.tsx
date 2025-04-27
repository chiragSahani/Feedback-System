import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';
import { Feedback } from '../types/feedback';

interface FeedbackAnalyticsProps {
  feedbackItems: Feedback[];
}

const COLORS = {
  bug_report: '#EF4444',
  feature_request: '#8B5CF6',
  suggestion: '#3B82F6',
  default: '#6B7280'
};

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ feedbackItems }) => {
  const analytics = useMemo(() => {
    const total = feedbackItems.length;
    
    // Count by category
    const categoryCounts = feedbackItems.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Transform category data for pie chart
    const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
      name: formatCategory(name),
      value,
      color: COLORS[name as keyof typeof COLORS] || COLORS.default
    }));
    
    // Most active users (top 3)
    const userCounts = feedbackItems.reduce((acc, item) => {
      acc[item.email] = (acc[item.email] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topUsers = Object.entries(userCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([email, count]) => {
        const user = feedbackItems.find(item => item.email === email);
        return {
          email,
          name: user?.user_name || email,
          count
        };
      });
    
    // Feedback over time (last 7 days)
    const now = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const feedbackByDay = last7Days.map(date => {
      const count = feedbackItems.filter(item => 
        new Date(item.created_at).toISOString().split('T')[0] === date
      ).length;
      
      return {
        date: formatDate(date),
        count
      };
    });
    
    // Category trends
    const categoryTrends = last7Days.map(date => {
      const dayFeedback = feedbackItems.filter(item => 
        new Date(item.created_at).toISOString().split('T')[0] === date
      );
      
      const counts = {
        date: formatDate(date),
        'Bug Reports': 0,
        'Feature Requests': 0,
        'Suggestions': 0
      };
      
      dayFeedback.forEach(item => {
        switch (item.category) {
          case 'bug_report':
            counts['Bug Reports']++;
            break;
          case 'feature_request':
            counts['Feature Requests']++;
            break;
          case 'suggestion':
            counts['Suggestions']++;
            break;
        }
      });
      
      return counts;
    });

    // New analytics calculations
    const hourlyDistribution = Array(24).fill(0);
    feedbackItems.forEach(item => {
      const hour = new Date(item.created_at).getHours();
      hourlyDistribution[hour]++;
    });

    const hourlyData = hourlyDistribution.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    }));

    // Sentiment analysis (mock data - replace with actual sentiment analysis)
    const sentimentData = [
      { subject: 'Positive', A: 120, fullMark: 150 },
      { subject: 'Neutral', A: 98, fullMark: 150 },
      { subject: 'Negative', A: 86, fullMark: 150 },
      { subject: 'Urgent', A: 99, fullMark: 150 },
      { subject: 'Actionable', A: 85, fullMark: 150 },
    ];
    
    return {
      total,
      categoryData,
      topUsers,
      feedbackByDay,
      categoryTrends,
      hourlyData,
      sentimentData
    };
  }, [feedbackItems]);
  
  // Format category name for display
  function formatCategory(category: string): string {
    switch (category) {
      case 'bug_report':
        return 'Bug Reports';
      case 'feature_request':
        return 'Feature Requests';
      case 'suggestion':
        return 'Suggestions';
      default:
        return category;
    }
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Feedback</h3>
          <div className="text-3xl font-bold text-blue-600">
            <AnimatedNumber value={analytics.total} />
          </div>
        </motion.div>
        
        {/* Top Users Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
          <div className="space-y-4">
            {analytics.topUsers.map((user, index) => (
              <div key={user.email} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {index + 1}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.count} submissions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sentiment Analysis Radar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analytics.sentimentData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Radar
                  name="Feedback"
                  dataKey="A"
                  stroke="#8B5CF6"
                  fill="#C4B5FD"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Feedback Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.categoryTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Bug Reports" 
                  stroke={COLORS.bug_report} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="Feature Requests" 
                  stroke={COLORS.feature_request} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="Suggestions" 
                  stroke={COLORS.suggestion} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      
        {/* Daily Submissions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Submissions</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.feedbackByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackAnalytics;
