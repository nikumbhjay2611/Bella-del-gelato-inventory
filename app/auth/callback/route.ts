import { NextResponse,type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request:NextRequest){
 const url=request.nextUrl.clone(),code=url.searchParams.get("code"),requested=url.searchParams.get("next");
 const next=requested?.startsWith("/")&&!requested.startsWith("//")?requested:"/";
 if(code){const supabase=await createClient();const{error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,request.url))}
 return NextResponse.redirect(new URL("/login?error=auth_callback",request.url));
}
