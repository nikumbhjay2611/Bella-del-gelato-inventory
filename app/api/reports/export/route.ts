import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildWeeklyWorkbook,currentWeekRange } from "@/lib/reports/workbook";

export const dynamic="force-dynamic";
export async function GET(){
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const db=await createClient();const {data:{user}}=await db.auth.getUser();if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
  const {data:owner}=await db.from("app_settings").select("id").eq("id",true).maybeSingle();if(!owner)return NextResponse.json({error:"Owner access required."},{status:403});
  try{const {start,end}=currentWeekRange(),buffer=await buildWeeklyWorkbook(db,start,end),body=Buffer.from(buffer);return new NextResponse(body,{headers:{"Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","Content-Disposition":`attachment; filename="bella-gelato-weekly-${new Date().toISOString().slice(0,10)}.xlsx"`,"Cache-Control":"no-store"}})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Report generation failed."},{status:500})}
}
