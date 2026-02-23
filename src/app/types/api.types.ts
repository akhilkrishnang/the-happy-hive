/**
 * Happy Hive API Types
 * Defines the response types for all API endpoints
 */

export interface HiveItem {
  id: number;
  name: string;
  dept?: string | null;
  about?: string | null;
  dob?: string | null;
  dp_id?: string | null;
  created_at: string;
  updated_at: string;
  formatted_dob?: string; // Optional field for formatted date of birth
}

export interface CreateHiveItemRequest {
  name: string;
  dept?: string;
  about?: string;
  dob?: string;
  dp_id?: string;
}

export interface UpdateHiveItemRequest {
  name?: string;
  dept?: string;
  about?: string;
  dob?: string;
  dp_id?: string;
}

export interface Spotlight {
  id: number;
  description: string;
  type: string;
  expiry: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSpotlightRequest {
  description: string;
  type: string;
  expiry: string;
}

export interface UpdateSpotlightRequest {
  description?: string;
  type?: string;
  expiry?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
