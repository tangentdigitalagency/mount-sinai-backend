/**
 * API Request and Response Types
 *
 * Standard types for API endpoints following consistent patterns
 */

import { z } from "zod";

// ============================================================================
// STANDARD API RESPONSE TYPES
// ============================================================================

export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  message: z.string().optional(),
});

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().min(0),
    total_pages: z.number().int().min(0),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  }),
});

export type PaginatedResponse<T = unknown> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

// ============================================================================
// COMMON QUERY PARAMETERS
// ============================================================================

export const UUIDParamSchema = z.object({
  id: z.string().uuid(),
});

export type UUIDParam = z.infer<typeof UUIDParamSchema>;

export const DateRangeQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type DateRangeQuery = z.infer<typeof DateRangeQuerySchema>;

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(255),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// ============================================================================
// VERSE REFERENCE TYPES
// ============================================================================

export const VerseReferenceSchema = z.object({
  book_id: z.string(),
  book_name: z.string(),
  chapter: z.number().int().positive(),
  verse_number: z.number().int().positive(),
  version_id: z.string().optional(),
  version_abbreviation: z.string().optional(),
});

export type VerseReference = z.infer<typeof VerseReferenceSchema>;

export const ChapterReferenceSchema = z.object({
  book_id: z.string(),
  book_name: z.string(),
  chapter: z.number().int().positive(),
});

export type ChapterReference = z.infer<typeof ChapterReferenceSchema>;

// ============================================================================
// BATCH OPERATION TYPES
// ============================================================================

export const BatchDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export type BatchDelete = z.infer<typeof BatchDeleteSchema>;

export const BatchUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: z.record(z.string(), z.unknown()),
});

export type BatchUpdate = z.infer<typeof BatchUpdateSchema>;

// ============================================================================
// FILTER TYPES
// ============================================================================

export const DateFilterSchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type DateFilter = z.infer<typeof DateFilterSchema>;

export const BooleanFilterSchema = z
  .enum(["true", "false", "all"])
  .default("all");

export type BooleanFilter = z.infer<typeof BooleanFilterSchema>;

// ============================================================================
// SORTING TYPES
// ============================================================================

export type SortOrder = "asc" | "desc";

export const SortParamsSchema = z.object({
  sort_by: z.string(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type SortParams = z.infer<typeof SortParamsSchema>;
