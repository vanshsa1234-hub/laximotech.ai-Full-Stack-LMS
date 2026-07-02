import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-gray-900 text-3xl mb-8">{title}</h1>
          <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 prose prose-gray max-w-none">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p className="text-gray-500 text-sm mb-6">Last updated: June 2025</p>
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide (name, email, payment details) and usage data (courses watched, quiz scores, progress) to deliver our learning services.</p>
      <h2>2. How We Use Your Data</h2>
      <p>Your data is used to: personalize your learning experience, issue certificates, process payments, send course updates, and improve our platform.</p>
      <h2>3. Data Sharing</h2>
      <p>We do not sell your personal data. We share data only with: Razorpay (payments), AWS (storage), and Vercel/Railway (hosting) — all under strict data processing agreements.</p>
      <h2>4. Data Security</h2>
      <p>All data is encrypted in transit (HTTPS) and at rest. Passwords are never stored — we use secure OAuth and magic links only.</p>
      <h2>5. Your Rights</h2>
      <p>You can request access to, correction of, or deletion of your data at any time by emailing privacy@laximotech.ai.</p>
      <h2>6. Contact</h2>
      <p>For privacy questions: privacy@laximotech.ai</p>
    </PolicyPage>
  );
}

export function TermsPage() {
  return (
    <PolicyPage title="Terms of Service">
      <p className="text-gray-500 text-sm mb-6">Last updated: June 2025</p>
      <h2>1. Acceptance</h2>
      <p>By using laximotech.ai, you agree to these terms. If you disagree, please do not use our services.</p>
      <h2>2. Course Access</h2>
      <p>Upon purchase, you receive lifetime access to the course content for personal learning only. You may not share, resell, or distribute course content.</p>
      <h2>3. Certificates</h2>
      <p>Certificates are issued upon successful course completion (minimum 80% video watched + passing the final quiz). Certificates are non-transferable.</p>
      <h2>4. Payments</h2>
      <p>All payments are processed securely via Razorpay. Prices are in INR and inclusive of applicable taxes.</p>
      <h2>5. Prohibited Use</h2>
      <p>You may not use our platform for illegal activities, distribute malware, scrape content, or attempt to circumvent security measures.</p>
      <h2>6. Limitation of Liability</h2>
      <p>laximotech.ai provides educational content "as is". We do not guarantee job placement or specific salary outcomes.</p>
      <h2>7. Contact</h2>
      <p>For terms questions: legal@laximotech.ai</p>
    </PolicyPage>
  );
}

export function RefundPage() {
  return (
    <PolicyPage title="Refund Policy">
      <p className="text-gray-500 text-sm mb-6">Last updated: June 2025</p>
      <h2>30-Day Money-Back Guarantee</h2>
      <p>We offer a <strong>full refund within 30 days</strong> of purchase — no questions asked. If you are not satisfied with the course, email us at refunds@laximotech.ai.</p>
      <h2>How to Request a Refund</h2>
      <ol>
        <li>Email refunds@laximotech.ai with your order ID and registered email</li>
        <li>We process refunds within 24 hours</li>
        <li>Funds return to your original payment method within 5–7 business days</li>
      </ol>
      <h2>Conditions</h2>
      <ul>
        <li>Refund must be requested within 30 days of purchase</li>
        <li>Certificate must not have been issued before refund request</li>
        <li>Each course is eligible for one refund only</li>
      </ul>
      <h2>Contact</h2>
      <p>refunds@laximotech.ai · Response within 24 hours</p>
    </PolicyPage>
  );
}
