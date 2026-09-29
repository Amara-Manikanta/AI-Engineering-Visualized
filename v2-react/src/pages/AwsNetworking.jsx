import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Network, Cloud, Lock, Globe, List, ArrowRight, ArrowLeftRight, Share2, Search, CheckSquare, Lightbulb, Star, Cpu, Database } from 'lucide-react';

export default function AwsNetworking() {
  const toc = [
    { label: "1. Core Networking Components", hash: "core-components" },
    { label: "2. Typical VPC Architecture", hash: "architecture" },
    { label: "3. Best Practices & Remember", hash: "best-practices" }
  ];

  const components = [
    {
      id: 1,
      title: "VPC (Virtual Private Cloud)",
      icon: <Cloud className="text-blue-400" size={32} />,
      points: [
        "Your isolated network in AWS.",
        "Control IP ranges, subnets, route tables, gateways.",
        "Resources in a VPC can communicate privately."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Internet Gateway (IGW)",
      icon: <Globe className="text-orange-400" size={32} />,
      points: [
        "Connects your VPC to the internet.",
        "Enables internet access for resources in public subnets."
      ],
      color: "border-orange-500/30"
    },
    {
      id: 3,
      title: "Route Table",
      icon: <List className="text-purple-400" size={32} />,
      points: [
        "Contains rules (routes) to direct traffic.",
        "Associated with a subnet.",
        "Decides where network traffic goes."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 4,
      title: "NAT Gateway",
      icon: <Share2 className="text-green-400" size={32} />,
      points: [
        "Allows resources in private subnets to access the internet.",
        "Blocks inbound traffic from internet.",
        "One NAT Gateway per AZ for high availability."
      ],
      color: "border-green-500/30"
    }
  ];

  return (
    <GuideLayout
      title="Networking Basics (VPC)"
      intro="AWS Networking helps your resources communicate securely with the internet and each other."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-components" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Components
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {components.map(comp => (
            <div key={comp.id} className={`border rounded-xl p-6 bg-[#111] ${comp.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {comp.icon}
                  <h3 className="font-bold text-white text-lg">{comp.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{comp.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {comp.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-4 right-4 text-gray-700 opacity-20"><ArrowLeftRight size={64}/></div>
             <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Globe className="text-blue-400"/> Public vs Private Subnet</h3>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="border border-green-500/30 bg-green-900/10 p-4 rounded-lg">
                 <Globe className="text-green-400 mx-auto mb-2" size={24}/>
                 <h4 className="font-bold text-green-400 text-center text-sm mb-3">Public Subnet</h4>
                 <ul className="space-y-2 text-xs text-gray-300">
                   <li className="flex items-start gap-1"><span className="text-green-500 mt-0.5">•</span> Has route to Internet Gateway</li>
                   <li className="flex items-start gap-1"><span className="text-green-500 mt-0.5">•</span> Resources are publicly accessible</li>
                 </ul>
               </div>
               
               <div className="border border-red-500/30 bg-red-900/10 p-4 rounded-lg">
                 <Lock className="text-red-400 mx-auto mb-2" size={24}/>
                 <h4 className="font-bold text-red-400 text-center text-sm mb-3">Private Subnet</h4>
                 <ul className="space-y-2 text-xs text-gray-300">
                   <li className="flex items-start gap-1"><span className="text-red-500 mt-0.5">•</span> No direct route to Internet</li>
                   <li className="flex items-start gap-1"><span className="text-red-500 mt-0.5">•</span> More secure and isolated</li>
                 </ul>
               </div>
             </div>
          </div>
          
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center">
             <div className="absolute top-4 right-4 text-gray-700 opacity-20"><Search size={64}/></div>
             <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2"><Network className="text-pink-400"/> CIDR Basics</h3>
             <ul className="space-y-3 text-sm text-gray-300">
               <li className="flex items-start gap-2">
                 <span className="text-pink-500 font-bold mt-0.5">•</span> 
                 <span>CIDR defines IP address range in a network.</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-pink-500 font-bold mt-0.5">•</span> 
                 <span>Format: <code>A.B.C.D/n</code> (e.g., <code>192.168.0.0/16</code>)</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-pink-500 font-bold mt-0.5">•</span> 
                 <span>Example: <code>10.0.0.0/16</code> (65,536 IPs)</span>
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-pink-500 font-bold mt-0.5">•</span> 
                 <span><code>/24</code> = 256 IPs, <code>/16</code> = 65,536 IPs</span>
               </li>
             </ul>
          </div>

        </div>
      </section>

      {/* 2 */}
      <section id="architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Typical VPC Architecture
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto relative">
          
          <div className="min-w-[800px] flex flex-col items-center">
            
            {/* Internet & IGW */}
            <div className="flex flex-col items-center mb-6 text-center">
              <Globe className="text-blue-400 mb-2" size={32} />
              <span className="font-bold text-gray-300 text-sm">Internet</span>
              <ArrowRight className="text-gray-500 my-2 rotate-90" />
              <div className="flex items-center gap-2 text-orange-400">
                <Cloud size={24} />
                <span className="font-bold text-sm">Internet Gateway</span>
              </div>
            </div>

            {/* VPC Wrapper */}
            <div className="w-full border-2 border-blue-500/50 border-dashed rounded-xl p-8 relative">
              <div className="absolute -top-3 left-6 bg-[#111] px-2 flex items-center gap-2">
                <Lock className="text-blue-400" size={16}/>
                <span className="font-bold text-blue-400 text-sm">VPC 10.0.0.0/16</span>
              </div>

              <div className="flex justify-between gap-8 mt-4">
                
                {/* AZ A */}
                <div className="flex-1 border border-gray-700 border-dashed rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-gray-400 text-xs">Availability Zone A</div>
                  
                  {/* Public Subnet A */}
                  <div className="border border-green-500/50 bg-green-900/10 rounded-xl p-4 text-center mb-6 relative">
                    <span className="block text-green-400 font-bold text-sm mb-1">Public Subnet A</span>
                    <span className="block text-green-500/50 text-xs mb-3">10.0.1.0/24</span>
                    <Cpu className="text-orange-400 mx-auto" size={32} />
                    {/* Arrow to IGW indicator */}
                    <svg className="absolute -top-12 left-1/2 w-4 h-12 text-green-500" viewBox="0 0 10 40">
                       <path d="M5,40 L5,5" stroke="currentColor" strokeWidth="2" strokeDasharray="4" fill="none"/>
                       <polygon points="1,8 5,0 9,8" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  {/* Private Subnet A */}
                  <div className="border border-blue-500/50 bg-blue-900/10 rounded-xl p-4 text-center relative">
                    <div className="absolute top-2 left-2"><Lock className="text-blue-400" size={16}/></div>
                    <span className="block text-blue-400 font-bold text-sm mb-1">Private Subnet A</span>
                    <span className="block text-blue-500/50 text-xs mb-3">10.0.2.0/24</span>
                    <Database className="text-emerald-400 mx-auto" size={32} />
                  </div>
                </div>

                {/* AZ B */}
                <div className="flex-1 border border-gray-700 border-dashed rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-gray-400 text-xs">Availability Zone B</div>
                  
                  {/* Public Subnet B */}
                  <div className="border border-green-500/50 bg-green-900/10 rounded-xl p-4 text-center mb-6 relative">
                    <span className="block text-green-400 font-bold text-sm mb-1">Public Subnet B</span>
                    <span className="block text-green-500/50 text-xs mb-3">10.0.3.0/24</span>
                    <Cpu className="text-orange-400 mx-auto" size={32} />
                    {/* Arrow to IGW indicator */}
                    <svg className="absolute -top-12 right-1/2 w-4 h-12 text-green-500" viewBox="0 0 10 40">
                       <path d="M5,40 L5,5" stroke="currentColor" strokeWidth="2" strokeDasharray="4" fill="none"/>
                       <polygon points="1,8 5,0 9,8" fill="currentColor"/>
                    </svg>
                  </div>
                  
                  {/* Private Subnet B */}
                  <div className="border border-blue-500/50 bg-blue-900/10 rounded-xl p-4 text-center relative">
                    <div className="absolute top-2 right-2"><Lock className="text-blue-400" size={16}/></div>
                    <span className="block text-blue-400 font-bold text-sm mb-1">Private Subnet B</span>
                    <span className="block text-blue-500/50 text-xs mb-3">10.0.4.0/24</span>
                    <Database className="text-emerald-400 mx-auto" size={32} />
                  </div>
                </div>

              </div>
              
              {/* NAT Gateway & Route Tables Section at bottom of VPC */}
              <div className="mt-8 flex justify-between items-center px-4 relative">
                 {/* Connection from Private A to NAT */}
                 <div className="absolute top-0 left-[20%] w-[30%] h-12 border-l-2 border-b-2 border-purple-500/50 border-dashed rounded-bl-xl"></div>
                 {/* Connection from Private B to NAT */}
                 <div className="absolute top-0 right-[20%] w-[30%] h-12 border-r-2 border-b-2 border-purple-500/50 border-dashed rounded-br-xl"></div>
                 
                 <div className="flex flex-col items-center flex-1">
                   <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700 mt-12">
                     <span className="text-xs text-gray-300">Route Table<br/>(Public Subnets)</span>
                   </div>
                 </div>
                 
                 <div className="flex flex-col items-center flex-1 mt-6 z-10">
                    <div className="flex items-center gap-2 bg-[#1a1a1a] border border-purple-500/30 p-2 rounded-lg text-purple-400">
                      <Share2 size={20} />
                      <span className="text-xs font-bold">NAT Gateway</span>
                    </div>
                    <ArrowRight className="text-gray-500 my-1 rotate-90" />
                    <span className="text-xs text-gray-500 border border-gray-600 rounded px-2">Internet</span>
                 </div>

                 <div className="flex flex-col items-center flex-1">
                   <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700 mt-12">
                     <span className="text-xs text-gray-300">Route Table<br/>(Private Subnets)</span>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="best-practices" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-blue-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span> 
                <span><strong className="text-green-400">Public Subnet</strong> → Internet access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span> 
                <span><strong className="text-red-400">Private Subnet</strong> → No direct Internet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold mt-0.5">•</span> 
                <span><strong className="text-purple-400">NAT Gateway</strong> → Outbound Internet for Private Subnet</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> BEST PRACTICE</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Use Private Subnets for databases and backend services.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Place NAT Gateway in each AZ for high availability.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Use Route Tables wisely to control traffic flow.</span>
              </li>
            </ul>
          </div>
          
        </div>
      </section>

    </GuideLayout>
  );
}
