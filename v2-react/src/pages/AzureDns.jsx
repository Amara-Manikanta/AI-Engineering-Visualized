import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Globe, Cloud, LayoutTemplate, Link, ArrowRight, User, Network, ShieldCheck, CheckSquare, Lightbulb, Star, Search, Activity, Box } from 'lucide-react';

export default function AzureDns() {
  const toc = [
    { label: "1. Core DNS Concepts", hash: "core-dns" },
    { label: "2. Record Types & Features", hash: "records-features" },
    { label: "3. End-to-End Traffic Flow", hash: "traffic-flow" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const coreConcepts = [
    {
      id: 1,
      title: "DNS (Domain Name System)",
      icon: <Globe className="text-blue-400" size={32} />,
      points: [
        "Translates domain names to IP addresses.",
        "Essential for all internet communication.",
        "Uses a hierarchical and distributed system."
      ],
      color: "border-blue-500/30 bg-[#1a1a1a]"
    },
    {
      id: 2,
      title: "Public DNS Zone",
      icon: <Cloud className="text-cyan-400" size={32} />,
      points: [
        "Resolves names for public internet.",
        "Hosted in Azure DNS service.",
        "Accessible from anywhere on internet.",
        "Example: example.com"
      ],
      color: "border-cyan-500/30 bg-[#1a1a1a]"
    },
    {
      id: 3,
      title: "Private DNS Zone",
      icon: <Network className="text-emerald-400" size={32} />,
      points: [
        "Resolves names within virtual networks.",
        "Not accessible over the internet.",
        "Linked to one or more VNets.",
        "Example: contoso.local"
      ],
      color: "border-emerald-500/30 bg-[#1a1a1a]"
    }
  ];

  const features = [
    {
      id: 5,
      title: "Alias Record",
      icon: <Link className="text-purple-400" size={32} />,
      points: [
        "Maps a DNS name to Azure resource.",
        "Automatically updates with IP changes.",
        "Supports zone apex (root domain)."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 6,
      title: "Private Link DNS",
      icon: <ShieldCheck className="text-indigo-400" size={32} />,
      points: [
        "Resolves Private Endpoint names.",
        "Azure manages Private DNS integration.",
        "Ensures private and secure connectivity."
      ],
      color: "border-indigo-500/30"
    },
    {
      id: 7,
      title: "Azure DNS Resolver",
      icon: <ArrowRight className="text-orange-400" size={32} />,
      points: [
        "Provides DNS resolution between on-prem and Azure.",
        "Uses Inbound & Outbound Endpoints.",
        "Supports hybrid cloud environments."
      ],
      color: "border-orange-500/30"
    },
    {
      id: 8,
      title: "Health Check",
      icon: <Activity className="text-pink-400" size={32} />,
      points: [
        "Monitors the health of endpoints.",
        "Uses HTTP, HTTPS or TCP checks.",
        "Helps in traffic routing and failover."
      ],
      color: "border-pink-500/30"
    }
  ];

  const recordTypes = [
    { type: "A", desc: "Maps domain to IPv4 address" },
    { type: "AAAA", desc: "Maps domain to IPv6 address" },
    { type: "CNAME", desc: "Maps domain to another domain" },
    { type: "MX", desc: "Mail exchange record" },
    { type: "TXT", desc: "Text information" },
    { type: "NS", desc: "Name server record" },
    { type: "SRV", desc: "Service location record" }
  ];

  return (
    <GuideLayout
      title="Azure DNS"
      intro="Azure DNS is a scalable, reliable and cost-effective DNS hosting service that provides name resolution using Microsoft's global network."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-dns" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core DNS Zones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreConcepts.map(concept => (
            <div key={concept.id} className={`border rounded-xl p-6 ${concept.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {concept.icon}
                  <h3 className="font-bold text-white text-lg">{concept.title}</h3>
                </div>
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{concept.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {concept.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2 */}
      <section id="records-features" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Record Types & Advanced Features
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1 bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white flex items-center gap-2"><LayoutTemplate className="text-gray-400" size={20} /> Record Types</h3>
              <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">4</span>
            </div>
            <div className="space-y-2">
              {recordTypes.map((rec, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#1a1a1a] p-2 rounded border border-gray-800">
                  <span className="text-blue-400 font-mono font-bold text-xs w-10 text-center">{rec.type}</span>
                  <span className="text-gray-300 text-xs">{rec.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(feature => (
              <div key={feature.id} className={`border rounded-xl p-5 bg-[#111] ${feature.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {feature.icon}
                    <h3 className="font-bold text-white">{feature.title}</h3>
                  </div>
                  <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{feature.id}</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-400">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-gray-600 mt-0.5">-</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3 */}
      <section id="traffic-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          End-to-End Traffic Flow
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[900px] flex items-center justify-between gap-2">
            
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                <User className="text-blue-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">User<br/><span className="text-gray-500 font-normal">www.example.com</span></span>
            </div>
            
            <ArrowRight className="text-gray-600 shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-gray-800 p-4 rounded-full border border-gray-700">
                <Globe className="text-gray-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">Browser<br/><span className="text-gray-500 font-normal">sends request</span></span>
            </div>

            <ArrowRight className="text-gray-600 shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-purple-500/20 p-4 rounded-full border border-purple-500/30">
                <Search className="text-purple-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">DNS Lookup<br/><span className="text-gray-500 font-normal">to DNS</span></span>
            </div>

            <ArrowRight className="text-gray-600 shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-cyan-500/20 p-4 rounded-full border border-cyan-500/30">
                <Cloud className="text-cyan-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">Azure DNS<br/><span className="text-gray-500 font-normal">resolves domain</span></span>
            </div>

            <ArrowRight className="text-gray-600 shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
                <span className="text-emerald-400 font-mono text-sm">20.40.60.10</span>
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">IP Address<br/><span className="text-gray-500 font-normal">Returns IP</span></span>
            </div>

            <ArrowRight className="text-gray-600 shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/30">
                <Box className="text-indigo-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">Azure Service<br/><span className="text-gray-500 font-normal">Request reaches service</span></span>
            </div>

            <ArrowRight className="text-gray-600 shrink-0" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-green-500/20 p-4 rounded-xl border border-green-500/30">
                <CheckSquare className="text-green-400" size={24} />
              </div>
              <span className="text-xs font-bold text-gray-300 text-center">Response<br/><span className="text-gray-500 font-normal">Sent back to user</span></span>
            </div>

          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="summary" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> DNS is the phonebook of the internet.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use Private DNS Zone for internal name resolution.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use Alias Record for Azure resources.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use Azure DNS Resolver for hybrid environments.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Health Checks improve reliability with Traffic Manager.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use appropriate DNS zones (Public or Private).</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Alias Record for Azure resources.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Private DNS with Private Endpoints.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Implement DNS Resolver for hybrid scenarios.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Monitor DNS with Azure Monitor.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Health Checks with Traffic Manager for high availability.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
