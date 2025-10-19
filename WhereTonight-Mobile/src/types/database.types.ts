// Este archivo será copiado de tu app web
// Por ahora dejamos un placeholder
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Aquí irán tus tablas de Supabase
      [key: string]: any;
    }
  }
}
