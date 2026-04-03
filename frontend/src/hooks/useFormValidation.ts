'use client';

import { useState, useCallback } from 'react';
import { z } from 'zod';

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      const result = schema.safeParse(data);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          fieldErrors[e.path.join('.')] = e.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      setErrors({});
      return true;
    },
    [schema],
  );

  const getError = useCallback(
    (field: string) => errors[field],
    [errors],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  return { validate, errors, getError, clearErrors };
}
