import { HttpErrorResponse } from '@angular/common/http';

import { ValidationProblemDetails } from '@core/auth/auth.models';

export function formatApiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ValidationProblemDetails | string | undefined;
    if (problem && typeof problem === 'object') {
      const messages = extractValidationMessages(problem);
      if (messages.length) {
        return messages.join(' ');
      }

      if (problem.title) {
        return problem.title;
      }
    }

    if (typeof problem === 'string' && problem.trim()) {
      return problem;
    }

    return `Error ${error.status}: ${error.statusText || 'No fue posible completar la solicitud.'}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado.';
}

function extractValidationMessages(problem: ValidationProblemDetails): string[] {
  if (!problem.errors) {
    return [];
  }

  const messages = Object.values(problem.errors)
    .flatMap((value) => (Array.isArray(value) ? value : []))
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return [...new Set(messages)];
}
