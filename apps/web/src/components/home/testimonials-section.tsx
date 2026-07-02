'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', role: 'Data Analyst @ Infosys', city: 'Lucknow', rating: 5, avatar: '👩', text: 'Maine Rs 399 mein Data Science course liya aur 4 mahine mein Infosys mein job mil gayi! Hindi mein explanation itni clear thi ki sab samajh aaya. Best investment of my life.' },
  { name: 'Amit Verma',   role: 'AI Engineer @ Startup', city: 'Kanpur',   rating: 5, avatar: '👨', text: 'YouTube pe free content se zyada achha content Rs 399 mein mila. Certificate bhi mila jo LinkedIn pe dala aur 3 companies ne contact kiya. Seriously recommend karta hoon.' },
  { name: 'Sneha Gupta',  role: 'Cybersecurity Analyst', city: 'Agra',     rating: 5, avatar: '👩', text: 'Cybersecurity course ne meri life change kar di. Ethical hacking seekhi, CEH exam qualify kiya. Instructor bahut clearly explain karta hai. Money well spent!' },
  { name: 'Rohit Singh',  role: 'IoT Developer @ TCS',   city: 'Varanasi', rating: 5, avatar: '👨', text: 'Arduino aur IoT bilkul zero se seekha. Ab office mein smart systems bana raha hoon. Course ke projects directly resume mein gaye. 100% recommend.' },
  { name: 'Kavya Patel',  role: 'Python Developer',       city: 'Jaipur',   rating: 5, avatar: '👩', text: 'Python course bahut structured hai. Pehle din se coding shuru hoti hai — time waste nahi hota. AI Study Buddy ne raat ko bhi doubts clear kiye. Amazing platform!' },
  { name: 'Dev Agarwal',  role: 'ML Engineer @ Wipro',    city: 'Meerut',   rating: 5, avatar: '👨', text: 'Meerut se hoon, coaching centers bahut mehenge the. laximotech.ai ne mere liye door khol diye. Sirf Rs 399 mein woh sab seekha jo Rs 40,000 courses mein milta.' },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Student Stories</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-2">
            Unki <span>Zindagi Badli</span> — Tumhari Bhi Badlegi
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 relative">
              <Quote size={28} className="text-brand-orange/20 absolute top-4 right-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, s) => (
                  <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-5 relative z-10">"{t.text}"</p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-xl flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role} · {t.city}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
