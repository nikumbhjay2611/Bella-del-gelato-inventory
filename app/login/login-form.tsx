"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ showSetup, reset }: { showSetup: boolean; reset: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const supabase = createClient();
      if(reset){const{error:changeError}=await supabase.auth.updateUser({password:newPassword});if(changeError)throw changeError;router.replace("/");router.refresh();return}
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) throw authError;
      router.replace("/"); router.refresh();
    } catch { setError("We couldn’t sign you in. Check your email and password, then try again."); }
    finally { setBusy(false); }
  }
  async function resetPassword() {
    if (!email.trim()) { setError("Enter your owner email first, then choose reset password."); return; }
    setBusy(true); setError("");
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent("/login?reset=1")}` });
    setBusy(false);
    setError(resetError ? "Password reset email couldn’t be sent. Check the Supabase email settings." : "If that owner account exists, Supabase has sent a password reset email.");
  }
  return <main className="login-page"><section className="login-art"><a className="brand brand-light" href="/login"><span className="brand-mark">b</span><span>bella del gelato<span className="brand-dot">.</span></span></a><div className="art-copy"><p className="eyebrow">A LITTLE MORE MAGIC IN THE KITCHEN</p><h1>Made with care.<br/><em>Managed with ease.</em></h1><p>Recipes, ingredients, and every small batch—right where you need them.</p></div><div className="gelato-art" aria-hidden="true"><span className="gelato-shadow"/><span className="scoop scoop-pistachio">✳</span><span className="scoop scoop-cream">✳</span><span className="scoop scoop-berry">✳</span><span className="cone">▥</span><span className="sparkle s1">✦</span><span className="sparkle s2">✳</span><span className="sparkle s3">✧</span></div><div className="art-footer"><span>SMALL BATCHES, BIG HEART</span><span>EST. WITH LOVE · 2026</span></div></section><section className="login-main"><div className="login-card"><div className="mobile-login-brand"><span className="brand-mark">b</span><span>bella del gelato<span className="brand-dot">.</span></span></div><div className="login-heading"><p className="eyebrow">OWNER WORKSPACE</p><h2>{reset?"Choose a new password":"Welcome back"}<span>.</span></h2><p>{reset?"Set a new password for your owner account.":"Sign in to your gelato kitchen."}</p></div>{showSetup&&<div className="inline-alert setup-alert"><b>Connect your Supabase project</b><span>Add the project URL and publishable key to your local <code>.env.local</code> file. Follow SETUP.md for the steps.</span></div>}{reset&&<div className="inline-alert">Choose a unique password and save it in your password manager.</div>}<form onSubmit={submit} className="login-form">{!reset&&<label>Email address<input autoComplete="username" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="owner@belladelgelato.com" required/></label>}{reset?<label>New password<input autoComplete="new-password" type="password" minLength={12} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="At least 12 characters" required/></label>:<label>Password<input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/></label>}{error&&<p className="form-error" role="status">{error}</p>}<button className="button button-dark login-submit" disabled={busy}>{busy?<span className="spinner"/>:reset?"Update password":"Sign in to your kitchen"}<span>→</span></button></form>{!reset&&<button className="forgot-button" onClick={resetPassword} disabled={busy}>Forgot password?</button>}<div className="login-divider"><span/></div><p className="login-footnote"><span>♧</span> Private workspace · Owner access only</p></div><div className="login-copyright">© 2026 Bella del Gelato <span>·</span> Made for the love of gelato</div></section></main>;
}
