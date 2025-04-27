import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Smile, Frown, Meh } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../App';
import { FeedbackCategory } from '../types/feedback';
import LoadingSpinner from '../components/LoadingSpinner';

const FeedbackForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    feedbackText: '',
    category: 'suggestion' as FeedbackCategory
  });

  const [errors, setErrors] = useState({
    userName: '',
    email: '',
    feedbackText: ''
  });

  const [mood, setMood] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [attachments, setAttachments] = useState<File[]>([]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { userName: '', email: '', feedbackText: '' };

    if (!formData.userName.trim()) {
      newErrors.userName = 'Name is required';
      valid = false;
    } else if (formData.userName.length < 2) {
      newErrors.userName = 'Name must be at least 2 characters';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (!formData.feedbackText.trim()) {
      newErrors.feedbackText = 'Feedback is required';
      valid = false;
    } else if (formData.feedbackText.length < 10) {
      newErrors.feedbackText = 'Feedback must be at least 10 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMoodSelect = (selectedMood: 'positive' | 'neutral' | 'negative') => {
    setMood(selectedMood);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting your feedback...');

    try {
      // Upload attachments if any
      const attachmentUrls = [];
      for (const file of attachments) {
        const { data, error } = await supabase.storage
          .from('feedback-attachments')
          .upload(`${Date.now()}-${file.name}`, file);

        if (error) throw error;
        attachmentUrls.push(data.path);
      }

      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_name: formData.userName,
            email: formData.email,
            feedback_text: formData.feedbackText,
            category: formData.category,
            mood,
            attachments: attachmentUrls
          }
        ]);

      if (error) throw error;

      toast.success('Thank you for your feedback!', { id: loadingToast });
      
      // Reset form
      setFormData({
        userName: '',
        email: '',
        feedbackText: '',
        category: 'suggestion'
      });
      setMood('neutral');
      setAttachments([]);

      // Redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <motion.div 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="mb-8"
        >
          <Link to="/" className="inline-flex items-center text-blue-700 hover:text-blue-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-white shadow-2xl rounded-2xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              src="https://res.cloudinary.com/dlyctssmy/image/upload/v1745731053/cust_a4rqsi.gif"
              alt="Feedback Animation"
              className="h-32 w-32 mx-auto rounded-full border-4 border-white shadow-lg"
            />
            <h2 className="text-2xl font-bold text-white mt-4">Share Your Feedback</h2>
            <p className="text-blue-100 mt-2">We value your thoughts and suggestions</p>
          </div>

          {/* Mood Selection */}
          <div className="px-6 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling?
            </label>
            <div className="flex justify-center space-x-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect('positive')}
                className={`p-3 rounded-full ${
                  mood === 'positive' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Smile className="w-8 h-8" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect('neutral')}
                className={`p-3 rounded-full ${
                  mood === 'neutral' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Meh className="w-8 h-8" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect('negative')}
                className={`p-3 rounded-full ${
                  mood === 'negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Frown className="w-8 h-8" />
              </motion.button>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.userName ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="John Doe"
                disabled={isSubmitting}
              />
              {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition"
                disabled={isSubmitting}
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug_report">Bug Report</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>

            {/* Feedback */}
            <div>
              <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700 mb-1">
                Your Feedback
              </label>
              <textarea
                id="feedbackText"
                name="feedbackText"
                value={formData.feedbackText}
                onChange={handleChange}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition ${
                  errors.feedbackText ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                }`}
                placeholder="Please share your thoughts, suggestions, or report a bug..."
                disabled={isSubmitting}
              ></textarea>
              {errors.feedbackText && <p className="mt-1 text-sm text-red-600">{errors.feedbackText}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg shadow transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <LoadingSpinner size={24} color="#ffffff" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FeedbackForm;
