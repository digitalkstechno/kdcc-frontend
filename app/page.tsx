'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, User, ShieldCheck, Zap, Globe, Smartphone, BarChart3 } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="h-screen w-full bg-gray-50 text-gray-900 selection:bg-blue-500/30 overflow-hidden font-sans relative flex flex-col">
      
      {/* Background Decor & Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 py-5 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003B46] rounded-xl shadow-lg shadow-[#003B46]/20 flex items-center justify-center font-black text-xl text-white tracking-tighter">
            MK
          </div>
          <span className="text-xl font-black tracking-widest uppercase text-gray-900 drop-shadow-sm">Digital Builder</span>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <Link 
            href="/user/login"
            className="bg-[#003B46] text-white px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#002f38] transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <User size={16} /> Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center h-full">
          
          {/* Text Content */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="space-y-6 lg:space-y-8 flex flex-col justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm self-start">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Next-Gen Digital Presence</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl xl:text-[5rem] font-black leading-[1.1] tracking-tight text-gray-900 drop-shadow-sm">
              Build your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 drop-shadow-md">
                professional
              </span><br />
              digital card.
            </h1>
            
            <p className="text-lg xl:text-xl text-gray-600 leading-relaxed max-w-xl font-medium">
              Create stunning mobile-first builder websites to showcase your portfolio, appointments, brochures, and dynamic content. Instantly shareable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 lg:pt-4">
              <Link 
                href="/user/login"
                className="bg-gradient-to-r from-blue-600 to-emerald-500 p-[2px] rounded-full group transition-all hover:scale-105 shadow-xl shadow-blue-500/20 self-start"
              >
                <div className="bg-white rounded-full px-8 py-4 flex items-center justify-center gap-3 transition-colors">
                  <span className="font-black text-sm uppercase tracking-widest text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-emerald-500 transition-all">Get Started</span>
                  <ArrowRight size={18} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>

            {/* Stats/Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 lg:pt-10 border-t border-gray-200/60 max-w-2xl">
              {[
                { value: "100%", label: "Mobile Optimized" },
                { value: "0", label: "Coding Required" },
                { value: "Instant", label: "Global Sharing" }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-2xl lg:text-3xl font-black text-gray-900">{stat.value}</p>
                  <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:flex h-full max-h-[80vh] justify-center lg:justify-end items-center"
          >
             {/* Decorative Phone Frame Mockup - aspect ratio constrained to fit perfectly without scrolling */}
             <div className="relative w-full max-w-[340px] aspect-[1/2] max-h-full bg-white rounded-[3rem] border-[8px] border-gray-100 shadow-2xl overflow-hidden flex flex-col shrink-0 group hover:scale-[1.02] transition-transform duration-500">
                {/* Phone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                   <div className="w-32 h-full bg-gray-100 rounded-b-2xl" />
                </div>
                
                {/* Inner UI Simulation */}
                <div className="flex-1 bg-gray-50 border border-gray-100 m-2 rounded-[2.5rem] overflow-hidden relative shadow-inner">
                  <div className="h-[35%] bg-gradient-to-tr from-blue-600 to-[#003B46] relative p-6 flex flex-col items-center pt-8">
                     <div className="flex items-center justify-between w-full text-white/80">
                        <div className="w-5 h-5 rounded-full bg-white/20" />
                        <div className="w-12 h-1.5 rounded-full bg-white/20" />
                     </div>
                     <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-xl mt-4"></div>
                  </div>
                  <div className="px-6 py-8 space-y-4">
                     <div className="h-3 w-3/4 mx-auto bg-gray-200 rounded-full" />
                     <div className="h-2 w-1/2 mx-auto bg-gray-100 rounded-full" />
                     <div className="grid grid-cols-2 gap-3 pt-6">
                       {[1,2,3,4].map(j => <div key={j} className="h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center"><div className="w-5 h-5 rounded bg-blue-50" /></div>)}
                     </div>
                  </div>
                </div>
             </div>

             {/* Floating elements */}
             <motion.div 
               animate={{ y: [-10, 10, -10] }} 
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute top-1/4 xl:right-[300px] lg:right-[260px] bg-white border border-gray-100 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-30"
             >
               <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Globe size={20} /></div>
               <div>
                 <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Presence</p>
                 <p className="text-sm font-bold text-gray-800">Online 24/7</p>
               </div>
             </motion.div>

             <motion.div 
               animate={{ y: [10, -10, 10] }} 
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-1/4 xl:right-[340px] lg:right-[280px] bg-white border border-gray-100 p-4 rounded-2xl shadow-xl flex items-center gap-3 z-30"
             >
               <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><BarChart3 size={20} /></div>
               <div>
                 <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Analytics</p>
                 <p className="text-sm font-bold text-gray-800">Real-time Views</p>
               </div>
             </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 w-full py-5 text-center text-gray-400 text-[10px] font-bold tracking-widest uppercase border-t border-gray-200/50 bg-white/50 backdrop-blur-sm shrink-0">
        © {new Date().getFullYear()} MK Group Digital Builder. All rights reserved.
      </footer>
    </div>
  );
}
