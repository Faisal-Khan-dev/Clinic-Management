import { Link } from "react-router-dom";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-float" />
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-400/30 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400/30 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-400/30 rounded-full animate-float"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) translateX(50px);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>

      <div className="text-center relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 shadow-2xl border-2 border-gray-200/80 max-w-md mx-auto relative overflow-hidden animate-fade-in-up">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-tl-full" />

          {/* Animated 404 Icon */}
          <div className="relative mb-8 animate-fade-in-up delay-100">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg relative overflow-hidden group animate-bounce-slow">
              {/* Rotating background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-rotate-slow" />

              {/* 404 Text with gradient */}
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent relative z-10 animate-scale-pulse">
                404
              </div>

              {/* Alert icon in corner */}
              <div className="absolute top-2 right-2 w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
            </div>

            {/* Decorative circles around icon */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 border-2 border-blue-200/30 rounded-full animate-ping"
              style={{ animationDuration: "3s" }}
            />
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 border-2 border-indigo-200/30 rounded-full animate-ping"
              style={{ animationDuration: "3s", animationDelay: "1s" }}
            />
          </div>

          {/* Title with animation */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 animate-fade-in-up delay-200">
            Page Not Found
          </h1>

          {/* Subtitle with animation */}
          <p className="text-gray-600 mb-8 leading-relaxed font-medium animate-fade-in-up delay-300">
            The page you're looking for doesn't exist or has been moved to a new
            location.
          </p>

          {/* Animated divider */}
          <div className="flex items-center justify-center mb-8 animate-fade-in-up delay-300">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full" />
            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent w-full" />
          </div>

          {/* Action buttons with staggered animations */}
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 transition-all duration-300 inline-flex items-center justify-center space-x-2 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] group relative overflow-hidden animate-fade-in-up delay-400"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold relative z-10">
                Return to Home
              </span>
              <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 inline-flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] group animate-fade-in-up delay-400"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold">Go Back</span>
            </button>
          </div>

          {/* Help text with animation */}
          <div className="mt-8 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl animate-fade-in-up delay-400">
            <p className="text-sm text-gray-600 font-medium">
              Need help? Contact our{" "}
              <Link
                to="/support"
                className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-2 transition-all duration-200"
              >
                support team
              </Link>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-gray-500 text-sm font-medium animate-fade-in-up delay-400">
          Error Code:{" "}
          <span className="font-mono text-blue-600">404_NOT_FOUND</span>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
