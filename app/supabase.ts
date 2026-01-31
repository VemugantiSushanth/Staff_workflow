import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zwidqujljmgdrlpafino.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3aWRxdWpsam1nZHJscGFmaW5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDI0MjEsImV4cCI6MjA4NDQ3ODQyMX0.9LbBsr3xggFu58uyxJz9SoXplW3d0RooNJs0aLh4f0w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
