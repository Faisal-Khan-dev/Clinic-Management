import React, { useState, useContext } from "react";
import { Mail, Lock, Heart, X, Eye, EyeOff, ArrowRight } from "lucide-react";
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
        className={`absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transition-all duration-300 ${
          isFocused ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      />
      <Icon
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
          isFocused ? "text-blue-600" : "text-gray-400"
        }`}
      />
      <input
        {...props}
        type={type}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="relative w-full border border-gray-200/80 bg-white/80 text-gray-800 rounded-2xl pl-12 pr-10 py-4 focus:ring-0 focus:outline-none focus:bg-white transition-all duration-200 placeholder:text-gray-400 shadow-sm backdrop-blur-sm font-medium"
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1"
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
  const { login: loginContext , user } = useContext(AuthContext);

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
      }
      else if (userData.role === "Doctor") {
       
        
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

  const fillDemoCredentials = () => {
    setEmail("test@user.com");
    setPassword("password");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      {notification && (
        <AlertModal
          message={notification.message}
          type={notification.type}
          onClose={handleCloseNotification}
        />
      )}

      <div className="flex w-full max-w-6xl shadow-2xl bg-white rounded-3xl overflow-hidden min-h-[600px]">
        {/* Left Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 opacity-90 z-10" />
          <img
            src={assets.simpleIMG}
            alt="Modern Medical Illustration"
            className="absolute inset-0 w-full h-full object-cover transform scale-110"
          />
          <div className="relative z-20 w-full p-12 flex flex-col justify-between text-white">
            <div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-8">
                <Heart className="w-7 h-7" />
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Welcome to <br /> HealthCare+
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                Your journey to better health starts here. Access your medical
                records, schedule appointments, and connect with healthcare
                providers.
              </p>
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-lg">
              Sign in to your account to continue
            </p>
          </div>

          {/* Demo Credentials */}
          <div
            onClick={fillDemoCredentials}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Demo Credentials
                  </p>
                  <p className="text-xs text-blue-600">
                    Click to auto-fill test account
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-500 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 flex-grow flex flex-col"
          >
            <InputField
              type="email"
              name="email"
              placeholder="Enter your email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                    rememberMe
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300"
                  }`}
                />
                <span className="text-gray-700 text-sm font-medium">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl mt-auto"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing you in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
