import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Route, Globe, Server, Link, ArrowRight, ShieldAlert, Activity, GitFork, BarChart3, ShieldCheck, CheckSquare, Lightbulb, Star } from 'lucide-react';

export default function AzureLoadBalancer() {
  const toc = [
    { label: "1. Core Load Balancing", hash: "core-lb" },
    { label: "2. Security & Scaling", hash: "security-scaling" },
    { label: "3. Traffic Routing Flow", hash: "routing-flow" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const coreLb = [
    {
      id: 1,
      title: "Load Balancer",
      icon: <GitFork className="text-blue-400" size={32} />,
      points: [
        "Operates at Layer 4 (Transport Layer).",
        "Distributes TCP/UDP traffic.",
        "High performance and low latency.",
        "Supports Internal and Public LB."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Application Gateway",
      icon: <Route className="text-emerald-400" size={32} />,
      points: [
        "Layer 7 (Application Layer) load balancer.",
        "HTTP/HTTPS traffic routing.",
        "SSL offloading, path-based routing.",
        "Web Application Firewall (WAF) support."
      ],
      color: "border-emerald-500/30"
    },
    {
      id: 3,
      title: "Azure Front Door",
      icon: <Globe className="text-purple-400" size={32} />,
      points: [
        "Global entry point using Microsoft edge network.",
        "Layer 7 load balancing.",
        "SSL offloading, caching, WAF, DDoS protection.",
        "Improves global performance."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 4,
      title: "Traffic Manager",
      icon: <Link className="text-orange-400" size={32} />,
      points: [
        "DNS-based traffic routing.",
        "Routes users to the best endpoint.",
        "Supports failover and performance routing.",
        "Not a proxy or load balancer."
      ],
      color: "border-orange-500/30"
    }
  ];

  const securityScale = [
    {
      id: 5,
      title: "Azure Firewall",
      icon: <ShieldAlert className="text-red-400" size={32} />,
      points: [
        "Managed cloud network firewall.",
        "Stateful traffic filtering.",
        "Centralized logging and monitoring.",
        "Supports DNAT, SNAT, FQDN filtering."
      ]
    },
    {
      id: 6,
      title: "WAF",
      icon: <ShieldCheck className="text-cyan-400" size={32} />,
      points: [
        "Protects web applications from common threats.",
        "SQL Injection, XSS, CSRF, etc.",
        "Available in Application Gateway, Front Door & Azure Firewall."
      ]
    },
    {
      id: 7,
      title: "Autoscale",
      icon: <BarChart3 className="text-green-400" size={32} />,
      points: [
        "Automatically adjusts number of instances.",
        "Based on CPU, Memory, Queue length, etc.",
        "Ensures high availability & cost optimization."
      ]
    },
    {
      id: 8,
      title: "Health Probe",
      icon: <Activity className="text-pink-400" size={32} />,
      points: [
        "Monitors the health of backend instances.",
        "Sends periodic probe requests.",
        "Unhealthy instances are removed from rotation."
      ]
    }
  ];

  const comparisonTable = [
    { service: "Load Balancer", layer: "4", type: "Transport (TCP/UDP)", usecase: "High performance, simple load balancing" },
    { service: "Application Gateway", layer: "7", type: "Application (HTTP/HTTPS)", usecase: "Web apps, routing, SSL, WAF" },
    { service: "Azure Front Door", layer: "7", type: "Global Edge", usecase: "Global apps, caching, WAF, performance" },
    { service: "Traffic Manager", layer: "DNS", type: "DNS-based", usecase: "Global routing, failover" },
    { service: "Azure Firewall", layer: "3-7", type: "Firewall", usecase: "Network security and filtering" }
  ];

  return (
    <GuideLayout
      title="Azure Load Balancing"
      intro="Azure Load Balancer services help distribute traffic, improve performance and ensure high availability of applications."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-lb" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">1. Core Load Balancing Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreLb.map(service => (
            <div key={service.id} className={`border rounded-xl p-6 bg-[#111] ${service.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {service.icon}
                  <h3 className="font-bold text-white text-lg">{service.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{service.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {service.points.map((point, i) => (
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
      <section id="security-scaling" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">2. Security & Scaling</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {securityScale.map(service => (
            <div key={service.id} className="border border-gray-700 rounded-xl p-6 bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                {service.icon}
                <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{service.id}</span>
              </div>
              <h3 className="font-bold text-white mb-4">{service.title}</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                {service.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-gray-600 mt-0.5">-</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section id="routing-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">3. How Traffic is Routed in Azure</h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto mb-8">
          <div className="min-w-[800px] flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                <Globe className="text-blue-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300">Users</span>
            </div>
            
            <div className="flex-1 flex items-center px-2">
              <div className="h-px bg-gray-600 w-full"></div>
              <ArrowRight className="text-gray-600 shrink-0" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/30">
                <Globe className="text-purple-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">Azure<br/>Front Door</span>
              <span className="text-[0.625rem] text-gray-500">Global entry via<br/>edge network</span>
            </div>

            <div className="flex-1 flex items-center px-2">
              <div className="h-px bg-gray-600 w-full"></div>
              <ArrowRight className="text-gray-600 shrink-0" />
            </div>

            <div className="flex flex-col items-center gap-2 relative">
              <div className="absolute -top-3 -right-3 text-red-500 bg-red-500/20 px-1 text-[0.625rem] rounded font-bold border border-red-500/30">WAF</div>
              <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-500/30">
                <Route className="text-emerald-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">Application<br/>Gateway</span>
              <span className="text-[0.625rem] text-gray-500">Layer 7 routing,<br/>SSL offload</span>
            </div>

            <div className="flex-1 flex items-center px-2">
              <div className="h-px bg-gray-600 w-full"></div>
              <ArrowRight className="text-gray-600 shrink-0" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30">
                <GitFork className="text-blue-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">Load<br/>Balancer</span>
              <span className="text-[0.625rem] text-gray-500">Layer 4 load<br/>balancing</span>
            </div>

            <div className="flex-1 flex items-center px-2">
              <div className="h-px bg-gray-600 w-full"></div>
              <ArrowRight className="text-gray-600 shrink-0" />
            </div>

            <div className="flex flex-col gap-2 bg-[#1a1a1a] p-4 border border-gray-700 rounded-xl">
              <div className="text-xs font-bold text-gray-400 text-center mb-2">Backend Pool</div>
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 p-2 rounded text-indigo-400 text-xs"><Server size={14}/> VM 1</div>
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 p-2 rounded text-indigo-400 text-xs"><Server size={14}/> VM 2</div>
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 p-2 rounded text-indigo-400 text-xs"><Server size={14}/> VM 3</div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tl-xl">Service</th>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Layer</th>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Type</th>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tr-xl">Use Case</th>
              </tr>
            </thead>
            <tbody className="bg-[#111]">
              {comparisonTable.map((model, i) => (
                <tr key={i} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-4 px-6 font-bold text-blue-400">{model.service}</td>
                  <td className="py-4 px-6 text-gray-300">Layer {model.layer}</td>
                  <td className="py-4 px-6 text-gray-300">{model.type}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">{model.usecase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4 */}
      <section id="summary" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Load Balancer = Layer 4 (TCP/UDP)</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Application Gateway = Layer 7 (HTTP/HTTPS)</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Front Door = Global Layer 7 with Edge network</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Traffic Manager = DNS-based routing</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Use Health Probe + Autoscale for resiliency</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use the right service for the right scenario.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Availability Zones for high availability.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Health Probes to detect unhealthy instances.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable WAF to protect web applications.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Autoscale to handle traffic variations.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Monitor metrics and set up alerts.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
