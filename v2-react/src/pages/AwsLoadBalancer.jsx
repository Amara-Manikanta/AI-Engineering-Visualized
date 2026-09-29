import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Scale, Server, Activity, ArrowRight, ArrowRightLeft, Users, Cloud, Network, ShieldCheck, Settings, CheckSquare, Lightbulb, Star } from 'lucide-react';

export default function AwsLoadBalancer() {
  const toc = [
    { label: "1. Load Balancer Types", hash: "lb-types" },
    { label: "2. Auto Scaling", hash: "auto-scaling" },
    { label: "3. High Availability Architecture", hash: "architecture" },
    { label: "4. ALB vs NLB Comparison", hash: "comparison" }
  ];

  const albVsNlb = [
    { feature: "Layer", alb: "Layer 7 (HTTP/HTTPS)", nlb: "Layer 4 (TCP/UDP)" },
    { feature: "Use Case", alb: "Web apps, APIs, Microservices", nlb: "High performance apps, Gaming, IoT" },
    { feature: "Routing", alb: "Path, Host, Query, Headers", nlb: "IP, Port" },
    { feature: "Performance", alb: "Good", nlb: "Ultra High" },
    { feature: "Static IP", alb: "No", nlb: "Yes" },
    { feature: "SSL Termination", alb: "Yes", nlb: "No (Pass-through)" }
  ];

  return (
    <GuideLayout
      title="Load Balancer & Auto Scaling"
      intro="Distribute traffic, handle load & scale your applications automatically for high availability."
      toc={toc}
    >

      {/* 1 */}
      <section id="lb-types" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Load Balancers
        </h2>
        
        <div className="bg-[#111] border border-indigo-500/30 rounded-xl p-6 mb-8 flex items-start gap-4">
          <div className="bg-indigo-900/20 p-3 rounded-lg text-indigo-400 shrink-0 border border-indigo-500/30">
            <Scale size={32} />
          </div>
          <div>
            <h3 className="font-bold text-indigo-400 text-lg mb-2">Why Load Balancer?</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><span className="text-indigo-500">•</span> Distribute incoming traffic across multiple instances.</li>
              <li className="flex items-center gap-2"><span className="text-indigo-500">•</span> Prevent overload on a single server.</li>
              <li className="flex items-center gap-2"><span className="text-indigo-500">•</span> Improve availability and fault tolerance.</li>
              <li className="flex items-center gap-2"><span className="text-indigo-500">•</span> Perform health checks.</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-blue-500/30 rounded-xl p-6 bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Network className="text-blue-400" size={32} />
                <h3 className="font-bold text-white text-lg">ALB (Application Load Balancer)</h3>
              </div>
              <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">2</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Operates at Layer 7 (HTTP/HTTPS).</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Routes based on URL / Host / Path / Headers.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Ideal for web applications and microservices.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span> Supports SSL termination.</li>
            </ul>
          </div>

          <div className="border border-purple-500/30 rounded-xl p-6 bg-[#1a1a1a]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="text-purple-400" size={32} />
                <h3 className="font-bold text-white text-lg">NLB (Network Load Balancer)</h3>
              </div>
              <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">3</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span> Operates at Layer 4 (TCP/UDP).</li>
              <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span> Handles millions of requests per second.</li>
              <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span> Ultra low latency.</li>
              <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span> Ideal for high performance applications.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="auto-scaling" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Auto Scaling & Policies
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
              <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2"><Server className="text-emerald-400"/> Auto Scaling Group (ASG)</h3>
              <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">4</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Automatically adjusts the number of instances.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Maintains application availability.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Replace unhealthy instances automatically.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Works with Load Balancers.</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg">Scaling Policies</h3>
              <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">5</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-green-500/30 bg-green-900/10 p-4 rounded-lg flex flex-col items-center text-center">
                <span className="text-xs text-green-400 font-bold mb-2">Target Tracking (Recommended)</span>
                <Activity className="text-green-500 mb-2" size={24}/>
                <ul className="text-[0.625rem] text-gray-400 space-y-1">
                  <li>Maintain specific metric (e.g., CPU = 50%).</li>
                  <li>Automatically adjusts capacity.</li>
                </ul>
              </div>
              
              <div className="border border-blue-500/30 bg-blue-900/10 p-4 rounded-lg flex flex-col items-center text-center">
                <span className="text-xs text-blue-400 font-bold mb-2">Step Scaling</span>
                <Settings className="text-blue-500 mb-2" size={24}/>
                <ul className="text-[0.625rem] text-gray-400 space-y-1">
                  <li>Scale based on CloudWatch alarms.</li>
                  <li>Define steps for scale out or in.</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 */}
      <section id="architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          High Availability Architecture
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[800px] flex items-center justify-center gap-8 relative pb-20">
            
            {/* Users */}
            <div className="flex flex-col items-center gap-2">
              <Users className="text-gray-400" size={32}/>
              <span className="text-sm font-bold text-gray-300">Users</span>
            </div>

            <ArrowRight className="text-gray-600" />

            {/* Load Balancer */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="border border-indigo-500 bg-indigo-900/20 p-4 rounded-xl">
                <Scale className="text-indigo-400" size={32}/>
              </div>
              <span className="text-sm font-bold text-indigo-400">Load Balancer</span>
              <span className="text-[0.625rem] text-indigo-300">(ALB / NLB)</span>
            </div>

            <ArrowRight className="text-gray-600" />

            {/* Auto Scaling Group */}
            <div className="border-2 border-emerald-500/50 border-dashed rounded-xl p-6 relative flex gap-6 min-w-[300px]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-sm font-bold text-emerald-400">Auto Scaling Group</div>
              
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs text-gray-400 mb-2 border-b border-gray-700 pb-1">Availability Zone A</span>
                <div className="space-y-2">
                  <div className="bg-[#1a1a1a] border border-orange-500/30 p-2 rounded text-orange-400 flex items-center gap-2"><Server size={16}/> Instance</div>
                  <div className="bg-[#1a1a1a] border border-orange-500/30 p-2 rounded text-orange-400 flex items-center gap-2"><Server size={16}/> Instance</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs text-gray-400 mb-2 border-b border-gray-700 pb-1">Availability Zone B</span>
                <div className="space-y-2">
                  <div className="bg-[#1a1a1a] border border-orange-500/30 p-2 rounded text-orange-400 flex items-center gap-2"><Server size={16}/> Instance</div>
                  <div className="bg-[#1a1a1a] border border-orange-500/30 p-2 rounded text-orange-400 flex items-center gap-2"><Server size={16}/> Instance</div>
                </div>
              </div>
            </div>

            {/* Health Checks & Alarms */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-400 text-xs">
               <ArrowRightLeft size={16}/> Health Checks
            </div>

            <div className="absolute bottom-0 left-[60%] -translate-x-1/2 w-[300px] flex justify-between items-end border-t border-dashed border-gray-700 pt-4">
               <div className="flex flex-col items-center text-center">
                 <Cloud className="text-blue-400 mb-1" size={24}/>
                 <span className="text-xs font-bold text-blue-400">CloudWatch</span>
                 <span className="text-[0.625rem] text-gray-500">(Monitoring)</span>
               </div>
               
               <div className="flex-1 border-t border-dashed border-red-500 mx-4 relative top-[-15px]"></div>
               
               <div className="flex flex-col items-center text-center">
                 <ShieldCheck className="text-red-400 mb-1" size={24}/>
                 <span className="text-xs font-bold text-red-400">Alarms</span>
                 <span className="text-[0.625rem] text-gray-500">(Triggers Scaling)</span>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="comparison" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">ALB vs NLB</h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Feature</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-blue-400 font-bold text-center">ALB (Application)</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-purple-400 font-bold text-center">NLB (Network)</th>
                </tr>
              </thead>
              <tbody>
                {albVsNlb.map((row, i) => (
                  <tr key={i} className="border-b border-[#222]">
                    <td className="py-3 px-4 font-bold text-gray-300 bg-[#1a1a1a]/50 text-sm">{row.feature}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm text-center border-l border-[#222]">{row.alb}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm text-center border-l border-[#222]">{row.nlb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-indigo-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold mt-0.5">•</span> <strong>ALB</strong> = Smart routing for applications.</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold mt-0.5">•</span> <strong>NLB</strong> = Speed & performance at network level.</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500 font-bold mt-0.5">•</span> <strong>ASG</strong> = Scale out/in automatically.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> BEST PRACTICE</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> 
                <span>Use ALB for most web applications.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> 
                <span>Use NLB for high throughput & low latency workloads.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> 
                <span>Always enable Health Checks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> 
                <span>Spread instances across multiple AZs.</span>
              </li>
            </ul>
          </div>
          
        </div>
      </section>

    </GuideLayout>
  );
}
