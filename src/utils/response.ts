import type { Response } from 'express';

interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * Sends a standardized success response
 * 
 * @param res - Express response object
 * @param data - Data to send in the response
 * @param statusCode - HTTP status code (default: 200)
 * @param message - Optional success message
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response<SuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

/**
 * Sends a standardized error response
 * 
 * @param res - Express response object
 * @param error - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Optional error details
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  details?: unknown
): Response<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

