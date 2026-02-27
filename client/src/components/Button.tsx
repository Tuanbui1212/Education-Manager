import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = ({ variant = 'primary', icon, children, className = '', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-[var(--color-primary-btn)] text-white hover:opacity-90 shadow-md',
    secondary: 'bg-gray-200 text-[var(--color-text-main)] hover:bg-gray-300',
    outline: 'border border-gray-300 text-[var(--color-text-main)] hover:bg-gray-50',
  };

  return (
    <button
      className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all active:scale-95 font-semibold disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
