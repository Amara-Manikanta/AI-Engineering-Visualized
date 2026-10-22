import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { Server, Cpu, Database, Blocks, Building, CopyPlus, User, UploadCloud, CheckCircle, Play, ShieldAlert, History, ShieldCheck, CheckSquare, Lightbulb, Star, ArrowRight } from 'lucide-react';

export default function AzureVms() {
  const toc = [
    { label: "1. VM Concepts", hash: "vm-concepts" },
    { label: "2. Deployment Flow", hash: "deployment-flow" },
    { label: "3. Architecture & Networking", hash: "architecture" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const vmConcepts = [
    {
      id: 1,
      title: "VM Basics",
      icon: <Server className="text-blue-400" size={32} />,
      points: [
        "On-demand scalable servers.",
        "Supports Windows & Linux.",
        "Complete control of OS.",
        "Integrates with Azure services."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 2,
      title: "VM Sizes",
      icon: <Cpu className="text-emerald-400" size={32} />,
      points: [
        "Wide range of sizes for different workloads.",
        "General Purpose (D), Compute Optimized (F).",
        "Memory (E), GPU (NC), Storage (L, M) optimized."
      ],
      color: "border-emerald-500/30"
    },
    {
      id: 3,
      title: "Managed Disks",
      icon: <Database className="text-purple-400" size={32} />,
      points: [
        "Durable & highly available storage.",
        "Types: Standard HDD, Standard SSD, Premium SSD.",
        "Auto-redundant storage."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 4,
      title: "Availability Set",
      icon: <Blocks className="text-indigo-400" size={32} />,
      points: [
        "Distributes VMs across fault domains.",
        "Protects against hardware failures.",
        "Protects against maintenance events."
      ],
      color: "border-indigo-500/30"
    },
    {
      id: 5,
      title: "Availability Zones",
      icon: <Building className="text-orange-400" size={32} />,
      points: [
        "Physically separate data centers.",
        "Protects against datacenter failures.",
        "Higher availability and resilience."
      ],
      color: "border-orange-500/30"
    },
    {
      id: 6,
      title: "Scale Set",
      icon: <CopyPlus className="text-cyan-400" size={32} />,
      points: [
        "Automatically scales VMs in or out.",
        "Based on demand or schedule.",
        "Load balanced and highly available.",
        "Reduces cost and improves availability."
      ],
      color: "border-cyan-500/30"
    }
  ];

  return (
    <GuideLayout
      title="Azure Virtual Machines"
      intro="Azure Virtual Machines provide scalable, on-demand computing resources in the cloud."
      toc={toc}
    >

      {/* 1 */}
      <section id="vm-concepts" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">1. VM Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vmConcepts.map(concept => (
            <div key={concept.id} className={`border rounded-xl p-6 bg-[#111] ${concept.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#1a1a1a] border border-[#333] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{concept.id}</span>
                {concept.icon}
                <h3 className="font-bold text-white">{concept.title}</h3>
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

      {/* 2 */}
      <section id="deployment-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">2. VM Deployment Flow</h2>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[700px] flex items-center justify-between">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
                <User className="text-blue-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300">User</span>
            </div>
            
            <div className="flex-1 flex items-center">
              <div className="h-px bg-gray-600 flex-1 relative">
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <ArrowRight className="text-gray-600 mx-2" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-purple-500/20 p-4 rounded-full border border-purple-500/30">
                <UploadCloud className="text-purple-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">Create VM<br/>Request</span>
            </div>

            <div className="flex-1 flex items-center">
              <div className="h-px bg-gray-600 flex-1 relative">
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <ArrowRight className="text-gray-600 mx-2" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-indigo-500/20 p-4 rounded-full border border-indigo-500/30">
                <CheckCircle className="text-indigo-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">Azure<br/>Validates</span>
            </div>

            <div className="flex-1 flex items-center">
              <div className="h-px bg-gray-600 flex-1 relative">
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2, delay: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <ArrowRight className="text-gray-600 mx-2" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
                <Server className="text-emerald-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">VM<br/>Provisioned</span>
            </div>

            <div className="flex-1 flex items-center">
              <div className="h-px bg-gray-600 flex-1 relative">
                <motion.div 
                  className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <ArrowRight className="text-gray-600 mx-2" />
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30">
                <Play className="text-green-400" size={32} />
              </div>
              <span className="text-sm font-bold text-gray-300 text-center">VM<br/>Running</span>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            User requests VM → Azure validates → Resources created → VM running (Takes few minutes).
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">3. Architecture & Networking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bastion */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2"><ShieldAlert className="text-red-400" /> Bastion</h3>
              <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">8</span>
            </div>
            
            <div className="flex items-center justify-between mb-6 bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
              <div className="flex flex-col items-center">
                <User className="text-blue-400 mb-2" />
                <span className="text-xs text-gray-400">User</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="flex items-center w-full px-4">
                  <div className="flex-1 h-px bg-gray-600 border-b border-dashed border-gray-600"></div>
                  <ShieldCheck className="text-emerald-500 mx-2" />
                  <div className="flex-1 h-px bg-gray-600 border-b border-dashed border-gray-600"></div>
                </div>
                <span className="text-[0.625rem] text-gray-500 mt-2 uppercase">SSL / HTTPS</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Server className="text-purple-400 mb-2" />
                <span className="text-xs text-gray-400">VM</span>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Secure RDP/SSH access to VM over SSL.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> No public IP required on VM.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Protects VM from internet exposure.</li>
            </ul>
          </div>

          {/* Backup */}
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2"><History className="text-cyan-400" /> Backup</h3>
              <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">9</span>
            </div>
            
            <div className="flex items-center justify-center mb-6 gap-6 bg-[#1a1a1a] p-4 rounded-xl border border-[#333]">
              <div className="text-center">
                <Server className="text-purple-400 mb-2 mx-auto" />
                <span className="text-xs text-gray-400">VM + Disk</span>
              </div>
              <ArrowRight className="text-gray-600" />
              <div className="text-center">
                <Database className="text-cyan-400 mb-2 mx-auto" />
                <span className="text-xs text-gray-400">Recovery Vault</span>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span> Azure Backup protects VM and its data.</li>
              <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span> Supports full & incremental backup.</li>
              <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span> Restore to same region or cross region.</li>
              <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span> Retention policy configurable.</li>
            </ul>
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
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> VMs are the building blocks of compute in Azure.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use Managed Disks for high availability and durability.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use Availability Zones for highest resiliency.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Scale Set for auto scaling and high availability.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Bastion for secure access without public IP.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Always enable Backup for important workloads.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
