import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Cloud, History, Server, Shield, Trash2, Globe, Database, FileText, ArrowRight, Save, Clock, CheckSquare, Lightbulb, Star, RotateCcw, Box } from 'lucide-react';

export default function AzureBackup() {
  const toc = [
    { label: "1. Backup & Recovery Concepts", hash: "concepts" },
    { label: "2. Backup Architecture", hash: "architecture" },
    { label: "3. Site Recovery DR Workflow", hash: "dr-workflow" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const concepts = [
    {
      id: 1,
      title: "Azure Backup",
      icon: <Cloud className="text-blue-400" size={32} />,
      points: [
        "Simple & secure backup for Azure workloads.",
        "Supports VM, SQL DB, Files, SharePoint, SAP HANA.",
        "Policy based backups with on-demand restore.",
        "Long term retention with Azure storage."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Recovery Services Vault",
      icon: <Save className="text-emerald-400" size={32} />,
      points: [
        "Centralized vault to manage backup and recovery.",
        "Store backup data securely in geo-redundant storage.",
        "Supports encryption, access control and soft delete."
      ],
      color: "border-emerald-500/30"
    },
    {
      id: 3,
      title: "Site Recovery",
      icon: <RotateCcw className="text-purple-400" size={32} />,
      points: [
        "Replicate VMs to another Azure region.",
        "Minimize downtime with planned/unplanned failover.",
        "Orchestrated recovery with runbooks."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 4,
      title: "Cross Region Restore",
      icon: <Globe className="text-cyan-400" size={32} />,
      points: [
        "Restore backups to alternate Azure regions.",
        "Helps for region outage or permanent data loss.",
        "Improves business continuity."
      ],
      color: "border-cyan-500/30"
    }
  ];

  const advancedFeatures = [
    {
      id: 5,
      title: "Soft Delete",
      icon: <Trash2 className="text-pink-400" size={32} />,
      points: [
        "Protects backup data from accidental deletion.",
        "Retain recovery points for a specified period (e.g., 14 days)."
      ]
    },
    {
      id: 6,
      title: "Immutable Vault",
      icon: <Shield className="text-orange-400" size={32} />,
      points: [
        "WORM (Write Once Read Many) protection.",
        "Prevents modification or deletion of backups.",
        "Strengthens protection against ransomware."
      ]
    }
  ];

  return (
    <GuideLayout
      title="Azure Backup & Disaster Recovery"
      intro="Protect your data, applications and infrastructure with Azure native backup and disaster recovery services."
      toc={toc}
    >

      {/* 1 */}
      <section id="concepts" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Concepts & Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {concepts.map(c => (
            <div key={c.id} className={`border rounded-xl p-5 bg-[#111] ${c.color}`}>
              <div className="flex items-center justify-between mb-4">
                {c.icon}
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{c.id}</span>
              </div>
              <h3 className="font-bold text-white mb-3 text-lg leading-tight">{c.title}</h3>
              <ul className="space-y-1 text-xs text-gray-400">
                {c.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-gray-600 mt-0.5">-</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advancedFeatures.map(feature => (
            <div key={feature.id} className="border border-gray-700 rounded-xl p-5 bg-[#1a1a1a]">
              <div className="flex items-center gap-3 mb-4">
                {feature.icon}
                <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                <span className="ml-auto bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{feature.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                {feature.points.map((point, i) => (
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
      <section id="architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Azure Backup Architecture
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[900px] flex items-stretch justify-between gap-6">
            
            {/* Workloads */}
            <div className="w-48 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shrink-0 flex flex-col justify-center">
              <h4 className="text-center font-bold text-gray-300 text-sm mb-4">Workloads</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400"><Server className="text-blue-400" size={16}/> Azure Virtual Machines</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Database className="text-cyan-400" size={16}/> Azure SQL Database</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><FileText className="text-yellow-400" size={16}/> Azure Files</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Box className="text-emerald-400" size={16}/> Kubernetes Workloads</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Recovery Services Vault */}
            <div className="flex-1 bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-4 text-center flex flex-col justify-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Save className="text-emerald-400" />
                <span className="font-bold text-emerald-400">Recovery Services Vault</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-2"><Clock size={14} className="text-blue-400"/> Backup Policies</div>
                <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-2"><History size={14} className="text-orange-400"/> Retention Mgmt</div>
                <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-2"><Shield size={14} className="text-green-400"/> Security & Encryption</div>
                <div className="bg-[#1a1a1a] p-2 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-2"><Cloud size={14} className="text-purple-400"/> Monitoring & Alerts</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Azure Storage */}
            <div className="w-48 bg-blue-900/10 border border-blue-500/30 rounded-xl p-4 shrink-0 flex flex-col justify-center text-center">
              <Database className="text-blue-400 mx-auto mb-2" size={24}/>
              <h4 className="font-bold text-blue-400 text-sm mb-2">Azure Storage</h4>
              <div className="bg-[#1a1a1a] border border-gray-700 rounded p-2 text-xs text-gray-300 mb-2">
                Geo-Redundant Storage<br/>(GRS/GZRS)
              </div>
              <div className="flex justify-between items-center text-[0.625rem] text-gray-500">
                <span>Primary<br/>Region</span>
                <span>← Sync →</span>
                <span>Secondary<br/>Region</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Restore Options */}
            <div className="w-48 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shrink-0 flex flex-col justify-center">
              <h4 className="text-center font-bold text-gray-300 text-sm mb-4">Restore Options</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400"><History size={16}/> Original Location</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Globe size={16}/> Cross Region</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><FileText size={16}/> Granular Restore</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><RotateCcw size={16}/> Instant Restore</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="dr-workflow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Site Recovery - DR Workflow
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[800px] flex justify-between items-center relative">
            <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gray-700 -z-10 -translate-y-1/2 border-dashed border"></div>
            
            <div className="flex flex-col items-center gap-3 w-32 bg-[#111] p-2">
              <div className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30"><Cloud className="text-blue-400" size={24}/></div>
              <span className="text-xs font-bold text-white text-center">Enable Replication</span>
              <span className="text-[0.625rem] text-gray-500 text-center">To secondary region.</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-32 bg-[#111] p-2">
              <div className="bg-cyan-500/20 p-4 rounded-full border border-cyan-500/30"><Database className="text-cyan-400" size={24}/></div>
              <span className="text-xs font-bold text-white text-center">Replicate Data</span>
              <span className="text-[0.625rem] text-gray-500 text-center">Continuous replication.</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-32 bg-[#111] p-2">
              <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30"><Shield className="text-emerald-400" size={24}/></div>
              <span className="text-xs font-bold text-white text-center">Monitor & Test</span>
              <span className="text-[0.625rem] text-gray-500 text-center">Perform test failover.</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-32 bg-[#111] p-2">
              <div className="bg-orange-500/20 p-4 rounded-full border border-orange-500/30"><RotateCcw className="text-orange-400" size={24}/></div>
              <span className="text-xs font-bold text-white text-center">Failover</span>
              <span className="text-[0.625rem] text-gray-500 text-center">Initiate during disaster.</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-32 bg-[#111] p-2">
              <div className="bg-purple-500/20 p-4 rounded-full border border-purple-500/30"><Server className="text-purple-400" size={24}/></div>
              <span className="text-xs font-bold text-white text-center">Run Apps</span>
              <span className="text-[0.625rem] text-gray-500 text-center">Minimal downtime.</span>
            </div>

            <div className="flex flex-col items-center gap-3 w-32 bg-[#111] p-2">
              <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30"><History className="text-green-400" size={24}/></div>
              <span className="text-xs font-bold text-white text-center">Failback</span>
              <span className="text-[0.625rem] text-gray-500 text-center">When primary is ready.</span>
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
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Backup protects your data.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Disaster Recovery protects your business.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Common use cases: VM/SQL backup, ransomware protection, compliance.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Recovery Services Vault for all critical workloads.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Follow 3-2-1 backup strategy.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Soft Delete and Immutable Vault.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Store backups in geo-redundant storage.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Regularly test backup and DR (Runbooks).</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Monitor backup jobs and set up alerts.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
