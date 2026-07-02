'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ArrowLeft, Clock, Share2, Twitter, Linkedin } from 'lucide-react';
import { useBlogPost } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post, isLoading } = useBlogPost(params.slug);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://laximotech.ai/blog/${params.slug}`;

  if (isLoading) {
    return (
      <>
        <Navbar/>
        <main className="min-h-screen bg-brand-ice pt-24 pb-16">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <div className="skeleton h-10 w-3/4 rounded-xl"/>
            <div className="skeleton h-5 w-full rounded-xl"/>
            <div className="skeleton h-5 w-2/3 rounded-xl"/>
            <div className="skeleton h-64 rounded-2xl"/>
          </div>
        </main>
        <Footer/>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen bg-brand-ice pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="font-heading font-bold text-gray-700 text-xl mb-2">Post not found</h2>
            <Link href="/blog" className="text-brand-blue hover:text-brand-orange">← All Articles</Link>
          </div>
        </div>
        <Footer/>
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <main className="min-h-screen bg-brand-ice pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-orange transition-colors text-sm mb-8">
            <ArrowLeft size={14}/> All Articles
          </Link>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
            <div className="flex items-center gap-3 mb-4">
              {(post as any).tags?.[0] && (
                <span className="text-xs font-bold bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">{(post as any).tags[0].name}</span>
              )}
              {(post as any).publishedAt && (
                <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={10}/> {formatDate((post as any).publishedAt)}</span>
              )}
            </div>

            <h1 className="font-heading font-bold text-gray-900 text-3xl md:text-4xl leading-tight mb-5">{(post as any).title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{(post as any).excerpt}</p>

            {/* Author + Share */}
            <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-xl">
                  {((post as any).author?.name?.[0]) ?? '?'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{(post as any).author?.name}</div>
                  <div className="text-gray-400 text-xs">Author</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent((post as any).title)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                  <Twitter size={14}/>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                  <Linkedin size={14}/>
                </a>
                <button onClick={()=>{navigator.clipboard.writeText(shareUrl);toast.success('Link copied!');}}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                  <Share2 size={14}/>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Article content */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}}
            className="prose prose-lg prose-gray max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-a:text-brand-blue"
            dangerouslySetInnerHTML={{__html:(post as any).content}}/>

          {/* CTA */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            className="mt-12 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-2xl p-8 text-white text-center">
            <div className="text-2xl mb-3">🚀</div>
            <h3 className="font-heading font-bold text-xl mb-2">Tech career shuru karna chahte ho?</h3>
            <p className="text-white/70 text-sm mb-5">25+ courses sirf Rs 399 mein. Certificate, projects, lifetime access — sab included.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-6 py-3 rounded-full hover:bg-brand-orange-light transition-all shadow-orange">
              Browse Courses →
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
