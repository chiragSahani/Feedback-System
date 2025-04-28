import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Mail, Calendar, ChevronDown, ChevronUp, Tag, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feedback } from '../types/feedback';

interface FeedbackItemProps {
  feedback: Feedback;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formattedDate = formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true });
  const exactDate = new Date(feedback.created_at).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug_report':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      case 'feature_request':
        return 'bg-purple-900/30 text-purple-400 border-purple-500/30';
      case 'suggestion':
      default:
        return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
    }
  };
  
  const formatCategory = (category: string) => {
    switch (category) {
      case 'bug_report':
        return 'Bug Report';
      case 'feature_request':
        return 'Feature Request';
      case 'suggestion':
        return 'Suggestion';
      default:
        return category;
    }
  };

  return (
    <motion.div 
      className={`
        bg-dashboard-card backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden
        transition-all duration-300 ease-in-out
        ${expanded ? 'shadow-lg shadow-dashboard-accent/10' : 'hover:shadow-md hover:shadow-dashboard-accent/5'}
      `}
      whileHover={{ scale: 1.01 }}
    >
      <div className="p-6">
        <div className="sm:flex sm:justify-between sm:items-start">
          <div className="flex-grow">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-lg font-medium text-dashboard-text">{feedback.user_name}</h3>
              <span 
                className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                  ${getCategoryColor(feedback.category)}
                `}
              >
                <Tag className="w-3 h-3 mr-1" />
                {formatCategory(feedback.category)}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-dashboard-text-light space-y-1">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-1.5" />
                <span>{feedback.email}</span>
              </div>
              <div 
                className="flex items-center" 
                title={exactDate}
              >
                <Calendar className="h-4 w-4 mr-1.5" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className={`
                inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-200 ease-in-out border
                ${expanded
                  ? 'bg-dashboard-accent/20 text-dashboard-accent border-dashboard-accent/30'
                  : 'bg-white/5 text-dashboard-text border-white/10 hover:bg-white/10'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1.5" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1.5" />
                  View Details
                </>
              )}
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence>
          {expanded ? (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 text-dashboard-text-light mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-dashboard-text whitespace-pre-line">{feedback.feedback_text}</p>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-dashboard-text mb-2">Additional Information</h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-dashboard-text-light">Submission ID</dt>
                        <dd className="text-dashboard-text font-mono mt-1">{feedback.id.slice(0, 8)}</dd>
                      </div>
                      <div>
                        <dt className="text-dashboard-text-light">Exact Time</dt>
                        <dd className="text-dashboard-text mt-1">{exactDate}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ height: 'auto' }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 text-dashboard-text-light mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-dashboard-text line-clamp-2">{feedback.feedback_text}</p>
              </div>
              {feedback.feedback_text.length > 150 && (
                <motion.button
                  onClick={() => setExpanded(true)}
                  className="mt-2 text-sm text-dashboard-accent hover:text-dashboard-accent-light inline-flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Read more
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FeedbackItem;
