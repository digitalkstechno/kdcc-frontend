"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { Copy, Check, QrCode, ExternalLink, Loader2, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function QRPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [copied, setCopied] = useState(false);
  const [cardUrl, setCardUrl] = useState("");

  useEffect(() => {
    if (user?._id) {
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
      setCardUrl(`${baseUrl}/card/${user._id}`);
    }
  }, [user]);

  const handleCopy = () => {
    if (cardUrl) {
      navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      toast.success("Card link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `my_qr_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  const qrImageUrl = cardUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(cardUrl)}&bgcolor=FFFFFF&color=000000&margin=20`
    : "";

  return (
    <DashboardLayout type="user">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Profile QR</h1>
          <p className="text-sm text-gray-400 font-medium">Share your digital card with the world.</p>
        </header>

        <div className="bg-white border border-gray-100 shadow-xl shadow-blue-50/50 rounded-[40px] p-8 md:p-12 flex flex-col items-center gap-10">
          {/* QR Code Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[50px] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
            <div className="relative bg-white p-6 rounded-[45px] border border-gray-100 shadow-2xl flex items-center justify-center overflow-hidden">
               {cardUrl ? (
                 <img 
                   src={qrImageUrl} 
                   alt="QR Code" 
                   className="w-48 h-48 md:w-64 md:h-64 object-contain"
                 />
               ) : (
                 <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-3xl">
                   <Loader2 className="animate-spin text-blue-600" size={30} />
                 </div>
               )}
               {/* Decorative corners */}
               <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-600 rounded-tl-[40px] m-4" />
               <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-600 rounded-tr-[40px] m-4" />
               <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-600 rounded-bl-[40px] m-4" />
               <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-600 rounded-br-[40px] m-4" />
            </div>
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-3 rounded-2xl shadow-lg border-4 border-white">
               <QrCode size={20} />
            </div>
          </motion.div>

          {/* Link Display & Copy */}
          <div className="w-full space-y-4">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">Card Web Link</label>
                <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-3xl overflow-hidden shadow-inner group">
                <div className="flex-1 px-4 text-sm font-bold text-gray-600 truncate">
                    {cardUrl || "Generating link..."}
                </div>
                <button 
                    onClick={handleCopy}
                    className="h-10 px-6 rounded-2xl bg-white border border-gray-200 text-gray-900 font-black text-xs hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
                >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={handleDownloadQR}
                className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3.5 rounded-3xl font-black text-xs hover:bg-blue-100 transition-all border border-blue-100"
               >
                 <Download size={16} />
                 Download JPG
               </button>
               <a 
                href={cardUrl} 
                target="_blank"
                className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3.5 rounded-3xl font-black text-xs hover:bg-gray-100 transition-all border border-gray-200"
               >
                 <ExternalLink size={16} />
                 View Card
               </a>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex gap-4">
           <div className="h-10 w-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <Share2 size={20} />
           </div>
           <div className="space-y-1">
              <p className="text-sm font-black text-amber-900 leading-none mt-1">Ready to share?</p>
              <p className="text-xs text-amber-700/80 font-medium leading-relaxed">Anyone who scans this QR code will instantly see your digital business card on their phone.</p>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
