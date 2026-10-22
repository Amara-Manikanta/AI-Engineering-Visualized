import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Database, File, MessageSquare, Table, HardDrive, Box, Layers, ArrowRightLeft, Clock, Lightbulb, Star, CheckCircle } from 'lucide-react';

export default function AzureStorage() {
  const toc = [
    { label: "1. Storage Services", hash: "storage-services" },
    { label: "2. Access Tiers", hash: "access-tiers" },
    { label: "3. Redundancy Models", hash: "redundancy" },
    { label: "4. Lifecycle Management", hash: "lifecycle" },
    { label: "5. Summary & Best Practices", hash: "summary" }
  ];

  const storageServices = [
    {
      id: 1,
      title: "Blob Storage",
      icon: <Box className="text-blue-400" size={32} />,
      points: [
        "Stores unstructured data as objects.",
        "Ideal for images, videos, backups, logs.",
        "Supports Hot, Cool, Archive access tiers."
      ],
      color: "border-blue-500/30 bg-blue-500/10"
    },
    {
      id: 2,
      title: "File Storage",
      icon: <File className="text-emerald-400" size={32} />,
      points: [
        "Fully managed file shares in the cloud.",
        "Access via SMB or NFS.",
        "Lift & shift applications.",
        "Used by VMs and on-prem apps."
      ],
      color: "border-emerald-500/30 bg-emerald-500/10"
    },
    {
      id: 3,
      title: "Queue Storage",
      icon: <MessageSquare className="text-purple-400" size={32} />,
      points: [
        "Stores messages for asynchronous processing.",
        "First-in, first-out model (FIFO).",
        "Decouples application components."
      ],
      color: "border-purple-500/30 bg-purple-500/10"
    },
    {
      id: 4,
      title: "Table Storage",
      icon: <Table className="text-orange-400" size={32} />,
      points: [
        "NoSQL key/value store.",
        "Schema-less and highly scalable.",
        "Stores large amounts of structured data."
      ],
      color: "border-orange-500/30 bg-orange-500/10"
    },
    {
      id: 5,
      title: "Managed Disk",
      icon: <HardDrive className="text-cyan-400" size={32} />,
      points: [
        "Block-level storage for Azure VMs.",
        "Types: Standard HDD, Standard SSD, Premium SSD.",
        "High performance and durability."
      ],
      color: "border-cyan-500/30 bg-cyan-500/10"
    },
    {
      id: 6,
      title: "Storage Account",
      icon: <Database className="text-indigo-400" size={32} />,
      points: [
        "Container for all storage data objects.",
        "Unique namespace across Azure.",
        "Define redundancy, performance & access."
      ],
      color: "border-indigo-500/30 bg-indigo-500/10"
    }
  ];

  const redundancyModels = [
    {
      name: "LRS",
      fullName: "Locally Redundant Storage",
      desc: "3 copies within the same data center. Low cost. Protects against disk failures.",
      copies: 3,
      scope: "Single Data Center",
      bestFor: "Low cost, non-critical data"
    },
    {
      name: "ZRS",
      fullName: "Zone Redundant Storage",
      desc: "3 copies across Availability Zones. High availability within a region. Protects against zone failures.",
      copies: 3,
      scope: "Across Availability Zones",
      bestFor: "High availability"
    },
    {
      name: "GRS",
      fullName: "Geo Redundant Storage",
      desc: "3 copies in primary region. 3 copies in secondary region hundreds of miles away. Protects against regional failures.",
      copies: 6,
      scope: "Geo-redundant (Read-Only during failover)",
      bestFor: "DR, backup, critical data"
    },
    {
      name: "RA-GRS",
      fullName: "Read-Access Geo Redundant Storage",
      desc: "Same as GRS but provides read access to secondary region. Enables business continuity.",
      copies: 6,
      scope: "Geo-redundant (Read/Write access)",
      bestFor: "DR with read access"
    }
  ];

  return (
    <GuideLayout
      title="Azure Storage"
      intro="Durable, highly available, scalable and secure data storage for modern cloud applications."
      toc={toc}
    >

      {/* 1 */}
      <section id="storage-services" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">1. Core Storage Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storageServices.map(service => (
            <div key={service.id} className={`border rounded-xl p-6 bg-[#1a1a1a] ${service.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{service.id}</span>
                {service.icon}
                <h3 className="font-bold text-white">{service.title}</h3>
              </div>
              <ul className="space-y-2">
                {service.points.map((point, i) => (
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

      {/* 2 & 4 */}
      <section id="access-tiers" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">2. Access Tiers & Lifecycle Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Access Tiers */}
          <div className="bg-[#111] border border-[#333] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Layers className="text-blue-400" /> Access Tiers</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-red-500/30">
                <div className="bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded">Hot</div>
                <div className="text-sm text-gray-300">Frequent access, higher storage cost, lower access cost.</div>
              </div>
              <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-blue-500/30">
                <div className="bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded">Cool</div>
                <div className="text-sm text-gray-300">Infrequent access, lower storage cost, higher access cost.</div>
              </div>
              <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-lg border border-cyan-500/30">
                <div className="bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1 rounded">Archive</div>
                <div className="text-sm text-gray-300">Rare access, lowest storage cost, highest access cost, takes hours to retrieve.</div>
              </div>
            </div>
          </div>

          {/* Lifecycle */}
          <div id="lifecycle" className="bg-[#111] border border-[#333] rounded-xl p-6 scroll-mt-24">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="text-emerald-400" /> Lifecycle Management</h3>
            
            <div className="flex items-center justify-between mb-6 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
              <div className="flex flex-col items-center">
                <Box className="text-blue-400 mb-2" />
                <span className="text-xs text-gray-400">Blob Data</span>
              </div>
              <ArrowRightLeft className="text-gray-600" />
              <div className="flex flex-col items-center">
                <File className="text-emerald-400 mb-2" />
                <span className="text-xs text-gray-400">Define Policy</span>
              </div>
              <ArrowRightLeft className="text-gray-600" />
              <div className="flex flex-col gap-2">
                <div className="bg-red-500/20 text-red-400 text-[0.625rem] font-bold px-2 py-0.5 rounded text-center border border-red-500/30">Hot</div>
                <div className="bg-blue-500/20 text-blue-400 text-[0.625rem] font-bold px-2 py-0.5 rounded text-center border border-blue-500/30">Cool</div>
                <div className="bg-cyan-500/20 text-cyan-400 text-[0.625rem] font-bold px-2 py-0.5 rounded text-center border border-cyan-500/30">Archive</div>
              </div>
            </div>
            
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Automatically move data across access tiers based on rules.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Optimize cost by moving less accessed data to Cool or Archive.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> Policies based on days since last access.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="redundancy" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">3. Redundancy Options</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tl-xl">Redundancy</th>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Copies</th>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Scope</th>
                <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tr-xl">Best For</th>
              </tr>
            </thead>
            <tbody className="bg-[#111]">
              {redundancyModels.map((model, i) => (
                <tr key={i} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white mb-1">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.fullName}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{model.copies}</td>
                  <td className="py-4 px-6 text-gray-300">{model.scope}</td>
                  <td className="py-4 px-6 text-gray-300">{model.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5 */}
      <section id="summary" className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Blob = Unstructured Data</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> File = Shared File System (SMB/NFS)</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Queue = Messaging</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Table = NoSQL Data</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Choose right redundancy for durability & availability.</li>
              <li className="flex items-center gap-2"><span className="text-amber-500 font-bold">•</span> Use lifecycle management to reduce storage cost.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Use the right storage type for your workload.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Enable redundancy based on availability requirements.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Use lifecycle management to optimize storage cost.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Secure data using Azure RBAC, SAS & Encryption.</li>
              <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1 shrink-0" /> Monitor storage usage and set up alerts.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
