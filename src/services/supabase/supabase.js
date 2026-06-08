import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://btzssidftzykhmifsrpz.supabase.co";
const supabaseKey = "sb_publishable_WrOwovlHhPtfPaAhsKelrg_3hbTnJAE";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);