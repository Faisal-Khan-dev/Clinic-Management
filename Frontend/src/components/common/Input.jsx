import { useState } from "react";

const Input = ({
  label,
  type = "text",
  error,
  icon: Icon,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative group">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl transition-all duration-300 ${
            isFocused ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        />

        {Icon && (
          <Icon
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
              isFocused ? "text-blue-600" : "text-gray-400"
            }`}
          />
        )}

        <input
          type={type}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`relative w-full border border-gray-200/80 bg-white/80 text-gray-800 rounded-2xl ${
            Icon ? "pl-12 pr-4" : "px-4"
          } py-3 focus:ring-0 focus:outline-none focus:bg-white transition-all duration-200 placeholder:text-gray-400 shadow-sm backdrop-blur-sm font-medium`}
          {...props}
        />
      </div>
      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
    </div>
  );
};

export default Input;
