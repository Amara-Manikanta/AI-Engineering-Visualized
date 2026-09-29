import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { Network, Grid, Shield, Users, Map, Globe, Link, DoorOpen, ArrowRight, User, Server, Database, CheckSquare, Lightbulb, Star, ShieldCheck, Route } from 'lucide-react';

export default function AzureNetworking() {
  const toc = [
    { label: "1. Core Networking & Routing", hash: "core-networking" },
    { label: "2. Connectivity & Gateways", hash: "connectivity" },
    { label: "3. Traffic Flow", hash: "traffic-flow" },
    { label: "4. Best Practices", hash: "best-practices" }
  ];

  const networkingComponents = [
    {
      id: 1,
      title: "Virtual Network (VNet)",
      icon: <Network className="text-blue-400" size={32} />,
      points: [
        "Foundation of Azure network.",
        "Isolated network in Azure cloud.",
        "Define your own IP address space.",
        "Enables communication between resources."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Subnet",
      icon: <Grid className="text-emerald-400" size={32} />,
      points: [
        "Subnet is a range of IP addresses in a VNet.",
        "Enables segmentation of resources.",
        "Each subnet resides in a single region."
      ],
      color: "border-emerald-500/30"
    },
    {
      id: 3,
      title: "NSG (Network Security Group)",
      icon: <Shield className="text-indigo-400" size={32} />,
      points: [
        "Controls inbound and outbound traffic.",
        "Rule based allow/deny traffic.",
        "Associated to subnet or NIC.",
        "Stateful and redundant."
      ],
      color: "border-indigo-500/30"
    },
    {
      id: 4,
      title: "ASG (Application Security Group)",
      icon: <Users className="text-purple-400" size={32} />,
      points: [
        "Logical group of VMs with similar function.",
        "Simplifies NSG rule management.",
        "Use in place of IP addresses."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 5,
      title: "Route Table",
      icon: <Map className="text-orange-400" size={32} />,
      points: [
        "Contains a set of routes that determine where network traffic is forwarded.",
        "Associated with subnet."
      ],
      color: "border-orange-500/30"
    },
    {
      id: 6,
      title: "UDR (User Defined Route)",
      icon: <Map className="text-pink-400" size={32} />,
      points: [
        "Custom routes defined by user.",
        "Override system routes.",
        "Enable advanced traffic control."
      ],
      color: "border-pink-500/30"
    }
  ];

  const connectivityComponents = [
    {
      id: 7,
      title: "Public IP",
      icon: <Globe className="text-cyan-400" size={32} />,
      points: [
        "Publicly reachable IP on the internet.",
        "Used by resources like VM, Load Balancer.",
        "Static or Dynamic."
      ]
    },
    {
      id: 8,
      title: "Private Endpoint",
      icon: <Link className="text-emerald-400" size={32} />,
      points: [
        "Private connectivity to Azure services.",
        "Uses Private Link.",
        "Traffic stays on Microsoft backbone."
      ]
    },
    {
      id: 9,
      title: "Service Endpoint",
      icon: <Database className="text-blue-400" size={32} />,
      points: [
        "Extends VNet to Azure services.",
        "Uses Azure backbone network.",
        "Easier to configure than Private Endpoint."
      ]
    },
    {
      id: 10,
      title: "NAT Gateway",
      icon: <DoorOpen className="text-orange-400" size={32} />,
      points: [
        "Enables outbound internet access for resources in private subnets.",
        "Uses static public IP(s).",
        "Highly available, scalable and secure."
      ]
    }
  ];

  return (
    <GuideLayout
      title="Azure Networking"
      intro="Azure Networking enables secure, scalable and highly available communication between resources, users and the internet."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-networking" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Networking & Routing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {networkingComponents.map(concept => (
            <div key={concept.id} className={`border rounded-xl p-6 bg-[#111] ${concept.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {concept.icon}
                  <h3 className="font-bold text-white text-lg leading-tight">{concept.title}</h3>
                </div>
                <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{concept.id}</span>
              </div>
              <ul className="space-y-2">
                {concept.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section id="connectivity" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-cyan-500/20 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Connectivity & Gateways
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectivityComponents.map(concept => (
            <div key={concept.id} className="border border-gray-700 rounded-xl p-6 bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {concept.icon}
                  <h3 className="font-bold text-white text-lg">{concept.title}</h3>
                </div>
                <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{concept.id}</span>
              </div>
              <ul className="space-y-2">
                {concept.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 4 */}
      <section id="traffic-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          How Traffic Flows in Azure
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[800px] flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                <User className="text-blue-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300">User</span>
            </div>
            
            <div className="flex-1 flex items-center px-2 relative">
              <div className="h-px bg-gray-600 w-full"></div>
              <ArrowRight className="text-gray-600 absolute right-0" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-gray-800 p-4 rounded-full border border-gray-700">
                <Globe className="text-gray-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300">Internet</span>
            </div>

            <div className="flex-1 flex items-center px-2 relative">
              <div className="h-px bg-gray-600 w-full"></div>
              <ArrowRight className="text-gray-600 absolute right-0" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-cyan-500/20 p-4 rounded-full border border-cyan-500/30">
                <div className="text-cyan-400 font-bold text-xl leading-none flex items-center justify-center h-8 w-8">IP</div>
              </div>
              <span className="text-sm font-bold text-gray-300">Public IP</span>
            </div>

            <div className="flex-1 flex items-center px-2 relative">
              <div className="h-px bg-emerald-500/50 w-full"></div>
              <ArrowRight className="text-emerald-500 absolute right-0" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
                <Route className="text-emerald-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">Load<br/>Balancer</span>
            </div>

            <div className="flex-1 flex items-center px-2 relative">
              <div className="h-px bg-emerald-500/50 w-full"></div>
              <ArrowRight className="text-emerald-500 absolute right-0" />
            </div>

            <div className="flex flex-col items-center gap-2 relative">
              {/* NSG Shield */}
              <div className="absolute -top-3 -left-3 text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div className="bg-purple-500/20 p-4 rounded-xl border border-purple-500/30">
                <Server className="text-purple-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">VM in<br/>Subnet</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-4 gap-4 max-w-[800px] mx-auto">
            <div className="text-xs text-gray-400 text-center border border-gray-800 p-2 rounded-lg bg-[#1a1a1a]">User requests from internet</div>
            <div className="text-xs text-gray-400 text-center border border-gray-800 p-2 rounded-lg bg-[#1a1a1a]">Public IP receives the request</div>
            <div className="text-xs text-gray-400 text-center border border-gray-800 p-2 rounded-lg bg-[#1a1a1a]">Traffic distributed to healthy VMs</div>
            <div className="text-xs text-gray-400 text-center border border-gray-800 p-2 rounded-lg bg-[#1a1a1a]">Response sent back to user (Outbound via NAT)</div>
          </div>
        </div>
      </section>

      {/* 5 */}
      <section id="best-practices" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> VNet is the foundation of all Azure networking.</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Subnets help in network segmentation.</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> NSG controls traffic, Route Table controls path.</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Private Endpoint keeps traffic on Microsoft network.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use VNets to isolate and secure your resources.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use NSGs to control and restrict traffic.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use ASGs for easier security rule management.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use UDR for custom routing requirements.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Private Endpoints for secure access to PaaS services.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Azure Firewall for advanced threat protection.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
