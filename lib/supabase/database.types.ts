// Database type definitions
// TODO: Generate automatically with Supabase CLI: npx supabase gen types typescript --project-id apikrzrgobboqykecjhx

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      event_dates: {
        Row: {
          id: string;
          organization_id: string;
          date: string;
          title: string;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          date: string;
          title: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          date?: string;
          title?: string;
          location?: string | null;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          order: number;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          order: number;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          order?: number;
          color?: string | null;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          organization_id: string;
          group_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          group_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          group_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      attendances: {
        Row: {
          id: string;
          organization_id: string;
          event_date_id: string;
          member_id: string;
          status: '◯' | '△' | '✗';
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          event_date_id: string;
          member_id: string;
          status: '◯' | '△' | '✗';
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          event_date_id?: string;
          member_id?: string;
          status?: '◯' | '△' | '✗';
          created_at?: string;
        };
      };
    };
  };
};
