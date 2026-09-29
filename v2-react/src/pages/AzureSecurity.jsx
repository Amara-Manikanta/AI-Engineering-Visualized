import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Shield, ShieldAlert, Key, FileCheck, Users, Lock, Flame, Globe2, Database, Activity, PanelTop, ArrowRight, CheckSquare, Lightbulb, Star, AlertTriangle, Eye } from 'lucide-react';

export default function AzureSecurity() {
  const toc = [
    { label: "1. Core Security Services", hash: "core-security" },
    { label: "2. Network Security", hash: "network-security" },
    { label: "3. Security Architecture", hash: "architecture" },
    { label: "4. Threat Protection", hash: "threat-protection" }
  ];

  const coreSecurity = [
    {
      id: 1,
      title: "Microsoft Defender for Cloud",
      icon: <Shield className="text-green-400" size={32} />,
      points: [
        "Unified security management and advanced threat protection.",
        "Continuous assessment and secure score.",
        "Workload protection for servers, containers, databases.",
        "Recommendations and regulatory compliance."
      ],
      color: "border-green-500/30"
    },
    {
      id: 2,
      title: "Microsoft Sentinel",
      icon: <Eye className="text-blue-400" size={32} />,
      points: [
        "Cloud-native SIEM and SOAR solution.",
        "Collects data at scale from all sources.",
        "Detects threats with AI and built-in analytics.",
        "Automates response using playbooks."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 3,
      title: "Key Vault",
      icon: <Key className="text-yellow-400" size={32} />,
      points: [
        "Securely store and manage secrets, keys and certificates.",
        "Centralized key management.",
        "Integrates with Azure services and applications.",
        "Supports RBAC and access policies."
      ],
      color: "border-yellow-500/30"
    },
    {
      id: 4,
      title: "Azure Policy",
      icon: <FileCheck className="text-purple-400" size={32} />,
      points: [
        "Create, assign and manage policies for resources.",
        "Enforce organizational standards and compliance.",
        "Audit or deny non-compliant resources.",
        "Built-in policies and custom definitions."
      ],
      color: "border-purple-500/30"
    }
  ];

  const networkSecurity = [
    {
      id: 5,
      title: "RBAC",
      icon: <Users className="text-blue-400" size={32} />,
      points: [
        "Manage access to Azure resources.",
        "Built-in roles (Owner, Contributor, Reader).",
        "Assign roles at different scopes.",
        "Follows principle of least privilege."
      ]
    },
    {
      id: 6,
      title: "NSG",
      icon: <Lock className="text-indigo-400" size={32} />,
      points: [
        "Controls inbound and outbound traffic.",
        "Rule-based filtering (Allow/Deny).",
        "Applied to subnets or NICs.",
        "Stateful traffic filtering."
      ]
    },
    {
      id: 7,
      title: "Firewall",
      icon: <Flame className="text-red-400" size={32} />,
      points: [
        "Network security service protecting resources.",
        "Stateful inspection and threat intelligence.",
        "Filter traffic by FQDN, IP, ports, protocols.",
        "Centralized logging."
      ]
    },
    {
      id: 8,
      title: "WAF",
      icon: <Globe2 className="text-cyan-400" size={32} />,
      points: [
        "Protects web applications from common attacks.",
        "OWASP Top 10 protection.",
        "SQL Injection, XSS, CSRF.",
        "Integrates with App GW, Front Door."
      ]
    },
    {
      id: 9,
      title: "DDoS Protection",
      icon: <ShieldAlert className="text-blue-500" size={32} />,
      points: [
        "Protects against DDoS attacks on your apps.",
        "Standard and Basic protection plans.",
        "Always-on traffic monitoring.",
        "Works with Front Door, App GW, Public IP."
      ]
    }
  ];

  const threats = [
    { threat: "Unauthorized Access", protection: "RBAC, Conditional Access, MFA" },
    { threat: "Network Attacks", protection: "NSG, Firewall, DDoS Protection" },
    { threat: "Web Attacks (WAF)", protection: "WAF, Application Gateway" },
    { threat: "Data Breach / Leakage", protection: "Key Vault, Encryption, DLP" },
    { threat: "Malware / Vulnerabilities", protection: "Defender for Cloud, Patching" },
    { threat: "Advanced Threats", protection: "Sentinel, Threat Intelligence" }
  ];

  return (
    <GuideLayout
      title="Azure Security"
      intro="Azure provides a comprehensive set of security services to protect your cloud resources, applications, and data across identities, infrastructure and workloads."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-security" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Security Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreSecurity.map(service => (
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
      <section id="network-security" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Access & Network Security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {networkSecurity.map(service => (
            <div key={service.id} className="border border-gray-700 rounded-xl p-5 bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                {service.icon}
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{service.id}</span>
              </div>
              <h3 className="font-bold text-white mb-4 text-sm">{service.title}</h3>
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
      <section id="architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Azure Security Architecture
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[900px] flex items-stretch justify-between gap-6">
            
            {/* Identities */}
            <div className="w-40 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shrink-0 flex flex-col items-center justify-center">
              <Users className="text-blue-400 mb-2" size={32} />
              <span className="font-bold text-gray-300 text-sm mb-4">Identities</span>
              <div className="w-full h-px bg-gray-700 mb-4"></div>
              <span className="text-xs text-gray-400 text-center">Azure AD<br/>RBAC<br/>Access Control</span>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Core Protection & Monitoring */}
            <div className="flex-1 flex flex-col gap-4 min-w-[500px]">
              
              {/* Protect Layer */}
              <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-4 text-center">
                <h4 className="font-bold text-green-400 text-sm mb-4">Protect</h4>
                <div className="flex justify-around items-center">
                  <div className="flex flex-col items-center gap-2">
                    <Shield size={32} className="text-green-400"/>
                    <span className="text-xs text-gray-400 font-bold">Defender<br/>for Cloud</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Eye size={32} className="text-blue-400"/>
                    <span className="text-xs text-gray-400 font-bold">Sentinel<br/>(SIEM)</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Key size={32} className="text-yellow-400"/>
                    <span className="text-xs text-gray-400 font-bold">Key Vault</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <FileCheck size={32} className="text-purple-400"/>
                    <span className="text-xs text-gray-400 font-bold">Policy</span>
                  </div>
                </div>
              </div>

              {/* Monitor & Alert Layer */}
              <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4 text-center">
                <h4 className="font-bold text-blue-400 text-sm mb-4">Monitor & Alert</h4>
                <div className="flex justify-around items-center">
                  <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded border border-gray-700">
                    <Activity size={16} className="text-blue-400"/>
                    <span className="text-xs text-gray-400">Monitor</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded border border-gray-700">
                    <ShieldAlert size={16} className="text-red-400"/>
                    <span className="text-xs text-gray-400">Alerts</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded border border-gray-700">
                    <Database size={16} className="text-emerald-400"/>
                    <span className="text-xs text-gray-400">Log Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded border border-gray-700">
                    <PanelTop size={16} className="text-pink-400"/>
                    <span className="text-xs text-gray-400">Workbooks</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Network Security */}
            <div className="w-40 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shrink-0 flex flex-col justify-center">
              <h4 className="text-center font-bold text-gray-300 text-sm mb-4">Network Security</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400"><Lock className="text-indigo-400" size={16}/> NSG</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Flame className="text-red-400" size={16}/> Firewall</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Globe2 className="text-cyan-400" size={16}/> WAF</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><ShieldAlert className="text-blue-500" size={16}/> DDoS Protection</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="threat-protection" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="text-red-400" /> Common Threats & Protection</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-2 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tl-lg">Threat</th>
                    <th className="py-2 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tr-lg">Protection</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.map((t, i) => (
                    <tr key={i} className="border-b border-[#222]">
                      <td className="py-3 px-4 text-gray-300 text-sm font-medium">{t.threat}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{t.protection}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
              <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Security is a shared responsibility.</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use least privilege access (RBAC).</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Enable MFA for all users.</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Encrypt data at rest and in transit.</li>
              </ul>
            </div>
            
            <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
              <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Defender for Cloud on all subscriptions.</li>
                <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Store secrets and keys in Key Vault - never in code.</li>
                <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enforce Azure Policy for compliance.</li>
                <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Restrict network access using NSG and Firewall.</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

    </GuideLayout>
  );
}
