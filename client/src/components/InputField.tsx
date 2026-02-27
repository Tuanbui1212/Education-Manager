interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}

const InputField = ({ label, icon, error, className = '', ...props }: InputFieldProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        className={`w-full p-2.5 border rounded-xl outline-none transition-all ${
          error
            ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-400'
            : 'focus:ring-2 focus:ring-[var(--color-primary)]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1 animate-in slide-in-from-top-1">{error}</p>}
    </div>
  );
};

export default InputField;
