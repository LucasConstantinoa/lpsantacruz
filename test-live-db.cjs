const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://cnpfppmypopjaofmjako.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucGZwcG15cG9wamFvZm1qYWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MTc3OTEsImV4cCI6MjA5Mjk5Mzc5MX0.1VmiNcdBmk572lR5x5DdWBq_79XaF7YqOhvdF7LgL6E';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLeads() {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  console.log("LEADS COUNT:", data ? data.length : 0);
  console.log("LEADS ERROR:", error);
  if (data && data.length > 0) {
    console.log("LATEST 5 LEADS:");
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  }
}

checkLeads();
