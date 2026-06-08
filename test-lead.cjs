const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://thyryuzgnzsjqgkddreg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoeXJ5dXpnbnpzanFna2RkcmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODQzNTIsImV4cCI6MjA5MzQ2MDM1Mn0.kf_gp0IAr32HyRSKQxck_6dlsHHxuvg1SgdpA2Iy720';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const currentLead = {
    name: "Test Name",
    phone: "123456789",
    vehicle: "Fusca",
    plate: "ABC-1234",
    city: "Test City",
    date: new Date().toISOString(),
    session_id: "test-session-123"
  };

  const { data, error } = await supabase
    .from('leads')
    .upsert(currentLead, { onConflict: 'session_id' })
    .select();
    
  console.log("Data:", data);
  console.log("Error:", JSON.stringify(error));
}

test();
