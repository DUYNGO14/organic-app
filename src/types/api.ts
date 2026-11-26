export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;
export type SimpleResponse<T> = ApiResponse<T>;

export interface ApiError {
  success: false;
  code: number;
  errorCode: string;
  message: string;
  errors?: {
    field?: string;
    message: string;
  }[];
}
