import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Building2, Users, BarChart2, Award, CheckCircle, ArrowRight, Phone } from 'lucide-react';

const FEATURES = [
  { icon: Users,    title: 'Bulk Seat Licences',   desc: 'Buy 10+ seats at a time. Assign courses to your team members easily from a single admin dashboard.' },
  { icon: BarChart2,title: 'HR Analytics',         desc: 'Track employee progress, completion rates, quiz scores and time spent learning — all in one place.' },
  { icon: Award,    title: 'Branded Certificates', desc: 'Issue certificates with your company name alongside laximotech.ai. Perfect for employee recognition.' },
  { icon: Building2,title: 'Custom Subdomain',     desc: 'Get your own yourcompany.laximotech.ai portal with your logo and brand colors for a professional look.' },
];

const PLANS = [
  { name: 'Starter',    seats: '10–25',   pricePerSeat: 299, features: ['All 25 courses', 'Progress tracking', 'Certificates', 'Email support'] },
  { name: 'Business',   seats: '25–100',  pricePerSeat: 249, features: ['Everything in Starter', 'HR Analytics dashboard', 'Branded certificates', 'Dedicated support'], popular: true },
  { name: 'Enterprise', seats: '100+',    pricePerSeat: 199, features: ['Everything in Business', 'Custom subdomain', 'Bulk invoice', 'On-site training option', 'SLA guarantee'] },
];

export default function CorporatePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        <div className="bg-mesh pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 glass text-white/90 text-sm px-4 py-2 rounded-full border border-white/20 mb-6">
            <Building2 size={14} className="text-brand-orange" /> B2B / Corporate Plans
          </div>
          <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-4">
            <span className="text-brand-orange">Upskill Your Team</span>
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto mb-8">
            AI, Data Science, and Tech skills across your whole company — with bulk pricing starting at just Rs 199/seat.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="bg-brand-orange text-white font-bold px-8 py-4 rounded-full shadow-orange hover:bg-brand-orange-light transition-all flex items-center gap-2">
              Get a Quote <ArrowRight size={16} />
            </Link>
            <Link href="/demo" className="glass text-white font-semibold px-8 py-4 rounded-full border border-white/30 hover:bg-white/15 transition-all">
              Book Demo
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 flex gap-5">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon size={22} className="text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-gray-900 text-3xl mb-2">Corporate Pricing</h2>
            <p className="text-gray-500">Volume discounts starting at 10 seats</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {PLANS.map((plan, i) => (
              <div key={i} className={`bg-white rounded-2xl p-6 border-2 shadow-card relative ${plan.popular ? 'border-brand-orange shadow-orange' : 'border-gray-100'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading font-bold text-gray-900 text-xl mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.seats} seats</p>
                <div className="mb-6">
                  <span className="font-heading font-bold text-4xl text-brand-blue">Rs {plan.pricePerSeat}</span>
                  <span className="text-gray-400 text-sm">/seat/course</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={14} className="text-brand-green flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className={`block w-full text-center font-semibold py-3 rounded-xl transition-all text-sm ${
                    plan.popular ? 'bg-brand-orange text-white hover:bg-brand-orange-light shadow-orange' : 'bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white'
                  }`}>
                  Contact Sales
                </Link>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="bg-brand-blue rounded-2xl p-10 text-white text-center">
            <Phone size={32} className="mx-auto mb-4 text-brand-orange" />
            <h3 className="font-heading font-bold text-2xl mb-2">Need a Custom Enterprise Solution?</h3>
            <p className="text-white/70 mb-6">100+ seats, custom integrations, on-site training — all negotiable.</p>
            <Link href="mailto:corporate@laximotech.ai"
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-8 py-4 rounded-full shadow-orange hover:bg-brand-orange-light transition-all">
              corporate@laximotech.ai <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
