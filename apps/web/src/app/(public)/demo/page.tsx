'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Calendar, Clock, Video, MapPin, Check, Loader2, CheckCircle, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const SLOTS = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];
const TOPICS = ['AI & Machine Learning', 'Data Science', 'Python Programming', 'Cybersecurity', 'Robotics & IoT', 'Career Guidance'];

export default function DemoPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', topic: '', slot: '', mode: 'online' });
  const [loading, setLoading] = useState(false);
  const [booked,  setBooked]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slot) { toast.error('Please select a time slot'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setBooked(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        {/* Hero */}
        <div className="bg-mesh pt-28 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 glass text-white/90 text-sm font-semibold px-4 py-2 rounded-full border border-white/20 mb-6">
                <Video size={14} className="text-brand-orange" /> 100% Free — No Credit Card
              </span>
              <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-4">
                Book Your <span className="text-brand-orange">Free Demo Class</span>
              </h1>
              <p className="text-white/75 text-lg max-w-xl mx-auto">
                Ek free class lo, instructor se seedha baat karo, apne sawalon ke jawab pao — phir decide karo.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left — benefits */}
            <div className="lg:col-span-2 space-y-4">
              {/* What you get */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
                <h3 className="font-heading font-semibold text-gray-900 mb-4">Demo Class Mein Milega:</h3>
                <div className="space-y-3">
                  {[
                    '45-minute live session with an expert instructor',
                    'Course curriculum walkthrough',
                    'Live Q&A — poochho jo bhi sawaal ho',
                    'Career path guidance for your goals',
                    'Exclusive Rs 100 discount coupon',
                    'Study materials for the demo topic',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <Check size={15} className="text-brand-green mt-0.5 flex-shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social proof */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">4.9/5</span>
                </div>
                <p className="text-gray-500 text-sm italic">"Demo class ke baad main convince ho gaya. Instructor ne itna clear explain kiya — turant course le liya!"</p>
                <div className="text-gray-400 text-xs mt-2">— Arjun Sharma, Greater Noida</div>
              </div>

              <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-brand-blue" />
                  <span className="font-semibold text-brand-blue text-sm">500+ Demo Classes Done</span>
                </div>
                <p className="text-gray-500 text-xs">Every week we do free demo sessions for students across India.</p>
              </div>
            </div>

            {/* Right — booking form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-card border border-gray-100">

              {booked ? (
                <div className="text-center py-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle size={64} className="text-brand-green mx-auto mb-5" />
                  </motion.div>
                  <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Demo Booked! 🎉</h2>
                  <p className="text-gray-500 mb-2">
                    <strong>{form.name}</strong>, aapki demo class book ho gayi hai.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 inline-block text-left mt-4 mb-6">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Topic:</strong> {form.topic}</div>
                      <div><strong>Time Slot:</strong> {form.slot} (Tomorrow)</div>
                      <div><strong>Mode:</strong> {form.mode === 'online' ? '🎥 Online (Zoom link will be emailed)' : '🏫 Offline (Greater Noida West)'}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">Confirmation email sent to <strong>{form.email}</strong></p>
                  <div className="mt-4 bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3 text-sm text-brand-orange font-semibold">
                    🎁 Your Rs 100 discount coupon: <span className="font-mono">DEMO100</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-heading font-bold text-xl text-gray-900 mb-1">Book Free Demo</h2>
                  <p className="text-gray-500 text-sm mb-5">Fill in your details and we'll confirm within 1 hour</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number *</label>
                      <input required value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input" placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input" placeholder="you@example.com" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Which topic interests you? *</label>
                    <select required value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))} className="input cursor-pointer">
                      <option value="">Select a topic</option>
                      {TOPICS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Mode selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[['online', '🎥 Online (Zoom)', 'From anywhere in India'],
                        ['offline', '🏫 Offline', 'Greater Noida West only']].map(([val, label, sub]) => (
                        <button type="button" key={val} onClick={() => setForm(p => ({...p, mode: val}))}
                          className={`p-3 rounded-xl border text-left transition-all ${form.mode === val ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className="font-semibold text-sm text-gray-900">{label}</div>
                          <div className="text-xs text-gray-400">{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slot */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock size={13} className="inline mr-1" /> Preferred Time Slot (Tomorrow) *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {SLOTS.map(slot => (
                        <button type="button" key={slot} onClick={() => setForm(p => ({...p, slot}))}
                          className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                            form.slot === slot
                              ? 'bg-brand-orange text-white border-brand-orange shadow-orange'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-orange hover:text-brand-orange'
                          }`}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full btn-primary justify-center py-4 text-base disabled:opacity-60">
                    {loading
                      ? <><Loader2 size={18} className="animate-spin" /> Booking...</>
                      : <><Calendar size={18} /> Book Free Demo Class</>}
                  </motion.button>
                  <p className="text-center text-xs text-gray-400">100% free · No payment required · Cancel anytime</p>
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
