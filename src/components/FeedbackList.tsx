import React from 'react';
import FeedbackItem from './FeedbackItem';
import { Feedback } from '../types/feedback';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeedbackListProps {
  feedbackItems: Feedback[];
  isLoading: boolean;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedbackItems, isLoading }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <motion.div 
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {[...Array(3)].map((_, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-dashboard-card backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-white/5 rounded w-1/4 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
                <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse"></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-white/5 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 flex flex-col items-center justify-center text-center"
      >
        <div className="bg-dashboard-card backdrop-blur-xl border border-white/10 rounded-full p-8 mb-6">
          <AlertCircle className="h-12 w-12 text-dashboard-text-light" />
        </div>
        <h3 className="text-2xl font-medium text-dashboard-text mb-3">No feedback found</h3>
        <p className="text-dashboard-text-light max-w-md">
          There are no feedback entries matching your current filters. Try adjusting your search criteria or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="py-4 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {feedbackItems.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="transform transition-all duration-300 hover:translate-y-[-2px]"
        >
          <FeedbackItem feedback={item} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FeedbackList;
