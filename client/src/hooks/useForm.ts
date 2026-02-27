import { useState, useCallback } from 'react';

export function useForm<T>(initialValues: T, validateFn: (values: T) => Record<string, string>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      if (prev[field as string]) {
        return { ...prev, [field as string]: '' };
      }
      return prev;
    });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = validateFn(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateFn]);

  const resetForm = useCallback((newValues: T) => {
    setValues(newValues);
    setErrors({});
  }, []);

  return {
    values,
    errors,
    handleChange,
    validateForm,
    resetForm,
    setValues,
  };
}
