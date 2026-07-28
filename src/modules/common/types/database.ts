export type ProductStatus = "active" | "inactive";

export interface AdminUserRow {
  id: string;
  email: string;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  delete: boolean;
  created_at: string;
}

export interface ProductRow {
  id: string;
  affiliate_url: string;
  image_url: string | null;
  image_urls: string[];
  name: string;
  brand: string | null;
  store: string;
  category: string;
  current_price: number;
  original_price: number | null;
  discount_percentage: number | null;
  currency: string;
  rating: number | null;
  total_reviews: number | null;
  short_description: string | null;
  status: ProductStatus;
  delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  id?: string;
  affiliate_url: string;
  image_url?: string | null;
  image_urls?: string[];
  name: string;
  brand?: string | null;
  store: string;
  category: string;
  current_price?: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  currency?: string;
  rating?: number | null;
  total_reviews?: number | null;
  short_description?: string | null;
  status?: ProductStatus;
  delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductUpdate {
  id?: string;
  affiliate_url?: string;
  image_url?: string | null;
  image_urls?: string[];
  name?: string;
  brand?: string | null;
  store?: string;
  category?: string;
  current_price?: number;
  original_price?: number | null;
  discount_percentage?: number | null;
  currency?: string;
  rating?: number | null;
  total_reviews?: number | null;
  short_description?: string | null;
  status?: ProductStatus;
  delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUserRow;
        Insert: {
          id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: {
          id?: string;
          name: string;
          delete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          delete?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
