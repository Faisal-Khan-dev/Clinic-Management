import React, { useState, useContext } from "react";
import {
  Mail,
  Lock,
  Heart,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Stethoscope,
  Shield,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { login as loginAPI } from "../api/authAPI";

const AlertModal = ({ message, type, onClose }) => {
  const isSuccess = type === "success";
  const bgColor = isSuccess
    ? "bg-gradient-to-r from-green-500 to-emerald-600"
    : "bg-gradient-to-r from-red-500 to-rose-600";
  const Icon = isSuccess ? Heart : X;

  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-50 animate-slide-in-right">
      <div
        className={`${bgColor} text-white p-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm`}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5" />
          <span className="font-medium text-sm">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition duration-150 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const InputField = ({
  icon: Icon,
  type = "text",
  showPasswordToggle,
  onTogglePassword,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl transition-all duration-500 ${
          isFocused ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${
            isFocused
              ? "text-blue-600 scale-110 animate-pulse-slow"
              : "text-gray-400 scale-100"
          }`}
        />
      </div>
      <input
        {...props}
        type={type}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="relative w-full border-2 border-gray-200/60 bg-white text-gray-800 rounded-xl pl-12 pr-12 py-3.5 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-300 placeholder:text-gray-400 shadow-sm hover:shadow-md hover:border-gray-300 font-medium text-sm"
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-all duration-200 p-1 hover:scale-110 hover:rotate-12 z-10"
        >
          {type === "password" ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login: loginContext, user } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      const res = await loginAPI({ email, password });
      const { message, token, user, userData, patientData } = res.data;

      // ✅ Handle Admin Login
      if (message === "Staff logged in successfully!") {
        const adminData = {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        };
        loginContext(adminData, token);
        setNotification({
          message: "Admin login successful!",
          type: "success",
        });
        navigate("/admin/dashboard");
      } else if (userData.role === "Doctor") {
        const userDataObj = {
          id: userData._id,
          patientId: patientData?._id || null,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
        };
        loginContext(userDataObj, token);
        setNotification({ message: "Login successful!", type: "success" });
        navigate("/doctor/dashboard");
      }

      // ✅ Handle Patient Login (unchanged)
      else {
        const userDataObj = {
          id: userData._id,
          patientId: patientData?._id || null,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
        };
        loginContext(userDataObj, token);
        setNotification({ message: "Login successful!", type: "success" });
        navigate("/patient/dashboard");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => setNotification(null);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);



  const features = [
    {
      icon: Shield,
      text: "Secure & Private Portal",
      color: "text-emerald-400",
    },
    { icon: Clock, text: "24/7 Medical Access", color: "text-blue-400" },
    { icon: Heart, text: "Personal Health Records", color: "text-rose-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Advanced CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 30px rgba(99, 102, 241, 0.6), 0 0 40px rgba(59, 130, 246, 0.3);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s linear infinite;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.5) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2.5s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>

      {notification && (
        <AlertModal
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slow delay-700" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl animate-float-slow delay-300" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400/50 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-indigo-400/50 rounded-full animate-float delay-200" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400/50 rounded-full animate-float delay-400" />
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-400/50 rounded-full animate-float delay-300" />
      </div>

      <div className="flex w-full max-w-5xl shadow-2xl bg-white rounded-3xl overflow-hidden h-[85vh] max-h-[700px] relative z-10 backdrop-blur-sm animate-scale-in">
        {/* Left Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden animate-slide-in-left">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 opacity-95 z-10" />

          {/* Animated pattern overlay */}
          <div className="absolute inset-0 z-[11] opacity-10">
            <div
              className="absolute inset-0 animate-rotate-slow"
              style={{
                backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Shimmer effect */}
          <div className="absolute inset-0 z-[12] opacity-20 animate-shimmer" />

          <img
            src={assets.simpleIMG}
            alt="Medical Team"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-20 w-full p-12 flex flex-col justify-between text-white">
            {/* Header with animated icon */}
            <div className="opacity-0 animate-fade-in delay-200">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 group hover:bg-white/30 transition-all duration-300 cursor-pointer animate-bounce-subtle">
                <Stethoscope className="w-8 h-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Welcome Back to <br /> Your Health Hub
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md font-light">
                Access your personalized healthcare dashboard, manage
                appointments, and continue your wellness journey.
              </p>
            </div>

            {/* Animated Features List */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 group hover:translate-x-3 transition-all duration-300 opacity-0 animate-slide-in-right"
                  style={{
                    animationDelay: `${i * 150 + 600}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 animate-pulse-slow">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <span className="text-blue-50 font-medium group-hover:text-white transition-colors duration-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Decorative bottom element */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Right Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50/50 animate-slide-in-right overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            {/* Header Section */}
            <div className="text-center lg:text-left mb-6 opacity-0 animate-fade-in delay-300">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                    Sign In
                  </h2>
                  <Zap className="w-7 h-7 text-indigo-600 animate-bounce-subtle" />
                </div>
                <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-full animate-shimmer" />
              </div>
              <p className="text-gray-600 text-sm font-medium flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Enter your credentials to access your account
              </p>
            </div>

            

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 opacity-0 animate-slide-in-up delay-500">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 animate-pulse-slow" />
                  Email Address
                </label>
                <InputField
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 opacity-0 animate-slide-in-up delay-600">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600 animate-pulse-slow" />
                  Password
                </label>
                <InputField
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  icon={Lock}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showPasswordToggle
                  onTogglePassword={togglePasswordVisibility}
                />
              </div>

              {/* Remember Me */}
              

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold py-3.5 px-6 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg relative overflow-hidden group opacity-0 animate-slide-in-up delay-800"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-semibold">Signing you in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 relative z-10">
                    <span className="font-semibold">Continue to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 opacity-0 animate-fade-in delay-1000">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-white to-gray-50/50 px-4 text-gray-500 font-semibold tracking-wider">
                  New Here?
                </span>
              </div>
            </div>

            {/* Signup Link */}
            <div className="text-center opacity-0 animate-slide-in-up delay-1000">
              <p className="text-gray-600 text-sm font-medium mb-3">
                Don't have an account yet?
              </p>
              <button
                onClick={() => navigate("/signup")}
                className="w-full bg-white border-2 border-blue-600 text-blue-600 font-bold py-3.5 px-6 rounded-xl hover:bg-blue-50 hover:border-blue-700 transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex items-center justify-center space-x-2 relative z-10">
                  <Sparkles className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                  <span>Create New Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
