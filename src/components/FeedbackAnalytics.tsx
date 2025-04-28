import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { Feedback } from '../types/feedback';
import { format } from 'date-fns';

interface FeedbackAnalyticsProps {
  feedbackItems: Feedback[];
}

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ feedbackItems }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Category distribution
    const categoryData = feedbackItems.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Transform for pie chart
    const pieData = Object.entries(categoryData).map(([id, value]) => ({
      id: formatCategory(id),
      label: formatCategory(id),
      value,
    }));

    // Daily trends
    const lineData = [{
      id: 'Feedback Submissions',
      data: last7Days.map(date => ({
        x: format(new Date(date), 'MMM dd'),
        y: feedbackItems.filter(item => 
          new Date(item.created_at).toISOString().split('T')[0] === date
        ).length
      }))
    }];

    // Category trends
    const barData = last7Days.map(date => {
      const dayFeedback = feedbackItems.filter(item => 
        new Date(item.created_at).toISOString().split('T')[0] === date
      );

      return {
        date: format(new Date(date), 'MMM dd'),
        'Bug Reports': dayFeedback.filter(f => f.category === 'bug_report').length,
        'Feature Requests': dayFeedback.filter(f => f.category === 'feature_request').length,
        'Suggestions': dayFeedback.filter(f => f.category === 'suggestion').length,
      };
    });

    return {
      pieData,
      lineData,
      barData,
      total: feedbackItems.length,
      recent: feedbackItems.filter(item => 
        new Date(item.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };
  }, [feedbackItems]);

  function formatCategory(category: string): string {
    const formatted = category.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted;
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="bg-dashboard-card backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg font-semibold text-dashboard-text mb-2">Total Feedback</h3>
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
            {analytics.total}
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-dashboard-card backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-lg font-semibold text-dashboard-text mb-2">Recent (24h)</h3>
          <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
            {analytics.recent}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-dashboard-card backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-lg font-semibold text-dashboard-text mb-4">Feedback Trends</h3>
          <div className="h-[300px]">
            <ResponsiveLine
              data={analytics.lineData}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              curve="cardinal"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                format: (value) => value,
                tickTextColor: '#94A3B8'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                tickTextColor: '#94A3B8'
              }}
              enablePoints={true}
              pointSize={8}
              pointColor="#4F46E5"
              pointBorderWidth={2}
              pointBorderColor="#818CF8"
              enableArea={true}
              areaOpacity={0.15}
              colors={['#4F46E5']}
              theme={{
                background: 'transparent',
                textColor: '#E2E8F0',
                grid: {
                  line: {
                    stroke: '#1F2937',
                    strokeWidth: 1
                  }
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-dashboard-card backdrop-blur-xl rounded-3xl p-6 border border-white/10"
          whileHover={{ scale: 1.01 }}
        >
          <h3 className="text-lg font-semibold text-dashboard-text mb-4">Category Distribution</h3>
          <div className="h-[300px]">
            <ResponsivePie
              data={analytics.pieData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.6}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={['#4F46E5', '#818CF8', '#C7D2FE']}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              enableArcLinkLabels={true}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#E2E8F0"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              theme={{
                background: 'transparent',
                textColor: '#E2E8F0'
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-dashboard-card backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        whileHover={{ scale: 1.01 }}
      >
        <h3 className="text-lg font-semibold text-dashboard-text mb-4">Category Trends</h3>
        <div className="h-[300px]">
          <ResponsiveBar
            data={analytics.barData}
            keys={['Bug Reports', 'Feature Requests', 'Suggestions']}
            indexBy="date"
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            padding={0.3}
            groupMode="grouped"
            colors={['#EF4444', '#8B5CF6', '#3B82F6']}
            borderRadius={6}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              tickTextColor: '#94A3B8'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              tickTextColor: '#94A3B8'
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1.6]]
            }}
            theme={{
              background: 'transparent',
              textColor: '#E2E8F0',
              grid: {
                line: {
                  stroke: '#1F2937',
                  strokeWidth: 1
                }
              }
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackAnalytics;
