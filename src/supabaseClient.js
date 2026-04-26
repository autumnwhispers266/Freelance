import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yukyveoehkxctkjerssy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a3l2ZW9laGt4Y3RramVyc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDcxMjMsImV4cCI6MjA5Mjc4MzEyM30.OzoHH71FHG0QIUvOfS6GZyVr9gqmKfspfgY0nMizhiI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
