import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key);

for (const table of ["profiles", "resumes"]) {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (error) {
    console.log(`${table}: FAIL ${error.code || ""} ${error.message}`);
  } else {
    console.log(`${table}: OK`);
  }
}
