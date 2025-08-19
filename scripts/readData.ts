
import { createClient } from "@supabase/supabase-js";

export const supabase = 
    createClient(
    "https://vmmbjfycdefakulnyzhl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbWJqZnljZGVmYWt1bG55emhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ3NDAsImV4cCI6MjA3MTE3MDc0MH0.GrkUW60Hm4vj68zazse1H1GIyg9A-hNx5CPYHpmM_nE",
  );

(async () => {
  const { data, error } = await supabase.from("raw_records").select("*");
  console.log(data);
})();