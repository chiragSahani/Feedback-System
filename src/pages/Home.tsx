import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, BarChart2 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] via-[#d0e8f2] to-[#a1c4fd] flex flex-col items-center justify-center p-6">

      {/* GIF Above Heading */}
      <div className="mb-6 animate-bounce-slow">
        <img 
          src="https://res.cloudinary.com/dlyctssmy/image/upload/v1745730336/620f39ce8c3d0eeb9ae1241f7b78f704_dtptsb.gif"
          alt="Feedback Animation"
          className="w-72 mx-auto rounded-xl shadow-lg"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 transition-colors duration-300 hover:text-gray-800">
          User Feedback System
        </h1>
        <p className="text-lg text-black mb-10 max-w-2xl mx-auto transition-colors duration-300 hover:text-gray-700">
          Share your thoughts, report bugs, or suggest features. Your feedback helps us improve!
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <Link
            to="/feedback"
            className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-lg"
          >
            <MessageSquare className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Submit Feedback
          </Link>

          <Link
            to="/dashboard"
            className="group bg-white hover:bg-gray-100 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center text-lg"
          >
            <BarChart2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            View Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
