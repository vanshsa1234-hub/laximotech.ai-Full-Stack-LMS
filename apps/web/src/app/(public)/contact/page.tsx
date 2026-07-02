'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false); setSent(true);
    toast.success('Message sent! We\'ll reply within 24 hours.');
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        <div className="bg-mesh pt-28 pb-14 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">Contact Us</motion.h1>
          <p className="text-white/70 text-lg">Koi bhi sawaal ho — hum yahan hain</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-4">
              {[
                { icon: Mail,   title: 'Email',    value: 'hello@laximotech.ai', href: 'mailto:hello@laximotech.ai' },
                { icon: Phone,  title: 'Phone',    value: '+91 99990 00000',     href: 'tel:+919999000000' },
                { icon: MapPin, title: 'Location', value: 'Greater Noida West, UP, India', href: null },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-brand-blue" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                      {item.href ? (
                        <a href={item.href} className="text-brand-blue text-sm hover:text-brand-orange transition-colors">{item.value}</a>
                      ) : (
                        <div className="text-gray-500 text-sm">{item.value}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-5">
                <div className="font-semibold text-brand-blue text-sm mb-1">Response Time</div>
                <div className="text-gray-500 text-sm">We reply within 24 hours — usually much faster!</div>
              </div>
            </div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-card border border-gray-100">
              {sent ? (
                <div className="text-center py-10">
                  <CheckCircle size={48} className="text-brand-green mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-xl text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input required value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} className="input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <input required type="email" value={form.email} onChange={e => setForm(p => ({...p,email:e.target.value}))} className="input" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <select value={form.subject} onChange={e => setForm(p => ({...p,subject:e.target.value}))} className="input cursor-pointer">
                      <option value="">Select a topic</option>
                      <option>Course inquiry</option>
                      <option>Technical support</option>
                      <option>Corporate / B2B</option>
                      <option>Refund request</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({...p,message:e.target.value}))}
                      className="input resize-none" placeholder="Apna sawaal ya feedback likhein..." />
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full btn-primary justify-center py-4 disabled:opacity-60">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Message</>}
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
