import React from 'react';

interface SelectFieldProps extends React.ComponentProps<'select'> {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const SelectField = ({ label, icon, className = '', children, ...props }: SelectFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {label}
      </label>
      <select
        className={`w-full p-2.5 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default SelectField;
