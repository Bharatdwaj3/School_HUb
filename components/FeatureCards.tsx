'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star, Award } from 'lucide-react';

const features = [
  {
    name: 'Smart Attendance',
    desc: 'Real-time attendance tracking with QR codes and biometric options.',
    rating: 4.9,
    img: 'https://images.unsplash.com/photo-1588075592444-5c3f4c4c0c0d?q=80&w=800',
  },
  {
    name: 'Gradebook & Reports',
    desc: 'Comprehensive academic performance tracking and instant report cards.',
    rating: 4.8,
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
  },
  {
    name: 'Parent Communication',
    desc: 'Seamless updates, events, and direct messaging with teachers.',
    rating: 4.7,
    img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800',
  },
];

export const FeatureCards = () => (
  <section className="bg-bg py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cta mb-4">POWERFUL FEATURES</p>
        <h2 className="text-5xl font-black text-primary tracking-tighter mb-4">Built for Modern Schools</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div key={f.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="group">
            <div className="relative aspect-4/3 rounded-4xl overflow-hidden mb-6 shadow-xl shadow-primary/5">
              <Image src={f.img} alt={f.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 bg-bg/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-accent text-accent" />
                <span className="text-[10px] font-black text-primary">{f.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-primary" size={18} />
              <h3 className="text-xl font-black text-primary uppercase">{f.name}</h3>
            </div>
            <p className="text-sm text-primary/70 leading-relaxed">{f.desc}</p>
           </motion.div>
        ))}
      </div>
    </div>
  </section>
);