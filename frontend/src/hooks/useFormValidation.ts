'use client';

import { useState, useCallback } from 'react';
import { z, ZodSchema } from 'zod';

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
}

export function useFormValidation<T>(schemaOrOptions: ZodSchema<T> | UseFormValidationOptions<T>) {
  const schema = 'schema' in (schemaOrOptions as object) ? (schemaOrOptions as UseFormValidationOptions<T>).schema : schemaOrOptions as ZodSchema<T>;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors({});
        return true;
      }
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return false;
    },
    [schema],
  );

  const getError = useCallback(
    (field: string): string | undefined => errors[field],
    [errors],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, getError, clearErrors };
}
