'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 text-white text-center">
          <div>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="font-heading font-bold text-2xl mb-3">Something went wrong</h2>
            <p className="text-gray-400 mb-6">An unexpected error occurred. Please try again.</p>
            <button onClick={() => reset()}
              className="bg-brand-orange text-white font-bold px-6 py-3 rounded-full hover:bg-brand-orange-light transition-all">
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
