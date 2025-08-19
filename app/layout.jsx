import "./globals.css";
import { Inter_Tight } from "next/font/google";
const interTight = Inter_Tight({ subsets:["latin"] });
export const metadata={ title:"AI Report Explainer", description:"Xero-inspired AI demo" };
export default function RootLayout({ children }){
  return (<html lang="en"><body className={interTight.className}>
    <div className="w-full bg-white border-b"><div className="container-xero py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-xero-blue flex items-center justify-center text-white font-bold">X</div>
      <div className="text-sm text-gray-600">Prototype</div>
    </div></div>
    <main className="container-xero py-8">{children}</main>
  </body></html>); }