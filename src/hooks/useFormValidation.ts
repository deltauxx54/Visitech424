/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';

export interface ValidationRules {
  phone?: boolean;
  immatriculation?: boolean;
  required?: boolean;
  minLength?: number;
}

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: { [K in keyof T]?: ValidationRules }
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({});

  const validateField = useCallback((name: keyof T, value: string): string => {
    const fieldRules = rules[name];
    if (!fieldRules) return '';

    // Required check
    if (fieldRules.required && !value.trim()) {
      return 'Ce champ est requis.';
    }

    // MinLength check
    if (fieldRules.minLength && value.trim().length < fieldRules.minLength) {
      return `Ce champ doit contenir au moins ${fieldRules.minLength} caractères.`;
    }

    // Phone format check (Cameroon/CEMAC format: exactly 9 digits, or with optional +237/237 prefix)
    if (fieldRules.phone) {
      const cleanPhone = value.replace(/[\s.-]/g, '');
      // Format 237xxxxxxxxx or +237xxxxxxxxx
      const patternHasCountryCode = /^(?:\+237|237|00237)/;
      const digitsOnly = cleanPhone.replace(/^\+237|^237|^00237/, '');
      
      if (!value.trim()) {
        return ''; // Handled by required if set
      }

      // Check if remainder is digits and has exactly 9 digits
      if (!/^\d+$/.test(digitsOnly)) {
        return 'Le numéro de téléphone ne doit contenir que des chiffres.';
      }
      
      if (digitsOnly.length !== 9) {
        return 'Le format national requiert exactement 9 chiffres (ex: 699887766).';
      }

      // First digit of local phone should be standard mobile/landline indicators (6, 2, 3)
      if (!/^[236]/.test(digitsOnly)) {
        return 'Le numéro national doit débuter par un 6 (mobile), un 2 ou un 3 (fixe).';
      }
    }

    // Immatriculation plate format check (CEMAC: XX-123-XX or XX-1234-XX)
    if (fieldRules.immatriculation) {
      if (!value.trim()) {
        return ''; // Handled by required if set
      }

      const cleanPlate = value.trim().toUpperCase();
      const PLATE_REGEX = /^[A-Z]{2}-\d{3,4}-[A-Z]{2}$/;

      if (!PLATE_REGEX.test(cleanPlate)) {
        return "Format d'immatriculation incorrect. Attendu: XX-123-XX ou XX-1234-XX (ex: LT-482-AA).";
      }
    }

    return '';
  }, [rules]);

  const handleChange = useCallback((name: keyof T, value: string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  }, [validateField]);

  const handleBlur = useCallback((name: keyof T) => {
    const error = validateField(name, values[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  }, [validateField, values]);

  const validateAll = useCallback((): boolean => {
    const newErrors: { [K in keyof T]?: string } = {};
    let isValid = true;

    for (const key in rules) {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validateField, values, rules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  // Combined validity check
  const isFormValid = useCallback((): boolean => {
    for (const key in rules) {
      if (validateField(key, values[key])) {
        return false;
      }
    }
    return true;
  }, [validateField, values, rules]);

  return {
    values,
    errors,
    isFormValid: isFormValid(),
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
    setErrors,
  };
}
