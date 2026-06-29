'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight} from 'lucide-react';

export const Hero = () => {
  return (
    <header className="relative min-h-[90vh] flex items-center overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop" 
          alt="Modern school campus"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/80 to-transparent" />
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-32 flex items-center justify-center overflow-hidden pointer-events-none z-10">
        <span
          className="text-[12rem] font-black text-bg/5 uppercase select-none whitespace-nowrap tracking-tighter"
          style={{ writingMode: 'vertical-rl' }}
        >
          SCHOOLHUB
        </span>
      </div>

      <div className="container mx-auto px-8 lg:px-24 relative z-20 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-accent mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-accent" />
              EDUCATION • MANAGEMENT • GROWTH
            </p>

            <h1 className="text-7xl xl:text-[9rem] font-black tracking-tighter text-bg mb-6 leading-[0.85] uppercase">
              SchoolHub
            </h1>

            <p className="text-xs font-bold uppercase tracking-[0.4em] text-cta mb-6">
              Complete School Management System
            </p>

            <p className="text-lg text-bg/80 leading-relaxed mb-12 max-w-lg font-light">
              Streamline student management, attendance, fees, academics, and parent communication — 
              all in one powerful, intuitive platform.
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <Link
               href="/features/auth/login"
                className="group flex items-center gap-4 bg-cta text-white text-[12px] font-black uppercase tracking-widest px-10 py-5 rounded-full hover:scale-105 transition-all shadow-2xl shadow-cta/20"
              >
                Go to Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/features/students"
                className="text-bg/80 hover:text-bg border border-white/30 px-8 py-5 rounded-full text-sm font-medium transition-all hover:border-white/60"
              >
                Explore Students →
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 hidden lg:flex justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="bg-bg/10 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 max-w-sm relative"
          >
            <div className="absolute -top-6 -right-6 bg-accent text-primary w-24 h-24 rounded-full flex items-center justify-center font-black text-center leading-tight text-[10px] uppercase tracking-tighter rotate-12 shadow-xl">
              100%<br/>DIGITAL
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/80 mb-2">
              LIVE STAT
            </p>
            <h3 className="text-3xl font-black text-bg uppercase tracking-tight mb-4">
              1,248 Students
            </h3>
            <p className="text-sm text-bg/60 leading-relaxed">
              Currently managed across 42 classes with 98.7% average attendance this month.
            </p>
          </motion.div>
        </div>
      </div>
    </header>
  );
};