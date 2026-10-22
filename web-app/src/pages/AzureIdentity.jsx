import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { Shield, Users, UsersRound, Settings, Key, ShieldCheck, Smartphone, CheckCircle, Crown, Globe, Server, ArrowRight, Lightbulb, Star, Database, Cloud } from 'lucide-react';

export default function AzureIdentity() {
  const toc = [
    { label: "1. Core Identity Concepts", hash: "core-identity" },
    { label: "2. Access & Security", hash: "access-security" },
    { label: "3. How It Works (Flow)", hash: "how-it-works" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const coreConcepts = [
    {
      id: 1,
      title: "Microsoft Entra ID (Azure AD)",
      icon: <Shield className="text-blue-400" size={32} />,
      points: [
        "Cloud-based identity and access management.",
        "Successor of Azure AD.",
        "Authenticate and authorize users, apps and services.",
        "Supports hybrid & multi-cloud."
      ],
      color: "border-blue-500/30 bg-blue-500/10"
    },
    {
      id: 2,
      title: "Users",
      icon: <Users className="text-indigo-400" size={32} />,
      points: [
        "Represent people in Entra ID.",
        "Can access Azure resources.",
        "Assigned to groups & roles.",
        "Supports external users (guest users)."
      ],
      color: "border-indigo-500/30 bg-indigo-500/10"
    },
    {
      id: 3,
      title: "Groups",
      icon: <UsersRound className="text-purple-400" size={32} />,
      points: [
        "Collection of users.",
        "Simplifies access management.",
        "Used for Role Assignment.",
        "Types: Security, Microsoft 365."
      ],
      color: "border-purple-500/30 bg-purple-500/10"
    },
    {
      id: 4,
      title: "Service Principal",
      icon: <Settings className="text-cyan-400" size={32} />,
      points: [
        "Identity for applications.",
        "Used by apps, automation and CI/CD pipelines.",
        "Supports RBAC and access control."
      ],
      color: "border-cyan-500/30 bg-cyan-500/10"
    },
    {
      id: 5,
      title: "Managed Identity",
      icon: <Key className="text-emerald-400" size={32} />,
      points: [
        "Managed identity for Azure resources.",
        "No credential management.",
        "Used by VMs, AKS, Functions.",
        "More secure than secrets."
      ],
      color: "border-emerald-500/30 bg-emerald-500/10"
    }
  ];

  const accessSecurity = [
    {
      id: 6,
      title: "RBAC (Role Based Access Control)",
      icon: <ShieldCheck className="text-blue-500" size={32} />,
      points: [
        "Control access to Azure resources.",
        "Assign roles to Users, Groups, Service Principals or Managed Identity.",
        "Principle of Least Privilege.",
        "Built-in, Custom and Azure AD roles."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 7,
      title: "Conditional Access",
      icon: <Globe className="text-indigo-500" size={32} />,
      points: [
        "Apply access policies.",
        "Based on user, device, location.",
        "Increases security posture."
      ],
      color: "border-indigo-500/30"
    },
    {
      id: 8,
      title: "MFA (Multi-Factor Authentication)",
      icon: <Smartphone className="text-purple-500" size={32} />,
      points: [
        "Adds extra layer of security.",
        "Reduces risk of account compromise.",
        "Recommended for all users."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 9,
      title: "PIM (Privileged Identity Management)",
      icon: <Crown className="text-amber-500" size={32} />,
      points: [
        "Just-in-Time (JIT) access to roles.",
        "Time-bound & approval based.",
        "Reduces standing admin access.",
        "Enhances security & compliance."
      ],
      color: "border-amber-500/30"
    }
  ];

  return (
    <GuideLayout
      title="Azure Identity"
      intro="Secure access and identity for users, apps and services across Azure and beyond."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-identity" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">1. Core Identity Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreConcepts.map(concept => (
            <div key={concept.id} className={`border rounded-xl p-6 bg-[#1a1a1a] ${concept.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{concept.id}</span>
                {concept.icon}
                <h3 className="font-bold text-white">{concept.title}</h3>
              </div>
              <ul className="space-y-2">
                {concept.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2 */}
      <section id="access-security" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">2. Access & Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessSecurity.map(item => (
            <div key={item.id} className={`border rounded-xl p-6 bg-[#111] ${item.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gray-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{item.id}</span>
                {item.icon}
                <h3 className="font-bold text-white text-lg">{item.title}</h3>
              </div>
              <ul className="space-y-2">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section id="how-it-works" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">3. How It Works?</h2>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[800px] flex items-center justify-between gap-4">
            
            {/* Left: Entities */}
            <div className="flex flex-col gap-3 shrink-0">
              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] p-3 rounded-lg w-48">
                <Users className="text-blue-400" /> <span className="text-gray-300 font-medium">Users</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] p-3 rounded-lg w-48">
                <Globe className="text-indigo-400" /> <span className="text-gray-300 font-medium">Applications</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] p-3 rounded-lg w-48">
                <Server className="text-purple-400" /> <span className="text-gray-300 font-medium">Azure Resources</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Sign-in</span>
              <ArrowRight className="text-gray-600" />
              <span className="text-xs text-gray-500 mt-1">Authentication</span>
            </div>

            {/* Middle: Entra ID */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-blue-900/20 border border-blue-500/40 p-6 rounded-2xl flex flex-col items-center shrink-0 w-48"
            >
              <Shield className="text-blue-400 w-16 h-16 mb-2" />
              <span className="text-white font-bold text-center">Microsoft<br/>Entra ID</span>
            </motion.div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight className="text-gray-600" />
            </div>

            {/* Right Middle: Policies */}
            <div className="flex flex-col gap-2 shrink-0 bg-[#1a1a1a] border border-[#333] p-4 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={14} className="text-emerald-500"/> RBAC</div>
              <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={14} className="text-emerald-500"/> Conditional Access</div>
              <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={14} className="text-emerald-500"/> MFA</div>
              <div className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle size={14} className="text-emerald-500"/> PIM</div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <ArrowRight className="text-gray-600" />
            </div>

            {/* Right: Target */}
            <div className="bg-[#1a1a1a] border border-emerald-500/30 p-4 rounded-xl shrink-0 w-48 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[0.625rem] px-2 py-0.5 rounded-bl">Secure Access</div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-300"><Cloud size={16} className="text-blue-400"/> Azure Portal</div>
                <div className="flex items-center gap-2 text-sm text-gray-300"><Server size={16} className="text-purple-400"/> VM / AKS</div>
                <div className="flex items-center gap-2 text-sm text-gray-300"><Database size={16} className="text-orange-400"/> Storage / DB</div>
                <div className="flex items-center gap-2 text-sm text-gray-300"><Globe size={16} className="text-cyan-400"/> All Azure Services</div>
              </div>
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
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Entra ID = Single Identity Platform for Microsoft Cloud.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Use Groups for simpler access management.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Use Managed Identity for workloads (no secrets).</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> RBAC ensures controlled access to resources.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> MFA & Conditional Access are must for security.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Follow Least Privilege access model.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Use MFA for all users and admins.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Enable PIM for privileged roles.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Automate access with Managed Identity & Service Principal.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Regularly review roles and access (Access Reviews).</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
