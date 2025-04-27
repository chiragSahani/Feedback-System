import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Mail, Calendar, ChevronDown, ChevronUp, Tag, ExternalLink } from 'lucide-react';
import { Feedback } from '../types/feedback';

interface FeedbackItemProps {
  feedback: Feedback;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Format the timestamp
  const formattedDate = formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true });
  const exactDate = new Date(feedback.created_at).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Get the category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug_report':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'feature_request':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'suggestion':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  // Format category name for display
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
    <div 
      className={`
        border rounded-xl transition-all duration-300 ease-in-out
        ${expanded ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'}
      `}
    >
      <div className="p-6">
        <div className="sm:flex sm:justify-between sm:items-start">
          <div className="flex-grow">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-lg font-medium text-gray-900">{feedback.user_name}</h3>
              <span 
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                  ${getCategoryColor(feedback.category)}
                `}
              >
                <Tag className="w-3 h-3 mr-1" />
                {formatCategory(feedback.category)}
              </span>
            </div>
            
            <div className="mt-2 text-sm text-gray-500 space-y-1">
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
            <button
              onClick={() => setExpanded(!expanded)}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all duration-200 ease-in-out
                ${expanded
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
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
            </button>
          </div>
        </div>
        
        <div 
          className={`
            mt-4 transition-all duration-300 ease-in-out overflow-hidden
            ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-[3em] opacity-90 line-clamp-2'}
          `}
        >
          <div className="flex items-start">
            <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-gray-800 whitespace-pre-line">{feedback.feedback_text}</p>
              
              {expanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Submission ID</dt>
                      <dd className="text-gray-900 font-mono mt-1">{feedback.id.slice(0, 8)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Exact Time</dt>
                      <dd className="text-gray-900 mt-1">{exactDate}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {!expanded && feedback.feedback_text.length > 150 && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Read more
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedbackItem;