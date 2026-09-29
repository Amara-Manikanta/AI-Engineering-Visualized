import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Database, HardDrive, FolderOpen, Snowflake, Lightbulb, Star, CheckSquare } from 'lucide-react';

export default function AwsStorage() {
  const toc = [
    { label: "1. Core Storage Services", hash: "core-services" },
    { label: "2. Storage Comparison", hash: "comparison" },
    { label: "3. When to Use Which?", hash: "when-to-use" }
  ];

  const services = [
    {
      id: 1,
      title: "S3",
      icon: <Database className="text-green-500" size={32} />,
      points: [
        "Object storage",
        "Highly scalable",
        "99.999999999% durability",
        "For any type of data"
      ],
      color: "border-green-500/30 bg-[#1a1a1a]"
    },
    {
      id: 2,
      title: "EBS",
      icon: <HardDrive className="text-orange-500" size={32} />,
      points: [
        "Block storage",
        "For EC2 instances",
        "High performance",
        "Data tied to AZ"
      ],
      color: "border-orange-500/30 bg-[#1a1a1a]"
    },
    {
      id: 3,
      title: "EFS",
      icon: <FolderOpen className="text-purple-400" size={32} />,
      points: [
        "File storage",
        "Shared across multiple instances",
        "Auto scaling",
        "Used with Linux"
      ],
      color: "border-purple-500/30 bg-[#1a1a1a]"
    },
    {
      id: 4,
      title: "Glacier",
      icon: <Snowflake className="text-cyan-400" size={32} />,
      points: [
        "Archive storage",
        "Very low cost",
        "Data retrieval takes minutes-hours",
        "For backup & archive"
      ],
      color: "border-cyan-500/30 bg-[#1a1a1a]"
    }
  ];

  const comparisonData = [
    { srv: "S3", type: "Object", access: "Internet (HTTP/HTTPS)", durability: "11 9's", performance: "High", useCase: "Static websites, backups, media", cost: "$" },
    { srv: "EBS", type: "Block", access: "EC2 (Attached)", durability: "99.999%", performance: "High", useCase: "OS, databases, low latency apps", cost: "$$" },
    { srv: "EFS", type: "File", access: "NFS (Shared)", durability: "99.999%", performance: "Medium", useCase: "Shared files, content mgmt", cost: "$$" },
    { srv: "Glacier", type: "Archive", access: "Internet (Retrieval)", durability: "11 9's", performance: "Low", useCase: "Long-term backup, compliance", cost: "$" }
  ];

  const whenToUse = [
    {
      title: "S3",
      icon: <Database className="text-green-500 mb-2" size={32} />,
      desc: "Use for objects, backups, logs, static content, data lakes.",
      color: "border-green-500/30 text-green-400"
    },
    {
      title: "EBS",
      icon: <HardDrive className="text-orange-500 mb-2" size={32} />,
      desc: "Use for EC2 boot volumes, databases, high performance apps.",
      color: "border-orange-500/30 text-orange-400"
    },
    {
      title: "EFS",
      icon: <FolderOpen className="text-purple-400 mb-2" size={32} />,
      desc: "Use for shared file systems across multiple EC2 instances.",
      color: "border-purple-500/30 text-purple-400"
    },
    {
      title: "Glacier",
      icon: <Snowflake className="text-cyan-400 mb-2" size={32} />,
      desc: "Use for long-term archives, compliance, cold data storage.",
      color: "border-cyan-500/30 text-cyan-400"
    }
  ];

  return (
    <GuideLayout
      title="Storage Services"
      intro="AWS provides secure, durable and scalable storage solutions for every type of data."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-services" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Storage Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(srv => (
            <div key={srv.id} className={`border rounded-xl p-6 ${srv.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {srv.icon}
                  <h3 className="font-bold text-white text-lg">{srv.title}</h3>
                </div>
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{srv.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {srv.points.map((point, i) => (
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
      <section id="comparison" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Storage Comparison
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Service</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Type</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Access</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Durability</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Performance</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Use Case</th>
                  <th className="py-3 px-4 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-[#222]">
                    <td className={`py-4 px-4 font-bold 
                      ${row.srv === 'S3' ? 'text-green-500' : ''}
                      ${row.srv === 'EBS' ? 'text-orange-500' : ''}
                      ${row.srv === 'EFS' ? 'text-purple-400' : ''}
                      ${row.srv === 'Glacier' ? 'text-cyan-400' : ''}
                    `}>{row.srv}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{row.type}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{row.access}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{row.durability}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{row.performance}</td>
                    <td className="py-4 px-4 text-gray-400 text-xs">{row.useCase}</td>
                    <td className="py-4 px-4 text-green-400 font-mono">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="when-to-use" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          When to Use Which?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {whenToUse.map((item, i) => (
            <div key={i} className={`bg-[#111] border rounded-xl p-6 flex flex-col items-center text-center ${item.color}`}>
              {item.icon}
              <h4 className="font-bold mb-2">{item.title}</h4>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-green-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> S3 = Object Storage (Internet scale)</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> EBS = Block Storage (EC2)</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> EFS = File Storage (Shared)</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Glacier = Archive Storage (Low cost)</li>
            </ul>
          </div>
          
          <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> BEST PRACTICE</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Choose the right storage for the right workload.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Use Lifecycle policies in S3 to reduce costs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare size={16} className="text-orange-500 mt-0.5 shrink-0" /> 
                <span>Encrypt data at rest and in transit.</span>
              </li>
            </ul>
          </div>
          
        </div>
      </section>

    </GuideLayout>
  );
}
