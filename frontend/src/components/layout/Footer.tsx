import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About University', href: '/#about' },
    { name: 'Academic Departments', href: '/#departments' },
    { name: 'Degree Programs', href: '/#programs' },
    { name: 'Distinguished Faculty', href: '/#faculty' },
    { name: 'Campus Announcements', href: '/#announcements' },
    { name: 'Upcoming Events', href: '/#events' },
    { name: 'Student Portal', href: '/login' },
    { name: 'Apply for Admission', href: '/register' },
    { name: 'Contact & Support', href: '/contact' },
  ];

  const degreePrograms = [
    { name: 'BS Computer Science', href: '/#programs' },
    { name: 'BS Software Engineering', href: '/#programs' },
    { name: 'BS Information Technology', href: '/#programs' },
    { name: 'BS Artificial Intelligence', href: '/#programs' },
    { name: 'BS Data Science', href: '/#programs' },
    { name: 'BS Cyber Security', href: '/#programs' },
  ];

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'YouTube', href: 'https://youtube.com', icon: Youtube },
  ];

  return (
    <footer className="bg-[#050811] text-slate-300 border-t border-slate-800/80">
      {/* Top Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: University Info & Mission (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white leading-tight">
                  Apex<span className="text-brand-400">University</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Science &amp; Technology
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              A premier institution dedicated to academic rigor, state-of-the-art technological
              research, and fostering the next generation of visionary software engineers, data
              scientists, and technological leaders.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-3">
                Follow Our Campus
              </span>
              <div className="flex items-center gap-3">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-brand-600 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-brand-400 transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Programs (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Programs Offered
            </h3>
            <ul className="space-y-2.5 text-sm">
              {degreePrograms.map((prog) => (
                <li key={prog.name}>
                  <Link
                    href={prog.href}
                    className="text-slate-400 hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{prog.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Information (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact Information
            </h3>

            <Link href="/contact" className="flex items-start gap-3 text-sm text-slate-400 hover:text-slate-200 transition-colors">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
              <span>University Avenue, Sector H-12, Institutional Area, Islamabad, Pakistan</span>
            </Link>

            <a href="tel:+9251111273986" className="flex items-center gap-3 text-sm text-slate-400 hover:text-brand-400 transition-colors">
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <span>+92 (51) 111-273-986</span>
            </a>

            <a href="mailto:admissions@apex.edu.pk" className="flex items-center gap-3 text-sm text-slate-400 hover:text-brand-400 transition-colors">
              <Mail className="w-4 h-4 text-brand-400 shrink-0" />
              <span>admissions@apex.edu.pk</span>
            </a>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Mon - Fri: 08:30 AM - 04:30 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer / Copyright */}
      <div className="border-t border-slate-800/80 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {currentYear} Apex University of Science &amp; Technology. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link href="/contact" className="hover:text-slate-200 transition-colors">
              Helpdesk &amp; Privacy
            </Link>
            <Link href="/login" className="hover:text-slate-200 transition-colors">
              Portal Access
            </Link>
            <a
              href="http://localhost:5000/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-400 transition-colors inline-flex items-center gap-1"
            >
              <span>API Health Status</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
