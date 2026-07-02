'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, IndianRupee, Award, MapPin } from 'lucide-react';
import { useAdminStats } from '@/hooks/use-queries';

const CITIES = [
  {city:'Greater Noida',students:1240,pct:100},{city:'Delhi NCR',students:892,pct:72},
  {city:'Lucknow',students:980,pct:79},{city:'Kanpur',students:756,pct:61},
  {city:'Agra',students:634,pct:51},{city:'Varanasi',students:521,pct:42},
  {city:'Jaipur',students:487,pct:39},{city:'Mumbai',students:345,pct:28},
];

const MONTHLY = [
  {month:'Jan',rev:124},{month:'Feb',rev:189},{month:'Mar',rev:256},
  {month:'Apr',rev:312},{month:'May',rev:398},{month:'Jun',rev:512},
];
const maxRev = Math.max(...MONTHLY.map(m=>m.rev));

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useAdminStats();

  const kpis = [
    {label:'Total Students',   value:isLoading?'...':(stats as any)?.totalStudents?.toLocaleString('en-IN')??'0',  sub:'+12% this month', icon:Users,        color:'text-blue-400',   bg:'bg-blue-500/10'},
    {label:'Total Revenue',    value:isLoading?'...':(`Rs ${(((stats as any)?.totalRevenueRs??0)/100000).toFixed(1)}L`), sub:'+18% this month', icon:IndianRupee, color:'text-green-400',  bg:'bg-green-500/10'},
    {label:'Certificates',     value:isLoading?'...':(stats as any)?.totalCertificates?.toLocaleString('en-IN')??'0',sub:'All time',   icon:Award,        color:'text-orange-400', bg:'bg-orange-500/10'},
    {label:'Enrollments',      value:isLoading?'...':(stats as any)?.totalEnrollments?.toLocaleString('en-IN')??'0', sub:'All time',   icon:TrendingUp,   color:'text-purple-400', bg:'bg-purple-500/10'},
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Platform performance overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((k,i)=>(
          <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
            className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <div className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
              <k.icon size={16} className={k.color}/>
            </div>
            <div className="font-heading font-bold text-white text-2xl mb-0.5">{k.value}</div>
            <div className="text-gray-500 text-xs">{k.label}</div>
            <div className="text-green-400 text-xs mt-1">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-heading font-semibold text-white mb-6">Monthly Revenue (Rs 000s)</h3>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY.map((m,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-gray-500 text-[10px]">{m.rev}K</div>
                <motion.div initial={{height:0}} animate={{height:`${(m.rev/maxRev)*180}px`}}
                  transition={{delay:0.4+i*0.08,duration:0.6}}
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-blue to-blue-400 hover:opacity-80 transition-opacity cursor-pointer"/>
                <div className="text-gray-500 text-[10px]">{m.month}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Students by city */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h3 className="font-heading font-semibold text-white mb-5 flex items-center gap-2">
            <MapPin size={16} className="text-brand-orange"/> Students by City
          </h3>
          <div className="space-y-3">
            {CITIES.map((c,i)=>(
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-xs">{c.city}</span>
                  <span className="text-gray-500 text-xs">{c.students.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${c.pct}%`}}
                    transition={{delay:0.5+i*0.06,duration:0.6}}
                    className="h-full bg-brand-orange rounded-full"/>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        {(stats as any)?.recentOrders && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            className="lg:col-span-2 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="font-heading font-semibold text-white">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Student','Course','Amount','Date'].map(h=>(
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats as any).recentOrders.map((o:any,i:number)=>(
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3 text-white text-sm">{o.user?.name}</td>
                      <td className="px-5 py-3 text-gray-300 text-sm truncate max-w-[180px]">{o.course?.title}</td>
                      <td className="px-5 py-3 text-brand-green text-sm font-semibold">Rs {Math.round(o.amount/100)}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
