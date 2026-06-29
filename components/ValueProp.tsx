// components/ValueProp.tsx'use client';
import { GraduationCap, Users, Award } from 'lucide-react';

const pillars = [
  {
    icon: <GraduationCap size={22} className="text-primary" />,
    title: 'Academic Excellence',
    desc: 'Every student receives personalized attention and high-quality education tailored to their potential.',
  },
  {
    icon: <Users size={22} className="text-primary" />,
    title: 'Strong Community',
    desc: 'A supportive ecosystem connecting students, teachers, parents, and staff for holistic growth.',
  },
  {
    icon: <Award size={22} className="text-primary" />,
    title: 'Innovation & Values',
    desc: 'Modern tools combined with strong moral values to prepare students for tomorrow.',
  },
];

export const CoreValues = () => (
  <section className="bg-bg py-20 px-6">
    <div className="max-w-5xl mx-auto text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cta mb-3">OUR FOUNDATION</p>
      <h2 className="text-5xl font-black text-primary tracking-tight mb-4">Our Core Values</h2>
      <div className="w-12 h-0.5 mx-auto mb-6 bg-linear-to-r from-accent to-transparent" />

      <blockquote className="text-cta italic text-xl max-w-2xl mx-auto mb-12">
        “Education is the most powerful weapon which you can use to change the world.”
      </blockquote>

      <p className="max-w-xl mx-auto text-text-green text-lg leading-relaxed mb-16">
        We believe in nurturing confident, compassionate, and capable individuals. 
        SchoolHub empowers schools with technology while keeping human connection at the heart of education.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {pillars.map((p, i) => (
          <div
            key={i}
            className="bg-bg-alt border border-border rounded-3xl p-8 text-left hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {p.icon}
            </div>
            <h3 className="font-bold text-primary text-xl mb-3">{p.title}</h3>
            <p className="text-text-muted leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);