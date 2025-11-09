import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  IdCard,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  Stethoscope,
  Shield,
  Clock,
  Heart,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authAPI";
import { assets } from "../assets/assets";

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
      {/* Animated focus background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-xl transition-all duration-500 ${
          isFocused ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />

      {/* Animated icon */}
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
        className="relative w-full border-2 border-gray-200/60 bg-white text-gray-800 rounded-xl pl-12 pr-12 py-3.5 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-300 placeholder:text-gray-400 shadow-sm hover:shadow-md hover:border-gray-300 font-medium text-sm animate-fade-in"
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

const SelectField = ({ icon: Icon, options = [], ...props }) => {
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

      <select
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="relative w-full border-2 border-gray-200/60 bg-white text-gray-800 rounded-xl pl-12 pr-10 py-3.5 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-300 appearance-none shadow-sm hover:shadow-md hover:border-gray-300 font-medium text-sm animate-fade-in"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-300 group-hover:-translate-y-[14px]">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

const Signup = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        fullName,
        age,
        email,
        password,
        cnic,
        phone,
        gender,
        address,
        role: "Patient",
      };

      const res = await signup(payload);
      console.log("res", res);

      setLoading(false);
      alert(res.data.message);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setError(
        error.response?.data?.message || "Signup failed! Please try again."
      );
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const genderOptions = [
    { value: "", label: "Select Gender" },
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

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
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
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
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
            transform: scale(0.9);
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
            transform: translateY(-10px);
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
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          background-size: 1000px 100%;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
      `}</style>

      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slow delay-700" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-float-slow" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-400/40 rounded-full animate-float delay-200" />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400/40 rounded-full animate-float delay-400" />
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-400/40 rounded-full animate-float delay-300" />
      </div>

      <div className="flex w-full max-w-6xl shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[90vh] max-h-[95vh] relative z-10 backdrop-blur-sm animate-scale-in">
        {/* Left Side: Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden animate-slide-in-left">
          {/* Gradient overlay with animation */}
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
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-8 group hover:bg-white/30 transition-all duration-300 cursor-pointer animate-bounce-subtle">
                <Stethoscope className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Join Our <br /> Healthcare Family
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md font-light">
                Create your account to access personalized healthcare services,
                manage appointments, and track your health journey with ease.
              </p>
            </div>

            {/* Animated Features List */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 group hover:translate-x-2 transition-all duration-300 opacity-0 animate-slide-in-right"
                  style={{
                    animationDelay: `${i * 150 + 300}ms`,
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

            {/* Decorative bottom element with animation */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse-slow" />
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col overflow-hidden bg-gradient-to-br from-white to-gray-50/50 animate-slide-in-right">
          {/* Header Section */}
          <div className="text-center lg:text-left mb-6 animate-fade-in">
            <div className="inline-block mb-3">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Create Account
                </h2>
                <Sparkles className="w-6 h-6 text-indigo-600 animate-bounce-subtle" />
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-shimmer" />
            </div>
            <p className="text-gray-600 text-sm font-medium">
              Join thousands of patients managing their health
            </p>
          </div>

          {/* Scrollable Form Container with custom scrollbar */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #3b82f6, #6366f1);
              border-radius: 10px;
              transition: background 0.3s ease;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #2563eb, #4f46e5);
            }
          `}</style>

          <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-5 pb-2">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-fade-in delay-100">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <InputField
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    icon={User}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 animate-fade-in delay-200">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Age
                  </label>
                  <InputField
                    type="number"
                    name="age"
                    placeholder="Your age"
                    icon={Calendar}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="space-y-2 animate-fade-in delay-300">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
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
                <div className="space-y-2 animate-fade-in delay-400">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Password
                  </label>
                  <InputField
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    showPasswordToggle={true}
                    onTogglePassword={togglePasswordVisibility}
                  />
                </div>
              </div>

              {/* Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 animate-fade-in delay-500">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    CNIC
                  </label>
                  <InputField
                    type="text"
                    name="cnic"
                    placeholder="XXXXX-XXXXXXX-X"
                    icon={IdCard}
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 animate-fade-in delay-500">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <InputField
                    type="tel"
                    name="phone"
                    placeholder="+92 XXX XXXXXXX"
                    icon={Phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="space-y-2 animate-fade-in delay-700">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Gender
                  </label>
                  <SelectField
                    name="gender"
                    options={genderOptions}
                    icon={User}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 animate-fade-in delay-700">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Address
                  </label>
                  <InputField
                    type="text"
                    name="address"
                    placeholder="Enter your complete address"
                    icon={MapPin}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Error Message with animation */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
                  <p className="text-red-700 text-sm font-semibold text-center flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Submit Button with gradient and animation */}
          <div className="pt-5 border-t-2 border-gray-100 mt-5 animate-fade-in delay-700">
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg relative overflow-hidden group"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-semibold">
                    Creating your account...
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 relative z-10">
                  <span className="font-semibold">Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center mt-5">
              <p className="text-gray-600 text-sm font-medium">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-blue-600 hover:text-blue-700 font-bold transition-all duration-200 hover:underline underline-offset-4 hover:scale-105 inline-block"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
