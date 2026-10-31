import "server-only";
import { NextRequest,NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildWeeklyWorkbook,previousWeekRange } from "@/lib/reports/workbook";

export const dynamic="force-dynamic";
export const maxDuration=60;
function authorized(request:NextRequest){const expected=process.env.CRON_SECRET,provided=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";if(!expected||!provided)return false;const a=Buffer.from(expected),b=Buffer.from(provided);return a.length===b.length&&timingSafeEqual(a,b)}
export async function GET(request:NextRequest){
  if(!authorized(request))return NextResponse.json({error:"Unauthorized."},{status:401});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,mailKey=process.env.RESEND_API_KEY,from=process.env.REPORT_FROM_EMAIL;
  if(!url||!key||!mailKey||!from)return NextResponse.json({error:"Missing report delivery configuration."},{status:503});
  const supabase=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
  const {data:settings,error}=await supabase.from("app_settings").select("owner_id,owner_email,business_name,report_enabled").eq("id",true).single();
  if(error||!settings?.owner_id)return NextResponse.json({error:"Owner account is not provisioned."},{status:409});
  if(!settings.report_enabled)return NextResponse.json({ok:true,skipped:"Weekly report is disabled."});
  const recipient=settings.owner_email;if(!recipient)return NextResponse.json({error:"Set the owner email in app_settings before enabling the report."},{status:409});
  try{const{start,end}=previousWeekRange(),workbook=await buildWeeklyWorkbook(supabase,start,end),bytes=Buffer.from(workbook),resend=new Resend(mailKey);const startLabel=start.toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short"}),endLabel=new Date(end.getTime()-1).toLocaleDateString("en-IN",{timeZone:"Asia/Kolkata",day:"numeric",month:"short",year:"numeric"}),business=String(settings.business_name).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]!));const sent=await resend.emails.send({from,to:recipient,subject:`${business}: weekly kitchen report (${startLabel} – ${endLabel})`,html:`<div style="font-family:Arial,sans-serif;color:#26382c;max-width:560px"><p style="letter-spacing:2px;color:#75816f;font-size:11px">BELLA DEL GELATO INVENTORY</p><h1 style="font-size:23px">Your week, wrapped up.</h1><p>Your weekly kitchen report for <b>${startLabel} – ${endLabel}</b> is attached, with ingredient usage, production, milk base batches, and the restock list.</p><p style="color:#7f887a;font-size:12px">This report was sent only to the owner account.</p></div>`,attachments:[{filename:`bella-gelato-weekly-${start.toISOString().slice(0,10)}.xlsx`,content:bytes.toString("base64"),contentType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}]});if(sent.error)throw new Error(sent.error.message);return NextResponse.json({ok:true})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Report email failed."},{status:502})}
}
