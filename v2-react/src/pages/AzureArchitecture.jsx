import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Globe, Cloud, Shield, Database, Component, Box, Flame, Settings, History, FileCheck, DollarSign, ArrowDown, Activity, ArrowRightLeft, Network, Server, Key, Star, ShieldAlert, CheckSquare, Lightbulb } from 'lucide-react';

export default function AzureArchitecture() {
  const toc = [
    { label: "1. Core Production Architecture", hash: "core-architecture" },
    { label: "2. Operations & Security", hash: "ops-security" },
    { label: "3. Region Pair & DR", hash: "dr" }
  ];

  const opsSecurity = [
    { id: 1, title: "Azure Monitor", icon: <Activity className="text-blue-400" size={24} />, desc: "Collect, analyze and visualize metrics & logs" },
    { id: 2, title: "Log Analytics", icon: <Database className="text-emerald-400" size={24} />, desc: "Centralized logging and analytics" },
    { id: 3, title: "Defender for Cloud", icon: <ShieldAlert className="text-green-500" size={24} />, desc: "Threat protection, CSPM & workload security" },
    { id: 4, title: "Azure Backup", icon: <History className="text-indigo-400" size={24} />, desc: "Azure Backup for VMs & workloads" },
    { id: 5, title: "Azure Policy", icon: <FileCheck className="text-purple-400" size={24} />, desc: "Governance and compliance" },
    { id: 6, title: "Cost Management", icon: <DollarSign className="text-green-400" size={24} />, desc: "Cost monitoring and optimization" }
  ];

  const dataLayer = [
    { title: "Azure SQL", icon: <Database className="text-blue-400" size={32} />, desc: "Managed Relational DB" },
    { title: "Azure Cosmos DB", icon: <Globe className="text-cyan-400" size={32} />, desc: "Globally Distributed NoSQL DB" },
    { title: "Azure Cache for Redis", icon: <Database className="text-red-400" size={32} />, desc: "In-Memory Caching" },
    { title: "Storage Account", icon: <Server className="text-emerald-400" size={32} />, desc: "Blob | File | Queue | Table" },
    { title: "Key Vault", icon: <Key className="text-yellow-400" size={32} />, desc: "Secrets | Keys | Certificates" }
  ];

  return (
    <GuideLayout
      title="Azure Architecture"
      intro="Highly available, secure and scalable Azure production architecture with monitoring, security, backup and disaster recovery."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Production Architecture Flow
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto relative">
          
          <div className="absolute top-4 left-4 border border-gray-700 bg-[#1a1a1a] rounded p-3 w-40">
            <h4 className="text-[0.625rem] text-gray-500 font-bold mb-2 uppercase border-b border-gray-800 pb-1">Networking Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400"><ArrowRightLeft size={14} className="text-blue-400"/> Virtual Network</div>
              <div className="flex items-center gap-2 text-xs text-gray-400"><div className="w-3 h-3 border border-dashed border-gray-500 rounded-sm"></div> Subnet</div>
              <div className="flex items-center gap-2 text-xs text-gray-400"><Shield size={14} className="text-indigo-400"/> NSG</div>
              <div className="flex items-center gap-2 text-xs text-gray-400"><Network size={14} className="text-emerald-400"/> Private Link</div>
              <div className="flex items-center gap-2 text-xs text-gray-400"><ShieldAlert size={14} className="text-blue-500"/> DDoS Protection</div>
            </div>
          </div>

          <div className="min-w-[800px] flex flex-col items-center ml-40">
            
            <div className="flex flex-col items-center mb-4">
              <Globe className="text-blue-400 mb-2" size={32} />
              <span className="font-bold text-gray-300">Internet</span>
            </div>

            <ArrowDown className="text-gray-600 mb-4" />

            <div className="w-full max-w-2xl bg-[#1a1a1a] border border-blue-500/30 rounded-xl p-4 mb-4 flex items-center gap-4">
              <Cloud className="text-blue-400" size={32} />
              <div>
                <h4 className="font-bold text-blue-400">Azure Front Door</h4>
                <span className="text-xs text-gray-400">Global Edge Routing & CDN</span>
              </div>
            </div>

            <ArrowDown className="text-gray-600 mb-4" />

            <div className="w-full max-w-2xl bg-[#1a1a1a] border border-red-500/30 rounded-xl p-4 mb-4 flex items-center gap-4">
              <Flame className="text-red-400" size={32} />
              <div>
                <h4 className="font-bold text-red-400">Web Application Firewall (WAF)</h4>
                <span className="text-xs text-gray-400">OWASP Protection</span>
              </div>
            </div>

            <ArrowDown className="text-gray-600 mb-4" />

            <div className="w-full max-w-2xl bg-[#1a1a1a] border border-green-500/30 rounded-xl p-4 mb-4 flex items-center gap-4">
              <Component className="text-green-400" size={32} />
              <div>
                <h4 className="font-bold text-green-400">Application Gateway</h4>
                <span className="text-xs text-gray-400">Layer 7 Load Balancer</span>
              </div>
            </div>

            <ArrowDown className="text-gray-600 mb-4" />

            {/* VNet Area */}
            <div className="w-full max-w-3xl border border-blue-500/20 border-dashed rounded-xl p-6 relative">
              <div className="absolute -top-3 left-4 bg-[#111] px-2 text-xs text-blue-400 font-bold">VNet</div>
              
              <div className="bg-[#1a1a1a] border border-purple-500/30 rounded-xl p-6 text-center">
                <h4 className="font-bold text-purple-400 mb-4 flex justify-center items-center gap-2">
                  <Box className="text-purple-400" /> Azure Kubernetes Service (AKS)
                </h4>
                
                <div className="flex justify-center gap-4 mb-6">
                  <div className="bg-purple-500/20 p-3 rounded text-purple-300 border border-purple-500/30"><Box size={24}/></div>
                  <div className="bg-purple-500/20 p-3 rounded text-purple-300 border border-purple-500/30"><Box size={24}/></div>
                  <div className="bg-purple-500/20 p-3 rounded text-purple-300 border border-purple-500/30"><Box size={24}/></div>
                  <div className="bg-purple-500/20 p-3 rounded text-purple-300 border border-purple-500/30"><Box size={24}/></div>
                </div>

                <div className="flex justify-around items-center border-t border-gray-800 pt-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="bg-green-500/20 text-green-400 p-2 rounded"><Settings size={20}/></div>
                    <span className="text-[0.625rem] text-gray-400">Ingress<br/>NGINX</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Network size={20} className="text-blue-400"/>
                    <span className="text-[0.625rem] text-gray-400">Services</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Box size={20} className="text-purple-400"/>
                    <span className="text-[0.625rem] text-gray-400">Pods</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Activity size={20} className="text-cyan-400"/>
                    <span className="text-[0.625rem] text-gray-400">Auto Scaling</span>
                  </div>
                </div>
              </div>
            </div>

            <ArrowDown className="text-gray-600 my-4" />

            {/* Data Layer */}
            <div className="w-full border border-gray-700 rounded-xl p-6 relative bg-[#1a1a1a]">
              <div className="absolute -top-3 left-4 bg-[#1a1a1a] px-2 text-xs text-gray-400 font-bold border border-gray-700 rounded">Data Layer</div>
              <div className="grid grid-cols-5 gap-4">
                {dataLayer.map((data, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-2">
                    {data.icon}
                    <h5 className="font-bold text-gray-300 text-xs">{data.title}</h5>
                    <span className="text-[0.625rem] text-gray-500">{data.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="ops-security" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Operations & Security
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opsSecurity.map(ops => (
            <div key={ops.id} className="bg-[#111] border border-gray-700 rounded-xl p-5 flex items-start gap-4">
              <div className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 shrink-0">
                {ops.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-200 text-sm mb-1">{ops.title}</h4>
                <p className="text-xs text-gray-400">{ops.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section id="dr" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Region Pair - Disaster Recovery (DR)
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto mb-8">
          <div className="min-w-[900px] flex gap-8 items-center">
            
            {/* Primary */}
            <div className="flex-1 border border-blue-500/30 rounded-xl p-4 bg-blue-900/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-xs font-bold text-blue-400 border border-blue-500/30 rounded">Primary Region (Active)</div>
              
              <div className="flex justify-around items-center mb-6 mt-4">
                <div className="flex flex-col items-center"><Cloud className="text-blue-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">Front Door</span></div>
                <div className="flex flex-col items-center"><Flame className="text-red-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">WAF</span></div>
                <div className="flex flex-col items-center"><Component className="text-green-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">App Gateway</span></div>
                <div className="flex flex-col items-center"><Box className="text-purple-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">AKS</span></div>
              </div>

              <div className="flex justify-around items-center pt-6 border-t border-blue-500/20">
                <div className="flex flex-col items-center"><Database className="text-blue-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">SQL</span></div>
                <div className="flex flex-col items-center"><Globe className="text-cyan-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">Cosmos DB</span></div>
                <div className="flex flex-col items-center"><Database className="text-red-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">Redis</span></div>
                <div className="flex flex-col items-center"><Server className="text-emerald-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">Storage</span></div>
              </div>

              <div className="flex justify-around items-center pt-6 mt-6 border-t border-blue-500/20">
                <div className="flex flex-col items-center"><Key className="text-yellow-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Key Vault</span></div>
                <div className="flex flex-col items-center"><Activity className="text-blue-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Monitor</span></div>
                <div className="flex flex-col items-center"><Database className="text-emerald-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Log Analytics</span></div>
                <div className="flex flex-col items-center"><History className="text-indigo-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Backup</span></div>
              </div>
            </div>

            {/* Sync */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span className="text-xs text-purple-400 font-bold">Geo-Replication<br/>/ Sync</span>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="text-gray-500" />
                <Globe className="text-blue-500" size={32} />
                <ArrowRightLeft className="text-gray-500" />
              </div>
              <span className="text-xs text-cyan-400 font-bold text-center">Zone Redundant<br/>High Availability</span>
            </div>

            {/* Secondary */}
            <div className="flex-1 border border-emerald-500/30 rounded-xl p-4 bg-emerald-900/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-xs font-bold text-emerald-400 border border-emerald-500/30 rounded">Secondary Region (Standby)</div>
              
              <div className="flex justify-around items-center mb-6 mt-4">
                <div className="flex flex-col items-center"><Cloud className="text-blue-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">Front Door</span></div>
                <div className="flex flex-col items-center"><Flame className="text-red-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">WAF</span></div>
                <div className="flex flex-col items-center"><Component className="text-green-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">App Gateway</span></div>
                <div className="flex flex-col items-center"><Box className="text-purple-400" size={24}/><span className="text-[0.625rem] text-gray-400 mt-1">AKS</span></div>
              </div>

              <div className="flex justify-around items-center pt-6 border-t border-emerald-500/20">
                <div className="flex flex-col items-center"><Database className="text-blue-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">SQL</span></div>
                <div className="flex flex-col items-center"><Globe className="text-cyan-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">Cosmos DB</span></div>
                <div className="flex flex-col items-center"><Database className="text-red-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">Redis</span></div>
                <div className="flex flex-col items-center"><Server className="text-emerald-400" size={20}/><span className="text-[0.625rem] text-gray-400 mt-1">Storage</span></div>
              </div>

              <div className="flex justify-around items-center pt-6 mt-6 border-t border-emerald-500/20">
                <div className="flex flex-col items-center"><Key className="text-yellow-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Key Vault</span></div>
                <div className="flex flex-col items-center"><Activity className="text-blue-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Monitor</span></div>
                <div className="flex flex-col items-center"><Database className="text-emerald-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Log Analytics</span></div>
                <div className="flex flex-col items-center"><History className="text-indigo-400" size={16}/><span className="text-[0.625rem] text-gray-400 mt-1">Backup</span></div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">DR Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-300"><CheckSquare className="text-emerald-400" size={16}/> Automated Failover</li>
              <li className="flex items-center gap-2 text-sm text-gray-300"><CheckSquare className="text-emerald-400" size={16}/> Geo-Redundant Services</li>
              <li className="flex items-center gap-2 text-sm text-gray-300"><CheckSquare className="text-emerald-400" size={16}/> Data Replication</li>
              <li className="flex items-center gap-2 text-sm text-gray-300"><CheckSquare className="text-emerald-400" size={16}/> Backup & Restore</li>
              <li className="flex items-center gap-2 text-sm text-gray-300"><CheckSquare className="text-emerald-400" size={16}/> RPO / RTO Optimization</li>
            </ul>
          </div>
          
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Star size={24} /> Key Benefits</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> High Availability</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Scalability</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Security</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Performance</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Cost Optimization</div>
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Business Continuity</div>
            </div>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
