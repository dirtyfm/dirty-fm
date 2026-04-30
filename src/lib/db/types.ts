export type ContactSubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "archived"
  | "read_on_air";
export type PostSubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "draft"
  | "published"
  | "archived";
export type PostStatus = "draft" | "published" | "archived";
export type AdminRole = "admin" | "editor";

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          user_id: string;
          role: AdminRole;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role?: AdminRole;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: AdminRole;
          display_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          submission_type: string;
          message: string;
          attachment_url: string | null;
          can_read_on_air: boolean;
          status: ContactSubmissionStatus;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          subject: string;
          submission_type: string;
          message: string;
          attachment_url?: string | null;
          can_read_on_air: boolean;
          status?: ContactSubmissionStatus;
          admin_notes?: string | null;
          reviewed_by?: null;
          reviewed_at?: null;
          created_at?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      post_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          title: string;
          category: string;
          body: string;
          source_url: string | null;
          status: PostSubmissionStatus;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          title: string;
          category: string;
          body: string;
          source_url?: string | null;
          status?: PostSubmissionStatus;
          admin_notes?: string | null;
          reviewed_by?: null;
          reviewed_at?: null;
          created_at?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          category: string;
          author: string;
          featured_image_url: string | null;
          status: PostStatus;
          published_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          author_email: string | null;
          body: string;
          is_hidden: boolean;
          hidden_by: string | null;
          hidden_at: string | null;
          created_at: string;
        };
        Insert: {
          post_id: string;
          author_name: string;
          author_email?: string | null;
          body: string;
          is_hidden?: false;
          hidden_by?: null;
          hidden_at?: null;
          created_at?: string;
        };
        Update: Record<string, unknown>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          title: string;
          youtube_id: string;
          description: string;
          category: string;
          status: string;
          host: string;
          is_featured: boolean;
          published_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_dirtyfm_admin: {
        Args: {
          check_user_id: string;
        };
        Returns: boolean;
      };
    };
    CompositeTypes: Record<string, never>;
    Enums: {
      admin_role: AdminRole;
      post_status: PostStatus;
      contact_submission_status: ContactSubmissionStatus;
      post_submission_status: PostSubmissionStatus;
    };
  };
};
