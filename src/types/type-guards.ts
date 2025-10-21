/**
 * Type Guards and Utility Functions
 *
 * Helper functions for runtime type checking and validation
 */

import type { ApiSuccessResponse, ApiErrorResponse } from "./api.types";

/**
 * Type guard to check if API response is successful
 */
export const isApiSuccess = <T>(
  response: ApiSuccessResponse<T> | ApiErrorResponse
): response is ApiSuccessResponse<T> => {
  return response.success === true;
};

/**
 * Type guard to check if API response is an error
 */
export const isApiError = (
  response: ApiSuccessResponse | ApiErrorResponse
): response is ApiErrorResponse => {
  return response.success === false;
};

/**
 * Type guard to check if a value is a valid UUID
 */
export const isUUID = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Type guard to check if a value is a valid date string (YYYY-MM-DD)
 */
export const isDateString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;

  // Validate it's an actual valid date
  const date = new Date(value);
  return !isNaN(date.getTime());
};

/**
 * Type guard to check if a value is a valid ISO timestamp
 */
export const isISOTimestamp = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
};

/**
 * Ensures a value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Type guard for checking if value is a non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Type guard for checking if value is a positive number
 */
export const isPositiveNumber = (value: unknown): value is number => {
  return typeof value === "number" && value > 0 && !isNaN(value);
};

/**
 * Type guard for checking if value is a non-negative number
 */
export const isNonNegativeNumber = (value: unknown): value is number => {
  return typeof value === "number" && value >= 0 && !isNaN(value);
};
