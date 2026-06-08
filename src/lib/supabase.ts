import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnpfppmypopjaofmjako.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucGZwcG15cG9wamFvZm1qYWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTc3OTEsImV4cCI6MjA5Mjk5Mzc5MX0.1VmiNcdBmk572lR5x5DdWBq_79XaF7YqOhvdF7LgL6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
