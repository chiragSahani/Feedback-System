import React from 'react';
import FeedbackItem from './FeedbackItem';
import { Feedback } from '../types/feedback';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface FeedbackListProps {
  feedbackItems: Feedback[];
  isLoading: boolean;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ feedbackItems, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (feedbackItems.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No feedback found</h3>
        <p className="text-gray-500 max-w-md">
          There are no feedback entries matching your current filters. Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {feedbackItems.map((item) => (
        <div
          key={item.id}
          className="transform transition-all duration-300 hover:translate-y-[-2px]"
        >
          <FeedbackItem feedback={item} />
        </div>
      ))}
    </div>
  );
};

export default FeedbackList;