'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Eye, Edit, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const POSTS = [
  { id:'b1', title:'AI Jobs in India 2025',           slug:'ai-jobs-india-2025',        isPublished:true,  date:'15 Jun 2025', readMin:8  },
  { id:'b2', title:'Python vs R for Data Science',    slug:'python-vs-r-data-science',  isPublished:true,  date:'12 Jun 2025', readMin:6  },
  { id:'b3', title:'Rs 399 Course — Worth It?',       slug:'rs-399-course-worth-it',    isPublished:true,  date:'8 Jun 2025',  readMin:5  },
  { id:'b4', title:'Machine Learning Roadmap 2025',   slug:'machine-learning-roadmap',  isPublished:true,  date:'5 Jun 2025',  readMin:10 },
  { id:'b5', title:'Cybersecurity Career in India',   slug:'cybersecurity-career',      isPublished:false, date:'Draft',       readMin:7  },
  { id:'b6', title:'10 IoT Projects for Beginners',   slug:'iot-projects-beginners',    isPublished:false, date:'Draft',       readMin:9  },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState(POSTS);

  const togglePublish = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, isPublished: !p.isPublished } : p));
    toast.success('Post status updated!');
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.filter(p => p.isPublished).length} published · {posts.filter(p => !p.isPublished).length} drafts</p>
        </div>
        <button onClick={() => toast('TipTap rich text editor coming in Phase 3!')}
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-brand-orange-light transition-colors">
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {['Title', 'Status', 'Date', 'Read Time', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => (
              <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FileText size={14} className="text-gray-500 flex-shrink-0" />
                    <span className="text-white text-sm font-medium">{post.title}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => togglePublish(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                      post.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'
                    }`}>
                    {post.isPublished ? <Globe size={11} /> : <Lock size={11} />}
                    {post.isPublished ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-5 py-4 text-gray-400 text-sm">{post.date}</td>
                <td className="px-5 py-4 text-gray-400 text-sm">{post.readMin} min</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {post.isPublished && (
                      <button onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
                        <Eye size={14} />
                      </button>
                    )}
                    <button onClick={() => toast('Full TipTap editor in Phase 3!')}
                      className="p-1.5 text-gray-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all">
                      <Edit size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
