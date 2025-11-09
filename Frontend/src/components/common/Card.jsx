const Card = ({
  children,
  className = "",
  padding = "medium",
  hover = false,
  ...props
}) => {
  const paddingClasses = {
    small: "p-4",
    medium: "p-6",
    large: "p-8",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100/80 backdrop-blur-sm ${
        paddingClasses[padding]
      } ${
        hover
          ? "transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
