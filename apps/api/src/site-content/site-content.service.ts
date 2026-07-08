import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Sensible fallback copy shown until an admin saves real content for a key.
// Keeps public pages from ever rendering blank while the CMS is unseeded.
const DEFAULTS: Record<string, any> = {
  about: {
    heroTitle: 'About laximotech.ai',
    heroSubtitle: 'India ke har student tak quality tech education pohonchana — sirf Rs 399 mein.',
    missionTitle: 'Quality Education Should Not Be A Luxury',
    missionText: 'India mein lakhs of talented students hain jo AI, Data Science, Coding seekhna chahte hain — lekin expensive coaching centers unki reach se bahar hain. laximotech.ai ne Rs 399 mein premium courses launch kiye — iss belief ke saath ki talent city ya background nahi dekhta.',
    storyTitle: 'Our Story',
    storyParagraphs: [
      'laximotech.ai was built on a simple belief: talent is equally distributed, opportunity is not.',
      'Our goal is simple — IIT-quality content, at a fraction of coaching center prices.',
    ],
    quoteText: 'Talent is equally distributed. Opportunity is not. We\'re changing that.',
    quoteAuthor: '— laximotech.ai Founder',
    ctaTitle: 'Join Our Mission',
    ctaSubtitle: 'Help us reach every student in India.',
  },
  contact: {
    email: 'hello@laximotech.ai',
    phone: '+91 99990 00000',
    location: 'Greater Noida West, UP, India',
    responseTime: 'We reply within 24 hours — usually much faster!',
  },
  privacy: {
    lastUpdated: 'June 2025',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect information you provide (name, email, payment details) and usage data (courses watched, quiz scores, progress) to deliver our learning services.' },
      { heading: '2. How We Use Your Data', body: 'Your data is used to: personalize your learning experience, issue certificates, process payments, send course updates, and improve our platform.' },
      { heading: '3. Data Sharing', body: 'We do not sell your personal data. We share data only with: Razorpay (payments), AWS (storage), and Vercel/Railway (hosting) — all under strict data processing agreements.' },
      { heading: '4. Data Security', body: 'All data is encrypted in transit (HTTPS) and at rest. Passwords are never stored — we use secure OAuth and magic links only.' },
      { heading: '5. Your Rights', body: 'You can request access to, correction of, or deletion of your data at any time by emailing privacy@laximotech.ai.' },
      { heading: '6. Contact', body: 'For privacy questions: privacy@laximotech.ai' },
    ],
  },
  terms: {
    lastUpdated: 'June 2025',
    sections: [
      { heading: '1. Acceptance', body: 'By using laximotech.ai, you agree to these terms. If you disagree, please do not use our services.' },
      { heading: '2. Course Access', body: 'Upon purchase, you receive lifetime access to the course content for personal learning only. You may not share, resell, or distribute course content.' },
      { heading: '3. Certificates', body: 'Certificates are issued upon successful course completion (minimum 80% video watched + passing the final quiz). Certificates are non-transferable.' },
      { heading: '4. Payments', body: 'All payments are processed securely via Razorpay. Prices are in INR and inclusive of applicable taxes.' },
      { heading: '5. Prohibited Use', body: 'You may not use our platform for illegal activities, distribute malware, scrape content, or attempt to circumvent security measures.' },
      { heading: '6. Limitation of Liability', body: 'laximotech.ai provides educational content "as is". We do not guarantee job placement or specific salary outcomes.' },
      { heading: '7. Contact', body: 'For terms questions: legal@laximotech.ai' },
    ],
  },
  'career-quiz': {
    heroTitle: 'Find Your Perfect Career Path',
    heroSubtitle: '5 sawaal, 2 minute — apni career journey discover karo',
    questions: [
      { id: 'interest', question: 'Aapki sabse zyada interest kisme hai?', emoji: '❤️', options: [
        { label: 'Computers & Technology', value: 'tech' },
        { label: 'Data & Numbers', value: 'data' },
        { label: 'Building & Making Things', value: 'build' },
        { label: 'Security & Protecting', value: 'security' },
      ]},
      { id: 'goal', question: 'Aapka main career goal kya hai?', emoji: '🎯', options: [
        { label: 'High-paying tech job', value: 'job' },
        { label: 'Start my own startup', value: 'startup' },
        { label: 'Freelancing from home', value: 'freelance' },
        { label: 'Government / PSU sector', value: 'govt' },
      ]},
      { id: 'background', question: 'Aapka current background kya hai?', emoji: '🎓', options: [
        { label: 'Complete beginner', value: 'beginner' },
        { label: 'Some programming basics', value: 'some' },
        { label: 'Engineering student', value: 'engineering' },
        { label: 'Working professional', value: 'professional' },
      ]},
      { id: 'time', question: 'Kitna time de sakte ho per day?', emoji: '⏰', options: [
        { label: '30 min – 1 hour', value: '1h' },
        { label: '1–2 hours', value: '2h' },
        { label: '2–4 hours', value: '4h' },
        { label: '4+ hours (full)', value: '4h+' },
      ]},
      { id: 'salary', question: 'Aapka expected salary range (per year)?', emoji: '💰', options: [
        { label: 'Rs 3–6 LPA (entry level)', value: 'entry' },
        { label: 'Rs 6–12 LPA', value: 'mid' },
        { label: 'Rs 12–25 LPA', value: 'senior' },
        { label: 'Rs 25 LPA+ (ambitious!)', value: 'top' },
      ]},
    ],
  },
  faq: {
    items: [
      { q: 'Kya course lifetime ke liye accessible hai?', a: 'Haan! Ek baar buy karo, lifetime access milega. Course kabhi expire nahi hoga, chahe hum future mein updates bhi karte rahein.' },
      { q: 'Certificate kitna valid hai?', a: 'Certificate uniquely verifiable hai — har ek ka apna ID hota hai. laximotech.ai/verify pe koi bhi verify kar sakta hai. LinkedIn pe share karo, job applications mein use karo.' },
      { q: 'Kya Hindi medium students ke liye suitable hai?', a: 'Bilkul! Ye platform specifically Hindi medium students ke liye banaya gaya hai. Explanation Hindi mein, technical terms English mein — exact wahi approach jo IIT-JEE coaching mein hoti hai.' },
      { q: 'Mobile pe kaam karta hai?', a: 'Haan, PWA hai — mobile pe bilkul smooth chalega. Android phone pe install bhi kar sakte ho. Offline viewing bhi future mein aane waali hai.' },
      { q: 'Ek se zyada course khareed sakte hain?', a: 'Bilkul! Sab alag-alag Rs 399 ke hain. Career path bundle mein khareedne par aur discount milta hai.' },
    ],
  },
  'certificate-template': {
    // Empty backgroundImageUrl means "use the built-in default design" —
    // nothing breaks for admins who never touch this page.
    backgroundImageUrl: '',
    fields: {
      holderName:    { x: 50, y: 42, fontSize: 34, color: '#1a1a2e', fontWeight: '700', fontFamily: 'Georgia, serif', textAlign: 'center' },
      courseTitle:   { x: 50, y: 55, fontSize: 18, color: '#333333', fontWeight: '600', fontFamily: 'Arial, sans-serif', textAlign: 'center' },
      finalScore:    { x: 50, y: 65, fontSize: 13, color: '#666666', fontWeight: '400', fontFamily: 'Arial, sans-serif', textAlign: 'center', show: true },
      issuedAt:      { x: 85, y: 92, fontSize: 11, color: '#666666', fontWeight: '400', fontFamily: 'Arial, sans-serif', textAlign: 'right' },
      certificateNo: { x: 15, y: 92, fontSize: 11, color: '#666666', fontWeight: '400', fontFamily: 'Arial, sans-serif', textAlign: 'left' },
    },
  },
};

const VALID_KEYS = Object.keys(DEFAULTS);

@Injectable()
export class SiteContentService {
  constructor(private prisma: PrismaService) {}

  async get(key: string) {
    const row = await this.prisma.siteContent.findUnique({ where: { key } });
    return { key, data: row?.data ?? DEFAULTS[key] ?? {}, isCustomized: !!row };
  }

  // ── Admin ──────────────────────────────────────────────────
  async getAll() {
    const rows = await this.prisma.siteContent.findMany();
    const byKey = new Map(rows.map(r => [r.key, r]));
    return VALID_KEYS.map(key => ({
      key,
      data: byKey.get(key)?.data ?? DEFAULTS[key],
      isCustomized: byKey.has(key),
      updatedAt: byKey.get(key)?.updatedAt ?? null,
    }));
  }

  async upsert(key: string, data: any) {
    return this.prisma.siteContent.upsert({
      where:  { key },
      create: { key, data },
      update: { data },
    });
  }

  async resetToDefault(key: string) {
    await this.prisma.siteContent.deleteMany({ where: { key } });
    return { key, data: DEFAULTS[key] ?? {}, isCustomized: false };
  }
}
