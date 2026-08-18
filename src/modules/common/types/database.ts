export type ProductStatus = "active" | "inactive";
export type UserRole = "admin" | "user";

export type {
  ProductAttributes,
  ProductAttributeRow,
} from "./product-attributes";

export interface AdminUserRow extends Record<string, unknown> {
  id: string;
  email: string;
  created_at: string;
}

export interface UserRow extends Record<string, unknown> {
  id: string;
  email: string;
  role: UserRole;
  website_id: string | null;
  created_at: string;
}

export interface WebsiteRow extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow extends Record<string, unknown> {
  id: string;
  website_id: string;
  name: string;
  delete: boolean;
  created_at: string;
}

export interface ProductRow extends Record<string, unknown> {
  id: string;
  website_id: string;
  amazon_source_url: string | null;
  amazon_affiliate_url: string | null;
  amazon_current_price: number | null;
  amazon_original_price: number | null;
  flipkart_source_url: string | null;
  flipkart_affiliate_url: string | null;
  flipkart_current_price: number | null;
  flipkart_original_price: number | null;
  amazon_discount_percentage: number | null;
  flipkart_discount_percentage: number | null;
  image_url: string | null;
  image_urls: string[];
  name: string;
  slug: string;
  brand: string | null;
  category: string;
  currency: string;
  rating: number | null;
  total_reviews: number | null;
  short_description: string | null;
  pet_type: string | null;
  life_stage: string | null;
  breed_size: string | null;
  food_type: string | null;
  flavor: string | null;
  pack_weight: number | null;
  pack_weight_unit: string | null;
  pack_count: number | null;
  status: ProductStatus;
  delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert extends Record<string, unknown> {
  id?: string;
  website_id?: string;
  amazon_source_url?: string | null;
  amazon_affiliate_url: string;
  amazon_current_price: number;
  amazon_original_price?: number | null;
  flipkart_source_url?: string | null;
  flipkart_affiliate_url?: string | null;
  flipkart_current_price?: number | null;
  flipkart_original_price?: number | null;
  amazon_discount_percentage?: number | null;
  flipkart_discount_percentage?: number | null;
  image_url?: string | null;
  image_urls?: string[];
  name: string;
  slug: string;
  brand?: string | null;
  category: string;
  currency?: string;
  rating?: number | null;
  total_reviews?: number | null;
  short_description?: string | null;
  pet_type?: string | null;
  life_stage?: string | null;
  breed_size?: string | null;
  food_type?: string | null;
  flavor?: string | null;
  pack_weight?: number | null;
  pack_weight_unit?: string | null;
  pack_count?: number | null;
  status?: ProductStatus;
  delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductUpdate extends Record<string, unknown> {
  id?: string;
  website_id?: string;
  amazon_source_url?: string | null;
  amazon_affiliate_url?: string;
  amazon_current_price?: number;
  amazon_original_price?: number | null;
  flipkart_source_url?: string | null;
  flipkart_affiliate_url?: string | null;
  flipkart_current_price?: number | null;
  flipkart_original_price?: number | null;
  amazon_discount_percentage?: number | null;
  flipkart_discount_percentage?: number | null;
  image_url?: string | null;
  image_urls?: string[];
  name?: string;
  slug?: string;
  brand?: string | null;
  category?: string;
  currency?: string;
  rating?: number | null;
  total_reviews?: number | null;
  short_description?: string | null;
  pet_type?: string | null;
  life_stage?: string | null;
  breed_size?: string | null;
  food_type?: string | null;
  flavor?: string | null;
  pack_weight?: number | null;
  pack_weight_unit?: string | null;
  pack_count?: number | null;
  status?: ProductStatus;
  delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlogRow extends Record<string, unknown> {
  id: string;
  website_id: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url: string | null;
  category_id: string | null;
  published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots_meta: string;
  h1: string | null;
  schema_json_ld: Record<string, unknown> | null;
  author: string | null;
  featured_image_alt: string | null;
  include_in_sitemap: boolean;
  delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryRow extends Record<string, unknown> {
  id: string;
  website_id: string;
  name: string;
  delete: boolean;
  created_at: string;
}

export interface BlogInsert extends Record<string, unknown> {
  id?: string;
  website_id?: string;
  title: string;
  slug: string;
  content: string;
  cover_image_url?: string | null;
  category_id?: string | null;
  published?: boolean;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  robots_meta?: string;
  h1?: string | null;
  schema_json_ld?: Record<string, unknown> | null;
  author?: string | null;
  featured_image_alt?: string | null;
  include_in_sitemap?: boolean;
  delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlogUpdate extends Record<string, unknown> {
  id?: string;
  website_id?: string;
  title?: string;
  slug?: string;
  content?: string;
  cover_image_url?: string | null;
  category_id?: string | null;
  published?: boolean;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  robots_meta?: string;
  h1?: string | null;
  schema_json_ld?: Record<string, unknown> | null;
  author?: string | null;
  featured_image_alt?: string | null;
  include_in_sitemap?: boolean;
  delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type DatabaseRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
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
        Relationships: DatabaseRelationship[];
      };
      users: {
        Row: UserRow;
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          website_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          website_id?: string | null;
          created_at?: string;
        };
        Relationships: DatabaseRelationship[];
      };
      websites: {
        Row: WebsiteRow;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: DatabaseRelationship[];
      };
      categories: {
        Row: CategoryRow;
        Insert: {
          id?: string;
          website_id: string;
          name: string;
          delete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          name?: string;
          delete?: boolean;
          created_at?: string;
        };
        Relationships: DatabaseRelationship[];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: ProductUpdate;
        Relationships: DatabaseRelationship[];
      };
      blogs: {
        Row: BlogRow;
        Insert: BlogInsert;
        Update: BlogUpdate;
        Relationships: [
          {
            foreignKeyName: "blogs_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blogs_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_categories: {
        Row: BlogCategoryRow;
        Insert: {
          id?: string;
          website_id: string;
          name: string;
          delete?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          website_id?: string;
          name?: string;
          delete?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_categories_website_id_fkey";
            columns: ["website_id"];
            isOneToOne: false;
            referencedRelation: "websites";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
