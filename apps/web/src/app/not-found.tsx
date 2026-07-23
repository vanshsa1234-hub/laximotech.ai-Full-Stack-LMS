import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="text-center text-white">
        <div className="text-8xl font-heading font-bold text-brand-orange mb-4">404</div>
        <h1 className="font-heading font-bold text-3xl mb-3">Page Not Found</h1>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          This page doesn't exist. The link might be broken or the page may have been removed.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/"        className="btn-primary">Go Home</Link>
          <Link href="/courses" className="bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/20 transition-all">Browse Courses</Link>
        </div>
      </div>
    </div>
  );
}
