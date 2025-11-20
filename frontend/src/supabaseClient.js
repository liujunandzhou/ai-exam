import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jovfrfzerjygtctousle.supabase.co';
const supabaseKey = 'sb_publishable_Ra81lnNT6xmhsMLcEDuh3Q_CIUvYvuU'; // Public Anon Key

export const supabase = createClient(supabaseUrl, supabaseKey);
