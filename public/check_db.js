require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPatients() {
  const { data, error } = await supabase.from("patients").select("id, display_alias, invite_token, invite_email");
  if (error) console.error("Error:", error);
  else console.log("Patients:", JSON.stringify(data, null, 2));
}

checkPatients();
