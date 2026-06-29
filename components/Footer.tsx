'use client';
import { School,  ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const FOOTER_LINKS = [
  { title: 'School', links: ['About Us', 'Academics', 'Admissions', 'Campus Life'] },
  { title: 'Portal', links: ['Student Login', 'Parent Login', 'Teacher Login', 'Staff'] },
  { title: 'Support', links: ['Help Center', 'Fee Payment', 'Contact', 'Privacy'] },
];

export const Footer = () => {
  return (
    <footer className="bg-primary pt-24 pb-12 px-8 lg:px-24 text-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-12 mb-20">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary">
                <School size={24} />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter">SchoolHub</span>
            </div>
            <p className="text-bg/60 text-base leading-relaxed mb-8 max-w-xs">
              Empowering education through technology. Managing students, teachers &amp; operations seamlessly.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-3 gap-8">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h4 className="text-accent text-[11px] font-black uppercase tracking-[0.3em] mb-6">{group.title}</h4>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link href="/upcoming-feature" className="text-bg/50 hover:text-bg text-sm transition-colors flex items-center group">
                        {link} <ArrowUpRight size={12} className="ml-1 opacity-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="col-span-12 lg:col-span-3">
            <h4 className="text-accent text-[11px] font-black uppercase tracking-[0.3em] mb-6">Stay Updated</h4>
            <form className="relative">
              <input type="email" placeholder="Parent / Student Email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 focus:outline-none focus:border-accent text-sm text-bg" />
              <button className="absolute right-2 top-2 bottom-2 bg-accent text-primary px-4 rounded-xl font-bold text-xs uppercase">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-bg/30 text-center md:text-left">
          © 2026 SchoolHub. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};