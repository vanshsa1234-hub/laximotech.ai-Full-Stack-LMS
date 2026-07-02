'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Database, Code2, Cpu, Shield, MapPin, Phone, Mail, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react';

const footerLinks = {
  Courses: [
    { label: 'AI & Machine Learning', href: '/courses?cat=ai' },
    { label: 'Data Science',          href: '/courses?cat=data-science' },
    { label: 'Python Programming',    href: '/courses?cat=programming' },
    { label: 'Robotics & IoT',        href: '/courses?cat=robotics' },
    { label: 'Cybersecurity',         href: '/courses?cat=cybersecurity' },
    { label: 'All Courses — Rs 399',  href: '/courses' },
  ],
  'Career Paths': [
    { label: 'Become an AI Engineer',       href: '/paths/become-ai-engineer' },
    { label: 'Become a Data Analyst',       href: '/paths/become-data-analyst' },
    { label: 'Become a Cybersecurity Pro',  href: '/paths/become-cybersecurity-expert' },
    { label: 'Career Quiz',                 href: '/career-quiz' },
  ],
  Company: [
    { label: 'About Us',        href: '/about' },
    { label: 'Blog',            href: '/blog' },
    { label: 'Demo Class',      href: '/demo' },
    { label: 'For Corporates',  href: '/corporate' },
    { label: 'Verify Certificate', href: '/verify' },
    { label: 'Contact Us',      href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Service',  href: '/terms' },
    { label: 'Refund Policy',     href: '/refund' },
  ],
};

const socials = [
  { icon: Youtube,   href: 'https://youtube.com/@laximotech',          label: 'YouTube' },
  { icon: Instagram, href: 'https://instagram.com/laximotech',         label: 'Instagram' },
  { icon: Linkedin,  href: 'https://linkedin.com/company/laximotech',  label: 'LinkedIn' },
  { icon: Twitter,   href: 'https://twitter.com/laximotech',           label: 'Twitter' },
];

const courseIcons = [Brain, Database, Code2, Cpu, Shield];

export function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      {/* ── CTA Strip ────────────────────────────────────── */}
      <div className="bg-brand-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-white">
                Start Learning Today — Any Course at{' '}
                <span className="text-brand-orange animate-pulse">Rs 399</span>
              </h3>
              <p className="text-blue-200 text-sm mt-1">
                Certificate included · Hindi + English · Lifetime access
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link href="/courses" className="btn-primary">
                Browse Courses
              </Link>
              <Link href="/demo" className="btn-outline border-white text-white hover:bg-white hover:text-brand-blue">
                Free Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-blue border border-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="font-heading font-bold text-xl text-white">
                laximotech<span className="text-brand-orange">.ai</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              India's most affordable AI & tech learning platform. Quality education in Hindi at just Rs 399 per course — certificates, projects, job-ready skills.
            </p>

            {/* Contact */}
            <div className="space-y-2 text-sm text-gray-400 mb-6">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-brand-orange flex-shrink-0" />
                <span>Greater Noida West, Uttar Pradesh, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-brand-orange flex-shrink-0" />
                <a href="tel:+919999000000" className="hover:text-white transition-colors">+91 99990 00000</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-brand-orange flex-shrink-0" />
                <a href="mailto:hello@laximotech.ai" className="hover:text-white transition-colors">hello@laximotech.ai</a>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-brand-orange flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links cols */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="lg:col-span-1">
              <h4 className="font-heading font-semibold text-white text-sm uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-brand-orange transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} laximotech.ai — All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <span>Made with ❤️ in</span>
            <span className="text-brand-orange font-semibold">Greater Noida West, India 🇮🇳</span>
          </div>
          <div className="flex gap-4">
            {courseIcons.map((Icon, i) => (
              <Icon key={i} size={16} className="text-gray-600" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
