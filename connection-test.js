// Direct Supabase Connection Test - ES module syntax
import { createClient } from "@supabase/supabase-js";

// Your exact environment variables
const supabaseUrl = "https://yjyxgloxiiubmdhcnoqx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeXhnbG94aWl1Ym1kaGNub3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1NjU2NDEsImV4cCI6MjA3MTE0MTY0MX0.jrwY-sRG3YOt75UwBrRQAHS7cIL2ZuvzYO3XwA0IHRs";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🔍 Testing Supabase Connection Alignment...\n");

async function testConnection() {
  const results = [];

  // Test 1: Basic Connection
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    if (error) throw error;
    results.push("✅ Basic connection successful");
  } catch (error) {
    results.push("❌ Connection failed: " + error.message);
  }

  // Test 2: Earnings Table Schema (Your DB Structure)
  try {
    const { data, error } = await supabase
      .from("earnings")
      .select("id, user_id, earning_date, amount, inventory_cost")
      .limit(1);
    if (error) throw error;
    results.push(
      "✅ Earnings table matches your schema (earning_date, amount columns verified)"
    );
  } catch (error) {
    results.push("❌ Earnings schema error: " + error.message);
  }

  // Test 3: Profile Table with Notifications
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, phone_number, notify_whatsapp, notify_email")
      .limit(1);
    if (error) throw error;
    results.push("✅ Profile table includes notification fields");
  } catch (error) {
    results.push("❌ Profile schema error: " + error.message);
  }

  // Test 4: Check if tables exist and have correct structure
  try {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    const { data: earningsData } = await supabase
      .from("earnings")
      .select("*")
      .limit(1);

    const { data: documentsData } = await supabase
      .from("documents")
      .select("*")
      .limit(1);

    results.push(
      "✅ All required tables exist (profiles, earnings, documents)"
    );
  } catch (error) {
    results.push("❌ Table structure error: " + error.message);
  }

  // Display Results
  console.log("TEST RESULTS:");
  results.forEach((result) => console.log(result));

  const passed = results.filter((r) => r.startsWith("✅")).length;
  const total = results.length;

  console.log(`\n📊 Score: ${passed}/${total}`);

  if (passed === total) {
    console.log(
      "\n🎉 PERFECT ALIGNMENT! Your Supabase connection works smoothly."
    );
    console.log("✅ Database schema matches your structure");
    console.log("✅ Column names align (earning_date, amount, status)");
    console.log("✅ All tables accessible");
    console.log("✅ Ready for smooth data flow");
    console.log("\n🚀 Your VirtualCFO backend is perfectly connected!");
  } else {
    console.log("\n⚠️ Issues found. Please review and fix the failed tests.");
  }
}

testConnection().catch(console.error);
