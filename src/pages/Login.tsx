import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Logging in...');

    try {
      // Sign in with username as email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.username, // Use username directly as email
        password: credentials.password,
      });

      if (error) throw error;

      // Verify admin access
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('username')
        .eq('username', credentials.username)
        .single();

      if (adminError || !adminData) {
        // If not an admin, sign out and throw error
        await supabase.auth.signOut();
        throw new Error('Not authorized as admin');
      }

      toast.success('Welcome back, Admin!', { id: loadingToast });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid credentials', { id: loadingToast });
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with GIF */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <img
              src="https://res.cloudinary.com/dlyctssmy/image/upload/v1745734487/Data_analysis_jc3jbh.gif"
              alt="Admin Login"
              className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg"
            />
            <h2 className="mt-4 text-2xl font-bold text-white">Admin Login</h2>
            <p className="mt-2 text-blue-100">
              Access the feedback dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Demo Credentials Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium">Demo Credentials:</p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2 disabled:bg-blue-400"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;