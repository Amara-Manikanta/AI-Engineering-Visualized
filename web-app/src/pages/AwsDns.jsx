import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Globe, BookOpen, FileText, Activity, Map, User, Server, ArrowRight, ArrowLeft, ShieldCheck, CheckSquare, Lightbulb, Star } from 'lucide-react';

export default function AwsDns() {
  const toc = [
    { label: "1. DNS & Route 53 Basics", hash: "basics" },
    { label: "2. Health Checks & Routing", hash: "routing" },
    { label: "3. Domain Resolution Flow", hash: "flow" }
  ];

  const basics = [
    {
      id: 1,
      title: "DNS Basics",
      icon: <Globe className="text-purple-400" size={32} />,
      points: [
        "DNS translates domain names to IP addresses.",
        "Works like the internet phonebook.",
        "Uses a distributed, hierarchical system."
      ],
      color: "border-purple-500/30 bg-[#1a1a1a]"
    },
    {
      id: 2,
      title: "Hosted Zone",
      icon: <BookOpen className="text-green-400" size={32} />,
      points: [
        "A container for DNS records.",
        "Public Hosted Zone (internet facing).",
        "Private Hosted Zone (inside VPC only)."
      ],
      color: "border-green-500/30 bg-[#1a1a1a]"
    }
  ];

  const recordTypes = [
    { type: "A", desc: "Maps domain to IPv4." },
    { type: "AAAA", desc: "Maps domain to IPv6." },
    { type: "CNAME", desc: "Alias of another domain." },
    { type: "MX", desc: "Mail exchange record." },
    { type: "TXT", desc: "Text information." }
  ];

  const routingPolicies = [
    { name: "Simple", desc: "Default, single resource." },
    { name: "Weighted", desc: "Split traffic by weight." },
    { name: "Latency", desc: "Route based on latency." },
    { name: "Failover", desc: "Active-passive setup." },
    { name: "Geolocation", desc: "Route by user location." },
    { name: "Geoproximity", desc: "Route close to users." }
  ];

  return (
    <GuideLayout
      title="Route 53 & DNS"
      intro="Amazon Route 53 is a scalable and highly available Domain Name System (DNS) web service."
      toc={toc}
    >

      {/* 1 */}
      <section id="basics" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          DNS & Route 53 Basics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {basics.map(item => (
            <div key={item.id} className={`border rounded-xl p-6 ${item.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                </div>
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{item.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-[#111] border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-blue-500 opacity-20"><FileText size={64}/></div>
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><FileText /> Record Types</h3>
            <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">3</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recordTypes.map((record, i) => (
              <div key={i} className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg flex flex-col items-center text-center">
                <span className="font-bold text-blue-400 mb-2">{record.type}</span>
                <span className="text-xs text-gray-400">{record.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="routing" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-red-500/20 text-red-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Health Checks & Routing
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2"><Activity /> Health Checks</h3>
              <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">4</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 mb-6">
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> Monitor the health of your resources.</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> Checks via HTTP, HTTPS, TCP, or DNS.</li>
              <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span> Used for failover routing.</li>
            </ul>
            <div className="flex justify-center text-red-400 opacity-50">
               <Activity size={64} />
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
              <h3 className="text-xl font-bold text-green-400 flex items-center gap-2"><Map /> Routing Policies</h3>
              <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">5</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {routingPolicies.map((policy, i) => (
                 <div key={i} className="flex flex-col">
                   <span className="font-bold text-gray-300 text-sm flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {policy.name}
                   </span>
                   <span className="text-xs text-gray-500 ml-3.5">{policy.desc}</span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </section>

      {/* 3 */}
      <section id="flow" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Domain Flow
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto mb-12">
          <div className="flex items-center justify-between mb-8">
             <h3 className="font-bold text-white text-lg">Domain Flow</h3>
             <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">6</span>
          </div>

          <div className="min-w-[800px] flex justify-between items-center relative pb-16">
            
            <div className="flex flex-col items-center gap-2 text-center w-24">
              <User className="text-gray-400" size={32}/>
              <span className="text-xs text-gray-400">User Enters<br/>www.example.com</span>
            </div>

            <ArrowRight className="text-orange-500" />

            <div className="flex flex-col items-center gap-2 text-center w-24">
              <div className="border border-green-500 text-green-400 px-3 py-1 rounded">www.</div>
              <span className="text-xs font-bold text-gray-300">1. Browser<br/>checks cache</span>
            </div>

            <ArrowRight className="text-orange-500" />

            <div className="flex flex-col items-center gap-2 text-center w-24">
              <ShieldCheck className="text-purple-400" size={40}/>
              <span className="text-xs font-bold text-gray-300">2. Query to<br/>Route 53 DNS</span>
            </div>

            <ArrowRight className="text-orange-500" />

            <div className="flex flex-col items-center gap-2 text-center w-24">
              <div className="flex flex-col gap-1 opacity-50">
                <div className="w-8 h-2 bg-blue-400 rounded"></div>
                <div className="w-8 h-2 bg-blue-400 rounded"></div>
                <div className="w-8 h-2 bg-blue-400 rounded"></div>
              </div>
              <span className="text-xs font-bold text-gray-300">3. Route 53<br/>resolves IP</span>
            </div>

            <ArrowRight className="text-orange-500" />

            <div className="flex flex-col items-center gap-2 text-center w-24 relative z-10">
              <Server className="text-red-400" size={32}/>
              <span className="text-xs font-bold text-gray-300">4. Connection<br/>to the server</span>
            </div>

            <ArrowRight className="text-orange-500" />

            <div className="flex flex-col items-center gap-2 text-center w-24 relative z-10">
              <Globe className="text-blue-400" size={32}/>
              <span className="text-xs font-bold text-gray-300">5. Response<br/>to the user</span>
            </div>
            
            {/* Return Path */}
            <div className="absolute bottom-4 left-12 right-12 h-0 border-b-2 border-dashed border-green-500 flex items-center justify-center">
              <span className="bg-[#111] px-4 text-xs text-green-400">Data is returned to the user</span>
            </div>
            <ArrowLeft className="absolute bottom-1 left-8 text-green-500" />

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-green-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span> DNS = Domain Name System</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span> Route 53 = DNS service by AWS</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">•</span> Converts domain names to IP addresses</li>
            </ul>
          </div>
          
          <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> BEST PRACTICE</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Use appropriate routing policy for your use case.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Enable Health Checks for critical applications.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Use Alias Records to route to AWS resources.</span>
              </li>
            </ul>
          </div>
          
        </div>
      </section>

    </GuideLayout>
  );
}
