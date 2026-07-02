'use client';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { MapPin, Users, BookOpen, Award, Heart, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        {/* Hero */}
        <div className="bg-mesh pt-28 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-4">About laximotech.ai</h1>
            <p className="text-white/75 text-xl max-w-2xl mx-auto">
              India ke har student tak quality tech education pohonchana — sirf Rs 399 mein.
            </p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Mission */}
          <div className="text-center">
            <span className="section-label flex items-center justify-center gap-2 mb-3"><Heart size={14} /> Our Mission</span>
            <h2 className="section-title mb-6">Quality Education Should Not Be <span>A Luxury</span></h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              India mein lakhs of talented students hain jo AI, Data Science, Coding seekhna chahte hain — lekin expensive coaching centers unki reach se bahar hain.
              laximotech.ai ne Rs 399 mein premium courses launch kiye — iss belief ke saath ki talent city ya background nahi dekhta.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users,    value: '10,000+', label: 'Students' },
              { icon: BookOpen, value: '25+',     label: 'Courses' },
              { icon: Award,    value: '5,000+',  label: 'Certificates' },
              { icon: MapPin,   value: '200+',    label: 'Cities' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-card border border-gray-100">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <s.icon size={22} className="text-brand-blue" />
                </div>
                <div className="font-heading font-bold text-3xl text-brand-blue">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label mb-3 flex items-center gap-2"><Target size={14} /> Our Story</span>
              <h2 className="section-title mb-6">Greater Noida West Se <span>Shuru Hua Safar</span></h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>2024 mein, ek IIT graduate ne dekha ki uske chote bhai ko AI seekhna tha lekin ₹40,000 ke courses afford nahi ho rahe the. Woh ek brilliant student tha — sirf resources nahi the.</p>
                <p>Usi din laximotech.ai ka idea aaya. Goal simple tha: IIT-quality content, coaching center prices se 99% sasta.</p>
                <p>Aaj, Greater Noida West se shuru hokar, hum India ke 200+ cities mein 10,000+ students ko padha rahe hain. Aur yeh toh sirf shuruaat hai.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-blue to-purple-700 rounded-3xl p-8 text-white">
              <div className="text-4xl mb-4">💡</div>
              <blockquote className="font-heading font-semibold text-xl leading-relaxed mb-4">
                "Talent is equally distributed. Opportunity is not. We're changing that."
              </blockquote>
              <div className="text-white/60 text-sm">— laximotech.ai Founder</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white rounded-3xl p-10 shadow-card border border-gray-100">
            <h3 className="font-heading font-bold text-2xl text-gray-900 mb-3">Join Our Mission</h3>
            <p className="text-gray-500 mb-6">Help us reach every student in India.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/courses" className="btn-primary">Browse Courses</Link>
              <Link href="/contact" className="btn-outline">Partner With Us</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
