export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      aleo_transactions: {
        Row: {
          block_height: number | null
          confirmed_at: string | null
          created_at: string
          function_name: string
          generation_id: string | null
          id: string
          inputs: Json | null
          outputs: Json | null
          program_id: string
          status: string
          tx_id: string
          tx_type: string
          user_address: string
        }
        Insert: {
          block_height?: number | null
          confirmed_at?: string | null
          created_at?: string
          function_name: string
          generation_id?: string | null
          id?: string
          inputs?: Json | null
          outputs?: Json | null
          program_id?: string
          status?: string
          tx_id: string
          tx_type: string
          user_address: string
        }
        Update: {
          block_height?: number | null
          confirmed_at?: string | null
          created_at?: string
          function_name?: string
          generation_id?: string | null
          id?: string
          inputs?: Json | null
          outputs?: Json | null
          program_id?: string
          status?: string
          tx_id?: string
          tx_type?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "aleo_transactions_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "synthetic_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          column_count: number
          created_at: string
          dataset_type: string
          filename: string
          id: string
          original_hash: string
          row_count: number
          status: string
          updated_at: string
          user_address: string
        }
        Insert: {
          column_count?: number
          created_at?: string
          dataset_type?: string
          filename: string
          id?: string
          original_hash: string
          row_count?: number
          status?: string
          updated_at?: string
          user_address: string
        }
        Update: {
          column_count?: number
          created_at?: string
          dataset_type?: string
          filename?: string
          id?: string
          original_hash?: string
          row_count?: number
          status?: string
          updated_at?: string
          user_address?: string
        }
        Relationships: []
      }
      proofs: {
        Row: {
          created_at: string
          dataset_commitment: string
          generation_id: string
          id: string
          params_hash: string
          proof_hash: string
          quality_score: number
          receipt_data: Json | null
          synth_commitment: string
          user_address: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          dataset_commitment: string
          generation_id: string
          id?: string
          params_hash: string
          proof_hash: string
          quality_score?: number
          receipt_data?: Json | null
          synth_commitment: string
          user_address: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          dataset_commitment?: string
          generation_id?: string
          id?: string
          params_hash?: string
          proof_hash?: string
          quality_score?: number
          receipt_data?: Json | null
          synth_commitment?: string
          user_address?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "proofs_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "synthetic_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      synthetic_generations: {
        Row: {
          aleo_proof_hash: string | null
          aleo_tx_id: string | null
          aleo_verified: boolean
          columns_included: number
          created_at: string
          dataset_id: string
          id: string
          output_format: string
          privacy_verified: boolean
          quality_mode: string
          quality_score: number | null
          rows_generated: number
          sensitive_removed: number
          synth_commitment: string | null
          synth_ready: boolean
          synthetic_data: Json | null
          user_address: string
        }
        Insert: {
          aleo_proof_hash?: string | null
          aleo_tx_id?: string | null
          aleo_verified?: boolean
          columns_included?: number
          created_at?: string
          dataset_id: string
          id?: string
          output_format?: string
          privacy_verified?: boolean
          quality_mode?: string
          quality_score?: number | null
          rows_generated?: number
          sensitive_removed?: number
          synth_commitment?: string | null
          synth_ready?: boolean
          synthetic_data?: Json | null
          user_address: string
        }
        Update: {
          aleo_proof_hash?: string | null
          aleo_tx_id?: string | null
          aleo_verified?: boolean
          columns_included?: number
          created_at?: string
          dataset_id?: string
          id?: string
          output_format?: string
          privacy_verified?: boolean
          quality_mode?: string
          quality_score?: number | null
          rows_generated?: number
          sensitive_removed?: number
          synth_commitment?: string | null
          synth_ready?: boolean
          synthetic_data?: Json | null
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "synthetic_generations_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
