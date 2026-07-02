'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Clock, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

const TAG_EMOJI: Record<string,string> = { Career:'💼', 'AI/ML':'🤖', 'Data Science':'📊', Robotics:'⚡', 'About Us':'🏢' };

export default function BlogPage() {
  const { data: res, isLoading } = useBlogPosts();
  const posts: any[] = (res as any)?.data ?? res ?? [];

  return (
    <>
      <Navbar/>
      <main className="min-h-screen bg-brand-ice">
        <div className="bg-mesh pt-28 pb-14 text-center">
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">
            Tech <span className="text-brand-orange">Blog</span>
          </motion.h1>
          <p className="text-white/70 text-lg">Career guides, tutorials & updates — Hindi + English</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton h-64 rounded-2xl"/>)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No posts yet. Check back soon!</div>
          ) : (
            <>
              {/* Featured */}
              <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-8 group">
                <Link href={`/blog/${posts[0].slug}`}>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-gray-100">
                    <div className="h-56 bg-gradient-to-br from-brand-blue to-purple-700 flex items-center justify-center">
                      <span className="text-8xl">{TAG_EMOJI[posts[0].tags?.[0]?.name] ?? '📝'}</span>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-3">
                        {posts[0].tags?.[0] && <span className="text-xs font-bold bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">{posts[0].tags[0].name}</span>}
                        <span className="text-gray-400 text-xs">{posts[0].publishedAt ? formatDate(posts[0].publishedAt) : ''}</span>
                      </div>
                      <h2 className="font-heading font-bold text-2xl text-gray-900 mb-3 group-hover:text-brand-orange transition-colors">{posts[0].title}</h2>
                      <p className="text-gray-500 mb-4 leading-relaxed">{posts[0].excerpt}</p>
                      <span className="text-brand-blue font-semibold text-sm flex items-center gap-1 group-hover:text-brand-orange transition-colors">Read more <ArrowRight size={14}/></span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(1).map((post:any,i:number)=>(
                  <motion.div key={post.slug} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.08}} whileHover={{y:-4}} className="group">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all border border-gray-100 h-full flex flex-col">
                        <div className="h-36 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 flex items-center justify-center">
                          <span className="text-4xl">{TAG_EMOJI[post.tags?.[0]?.name] ?? '📝'}</span>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {post.tags?.[0] && <span className="text-xs font-bold bg-brand-orange/10 text-brand-orange px-2.5 py-0.5 rounded-full">{post.tags[0].name}</span>}
                          </div>
                          <h3 className="font-heading font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-brand-orange transition-colors flex-1">{post.title}</h3>
                          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <span className="text-gray-400 text-xs">{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
                            <span className="text-brand-blue text-xs font-semibold group-hover:text-brand-orange transition-colors">Read →</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer/>
    </>
  );
}
