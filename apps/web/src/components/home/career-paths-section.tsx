'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';

const paths = [
  { slug: 'become-ai-engineer', emoji: '🤖', title: 'AI Engineer', desc: 'Python → ML → Deep Learning → Production AI systems', salary: 'Rs 8–35 LPA', steps: 4, color: 'from-purple-500 to-blue-600', lightColor: 'bg-purple-50 border-purple-200' },
  { slug: 'become-data-analyst', emoji: '📊', title: 'Data Analyst', desc: 'SQL → Python → Power BI → Business Intelligence', salary: 'Rs 4–18 LPA', steps: 4, color: 'from-blue-500 to-cyan-500', lightColor: 'bg-blue-50 border-blue-200' },
  { slug: 'become-cybersecurity-expert', emoji: '🔒', title: 'Cybersecurity Expert', desc: 'Networking → Linux → Ethical Hacking → Pentesting', salary: 'Rs 5–25 LPA', steps: 4, color: 'from-red-500 to-orange-500', lightColor: 'bg-red-50 border-red-200' },
  { slug: 'become-iot-developer', emoji: '⚡', title: 'IoT Developer', desc: 'Arduino → Python → Cloud → Smart Systems', salary: 'Rs 4–15 LPA', steps: 3, color: 'from-green-500 to-teal-500', lightColor: 'bg-green-50 border-green-200' },
];

export function CareerPathsSection() {
  return (
    <section className="py-20 bg-brand-ice">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Guided Roadmaps</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-2">
            Choose Your <span>Career Path</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-gray-500 mt-3 max-w-xl mx-auto">
            Confused where to start? Choose a career goal — we'll tell you exactly which courses to take in what order.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paths.map((path, i) => (
            <motion.div key={path.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group">
              <Link href={`/paths/${path.slug}`}>
                <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden h-full border border-gray-100">
                  {/* Gradient top bar */}
                  <div className={`h-2 w-full bg-gradient-to-r ${path.color}`} />

                  <div className="p-6">
                    <div className="text-4xl mb-4">{path.emoji}</div>
                    <h3 className="font-heading font-bold text-gray-900 text-lg mb-2 group-hover:text-brand-orange transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{path.desc}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={14} className="text-brand-green" />
                      <span className="text-brand-green text-sm font-semibold">{path.salary}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{path.steps} courses</span>
                      <span className="text-brand-blue text-xs font-semibold group-hover:text-brand-orange transition-colors flex items-center gap-1">
                        View Path <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
