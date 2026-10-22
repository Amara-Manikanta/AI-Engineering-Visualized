import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Cloud, Server, Database, Lock, Network, Zap, ShieldCheck, Globe, Clock, Rocket, ArrowUpRight, Shield, Activity, Lightbulb, Star } from 'lucide-react';

export default function AzureBasics() {
  const toc = [
    { label: "1. What is Azure?", hash: "what-is-azure" },
    { label: "2. Cloud Computing", hash: "cloud-computing" },
    { label: "3. Azure Benefits", hash: "benefits" },
    { label: "4. Global Infrastructure", hash: "infrastructure" },
    { label: "5. Popular Services", hash: "services" },
    { label: "6. Summary & Best Practices", hash: "summary" }
  ];

  const cloudServices = [
    { icon: <Server />, name: "Compute", color: "blue" },
    { icon: <Database />, name: "Storage", color: "emerald" },
    { icon: <Database />, name: "Database", color: "purple" },
    { icon: <ShieldCheck />, name: "Security", color: "red" },
    { icon: <Network />, name: "Networking", color: "orange" },
  ];

  const benefits = [
    { icon: <ArrowUpRight />, title: "Cost Effective", desc: "Pay-as-you-go model. You only pay for what you use.", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" },
    { icon: <Activity />, title: "Scalability", desc: "Scale up (more power) or down easily based on demand.", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
    { icon: <Shield />, title: "High Availability", desc: "Built-in redundancy to keep applications running.", color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10" },
    { icon: <Lock />, title: "Security", desc: "Enterprise-grade security and compliance.", color: "text-red-400 border-red-500/20 bg-red-500/10" },
    { icon: <Globe />, title: "Global Reach", desc: "60+ regions worldwide to deploy close to users.", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" },
    { icon: <Rocket />, title: "Innovation", desc: "Access to latest technologies (AI, IoT, Quantum).", color: "text-purple-400 border-purple-500/20 bg-purple-500/10" },
    { icon: <Clock />, title: "Reliability", desc: "99.95% SLA for most core services.", color: "text-orange-400 border-orange-500/20 bg-orange-500/10" },
  ];

  const popularServices = [
    { icon: <Server size={32} />, name: "Virtual Machines", type: "Compute" },
    { icon: <Database size={32} />, name: "Storage Account", type: "Storage" },
    { icon: <Database size={32} />, name: "SQL Database", type: "Database" },
    { icon: <Cloud size={32} />, name: "AKS", type: "Containers" },
    { icon: <Zap size={32} />, name: "Functions", type: "Serverless" },
    { icon: <Network size={32} />, name: "Virtual Network", type: "Networking" },
    { icon: <Lock size={32} />, name: "Entra ID", type: "Identity" },
    { icon: <Activity size={32} />, name: "Azure Monitor", type: "Management" },
    { icon: <Shield size={32} />, name: "Key Vault", type: "Security" },
  ];

  return (
    <GuideLayout
      title="Microsoft Azure Basics"
      intro="A comprehensive introduction to Microsoft's global cloud computing platform."
      toc={toc}
    >

      {/* 1 */}
      <section id="what-is-azure" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          What is Azure?
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center bg-[#111] border border-gray-800 rounded-xl p-6">
          <div className="flex-1 space-y-4">
            <p className="text-gray-300">Microsoft Azure is a cloud computing platform that helps you build, deploy and manage applications through Microsoft's global network of data centers.</p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div> Microsoft's official cloud platform.</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div> Offers 200+ products and cloud services.</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div> Build, deploy and manage applications globally.</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div> Pay-as-you-go pricing (OpEx instead of CapEx).</li>
            </ul>
          </div>
          <div className="w-48 h-48 bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/30 rounded-3xl flex flex-col items-center justify-center p-6 shadow-2xl">
            <Cloud size={64} className="text-blue-500 mb-2" />
            <span className="text-xl font-bold text-white">Azure</span>
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="cloud-computing" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Cloud Computing
        </h2>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-center mb-8 gap-4">
            <Cloud size={48} className="text-gray-400" />
            <div className="h-px w-16 bg-gray-600 hidden md:block"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {cloudServices.map((s, i) => (
                <div key={i} className="flex flex-col items-center p-3 bg-[#1a1a1a] border border-[#333] rounded-lg min-w-[80px]">
                  <div className={`text-${s.color}-400 mb-2`}>{s.icon}</div>
                  <span className="text-[0.625rem] text-gray-400 uppercase tracking-wider">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
              <h4 className="font-bold text-blue-400 mb-2">Delivery</h4>
              <p className="text-sm text-gray-300">Delivers IT services over the internet with on-demand resources.</p>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
              <h4 className="font-bold text-emerald-400 mb-2">No Hardware</h4>
              <p className="text-sm text-gray-300">No need to manage physical hardware, servers, or datacenters.</p>
            </div>
            <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl md:col-span-2 text-center">
              <h4 className="font-bold text-purple-400 mb-2">Characteristics</h4>
              <p className="text-sm text-gray-300">Highly elastic, scalable, and reliable compared to on-premise infrastructure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="benefits" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Azure Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className={`border rounded-xl p-5 ${b.color}`}
            >
              <div className="mb-3">{b.icon}</div>
              <h3 className="font-bold text-white mb-2">{b.title}</h3>
              <p className="text-sm text-gray-300">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4 */}
      <section id="infrastructure" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
          Global Infrastructure
        </h2>
        <div className="flex flex-col md:flex-row gap-6 bg-[#111] border border-gray-800 rounded-xl p-6">
          <div className="flex-1">
            <Globe size={64} className="text-blue-500 mb-6 opacity-50" />
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <div className="p-1 bg-blue-500/20 text-blue-400 rounded mt-0.5"><Globe size={16} /></div>
                <div><strong className="text-white">60+ Azure Regions</strong> across the globe (North America, Europe, Asia, India, Australia, etc).</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded mt-0.5"><Server size={16} /></div>
                <div>Each Region has <strong className="text-white">multiple Availability Zones</strong> (independent datacenters).</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-purple-500/20 text-purple-400 rounded mt-0.5"><Shield size={16} /></div>
                <div>Provides high availability, massive performance, and data residency compliance.</div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-orange-500/20 text-orange-400 rounded mt-0.5"><ArrowUpRight size={16} /></div>
                <div>Regions are <strong className="text-white">paired</strong> (e.g. East US & West US) for disaster recovery.</div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5 */}
      <section id="services" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
          Popular Azure Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularServices.map((service, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="text-blue-400">{service.icon}</div>
              <div>
                <div className="font-bold text-white text-sm">{service.name}</div>
                <div className="text-xs text-gray-500 mt-1">{service.type}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6 */}
      <section id="summary" className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span>•</span> Azure is Microsoft's Cloud Platform.</li>
              <li className="flex items-center gap-2"><span>•</span> Resources are organized in a strict hierarchy.</li>
              <li className="flex items-center gap-2"><span>•</span> <em>Everything</em> in Azure is a resource.</li>
              <li className="flex items-center gap-2"><span>•</span> You pay only for what you use.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span>•</span> Follow the Well-Architected Framework.</li>
              <li className="flex items-center gap-2"><span>•</span> Use Tags for all resources for billing/tracking.</li>
              <li className="flex items-center gap-2"><span>•</span> Enable Monitoring and Alerts from day one.</li>
              <li className="flex items-center gap-2"><span>•</span> Secure resources and follow least privilege.</li>
              <li className="flex items-center gap-2"><span>•</span> Plan for High Availability and Backup.</li>
            </ul>
          </div>
        </div>
      </section>

      <KnowledgeCheck questions={questionsFor("cloud-basics")} />
    </GuideLayout>
  );
}
