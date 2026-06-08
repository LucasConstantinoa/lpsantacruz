import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thyryuzgnzsjqgkddreg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoeXJ5dXpnbnpzanFna2RkcmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODQzNTIsImV4cCI6MjA5MzQ2MDM1Mn0.kf_gp0IAr32HyRSKQxck_6dlsHHxuvg1SgdpA2Iy720';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
