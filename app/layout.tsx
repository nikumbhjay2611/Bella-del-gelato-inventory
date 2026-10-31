import type { Metadata,Viewport } from "next";
import "./globals.css";
import PwaRegister from "./pwa-register";

export const metadata:Metadata={title:{default:"Bella del Gelato Inventory",template:"%s · Bella del Gelato"},description:"A thoughtful workspace for ingredients, recipes, and small batch gelato production.",applicationName:"Bella del Gelato Inventory",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"Bella Gelato",statusBarStyle:"default"}};
export const viewport:Viewport={themeColor:"#f7f7f2",width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<PwaRegister/></body></html>}
