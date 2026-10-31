import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/login?setup=1");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: settings } = await supabase.from("app_settings").select("business_name,owner_email,timezone,report_enabled").eq("id", true).maybeSingle();
  if (!settings) {
    return <main className="setup-locked"><div className="setup-card"><span className="brand-mark">b</span><p className="eyebrow">ONE MORE SETUP STEP</p><h1>Your owner account isn’t linked yet.</h1><p>Ask the project administrator to link this Supabase Auth user ID to the single owner slot in app_settings. This account does not have access to the shop data.</p></div></main>;
  }
  return <Dashboard settings={settings} userEmail={user.email ?? ""} />;
}
