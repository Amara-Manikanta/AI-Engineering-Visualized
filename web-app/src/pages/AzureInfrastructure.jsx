import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { Globe, Server, MapPin, Building, Lightbulb, Star, ArrowRightLeft, Radio, Network, Database } from 'lucide-react';

export default function AzureInfrastructure() {
  const toc = [
    { label: "1. Regions", hash: "regions" },
    { label: "2. Availability Zones", hash: "availability-zones" },
    { label: "3. Region Pair", hash: "region-pair" },
    { label: "4. Edge Zones", hash: "edge-zones" },
    { label: "5. Availability Sets", hash: "availability-sets" },
    { label: "6. Real-world Example", hash: "real-world" },
    { label: "7. Summary & Best Practices", hash: "summary" }
  ];

  return (
    <GuideLayout
      title="Azure Global Infrastructure"
      intro="Azure provides a global network of data centers to build highly available, scalable and resilient applications."
      toc={toc}
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* 1 */}
        <section id="regions" className="bg-[#111] border border-[#333] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Regions
          </h2>
          <div className="flex gap-4">
            <Globe className="text-blue-400 shrink-0" size={48} />
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span>•</span> A geographical area that contains one or more data centers.</li>
              <li className="flex gap-2"><span>•</span> Azure has 60+ regions worldwide, more than any other cloud provider.</li>
            </ul>
          </div>
        </section>

        {/* 2 */}
        <section id="availability-zones" className="bg-[#111] border border-[#333] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Availability Zones
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-center gap-4 py-2 border-b border-gray-800">
              {[1, 2, 3].map(z => (
                <div key={z} className="flex flex-col items-center">
                  <span className="text-xs font-bold text-gray-400 mb-1">AZ {z}</span>
                  <Building className="text-emerald-500" size={32} />
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span>•</span> Physically separate data centers within a region.</li>
              <li className="flex gap-2"><span>•</span> Protects applications from complete data center failures (power, cooling, network).</li>
            </ul>
          </div>
        </section>

        {/* 3 */}
        <section id="region-pair" className="bg-[#111] border border-[#333] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            Region Pair
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center px-4 py-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="flex flex-col items-center">
                <MapPin className="text-purple-400 mb-1" />
                <span className="text-xs text-gray-400">Primary Region</span>
              </div>
              <ArrowRightLeft className="text-gray-600 border-b border-dashed border-gray-600 pb-1" />
              <div className="flex flex-col items-center">
                <MapPin className="text-purple-400 mb-1" />
                <span className="text-xs text-gray-400">Paired Region</span>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span>•</span> Each region is paired with another region hundreds of miles away (e.g., East US & West US).</li>
              <li className="flex gap-2"><span>•</span> Used for geo-redundant storage and disaster recovery (DR).</li>
            </ul>
          </div>
        </section>

        {/* 4 */}
        <section id="edge-zones" className="bg-[#111] border border-[#333] rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            Edge Zones
          </h2>
          <div className="flex gap-4">
            <Radio className="text-orange-400 shrink-0" size={48} />
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-2"><span>•</span> Located closer to end users.</li>
              <li className="flex gap-2"><span>•</span> Extends Azure services to the edge of the network.</li>
              <li className="flex gap-2"><span>•</span> Ideal for low-latency, real-time applications (5G, IoT).</li>
            </ul>
          </div>
        </section>
      </div>

      {/* 5 */}
      <section id="availability-sets" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-indigo-500/20 text-indigo-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
          Availability Sets
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8 bg-[#111] border border-gray-800 rounded-xl p-8">
          <div className="flex gap-4 p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-xl">
            {[1, 2, 3].map(v => (
              <div key={v} className="flex flex-col items-center bg-[#1a1a1a] p-3 rounded-lg border border-gray-700">
                <span className="text-xs font-bold text-gray-300 mb-2">VM {v}</span>
                <Server className="text-indigo-400" size={24} />
              </div>
            ))}
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-gray-300">Availability Sets provide redundancy within a single datacenter.</p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div> Distributes VMs across <strong className="text-gray-200">Fault Domains</strong> (different power/network racks).</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div> Distributes VMs across <strong className="text-gray-200">Update Domains</strong> (prevents all VMs rebooting at once during patches).</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div> Protects against localized hardware failures and maintenance updates.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6 */}
      <section id="real-world" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-cyan-500/20 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
          Real-world Architecture Example
        </h2>
        
        {/* Animated Architecture Diagram */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-hidden relative">
          <div className="flex flex-col items-center max-w-3xl mx-auto space-y-8">
            
            <div className="flex flex-col items-center">
              <Globe className="text-gray-400 mb-2" />
              <div className="text-xs font-mono text-gray-500">Internet</div>
            </div>

            <div className="h-8 w-px bg-cyan-500/50"></div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-cyan-900/30 border border-cyan-500/50 px-6 py-3 rounded-xl flex items-center gap-3 text-cyan-400"
            >
              <Network size={20} />
              <span className="font-bold">Azure Front Door</span>
            </motion.div>

            <div className="flex w-full justify-between max-w-xl">
              <div className="h-16 w-px bg-cyan-500/50 -rotate-[30deg] origin-top"></div>
              <div className="h-16 w-px bg-cyan-500/50 rotate-[30deg] origin-top"></div>
            </div>

            <div className="flex w-full gap-8 justify-center items-start">
              {/* Primary Region */}
              <div className="flex-1 border border-gray-700 bg-[#1a1a1a] rounded-xl p-4">
                <div className="text-xs font-bold text-gray-400 mb-4 text-center border-b border-gray-700 pb-2">Region: East US</div>
                <div className="flex justify-around mb-4">
                  <div className="bg-emerald-900/30 border border-emerald-500/30 px-2 py-1 text-xs rounded text-emerald-400">AZ 1</div>
                  <div className="bg-emerald-900/30 border border-emerald-500/30 px-2 py-1 text-xs rounded text-emerald-400">AZ 2</div>
                  <div className="bg-emerald-900/30 border border-emerald-500/30 px-2 py-1 text-xs rounded text-emerald-400">AZ 3</div>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/30 p-2 text-center rounded text-sm text-blue-400 mb-4">
                  VNET
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-6 w-px bg-gray-600 mb-2"></div>
                  <Database className="text-purple-400" size={32} />
                </div>
              </div>

              {/* Geo-Replication Arrow */}
              <div className="flex flex-col items-center justify-center h-full pt-20">
                <div className="text-[0.625rem] text-gray-500 uppercase tracking-wider mb-2">Geo-Replication</div>
                <div className="flex items-center text-gray-600">
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  <div className="w-16 border-b border-dashed border-gray-600"></div>
                </div>
              </div>

              {/* Secondary Region */}
              <div className="flex-1 border border-gray-700 bg-[#1a1a1a] rounded-xl p-4 opacity-75">
                <div className="text-xs font-bold text-gray-400 mb-4 text-center border-b border-gray-700 pb-2">Region: West Europe</div>
                <div className="flex justify-around mb-4">
                  <div className="bg-emerald-900/20 border border-emerald-500/20 px-2 py-1 text-xs rounded text-emerald-400/70">AZ 1</div>
                  <div className="bg-emerald-900/20 border border-emerald-500/20 px-2 py-1 text-xs rounded text-emerald-400/70">AZ 2</div>
                  <div className="bg-emerald-900/20 border border-emerald-500/20 px-2 py-1 text-xs rounded text-emerald-400/70">AZ 3</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/20 p-2 text-center rounded text-sm text-blue-400/70 mb-4">
                  VNET
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-6 w-px bg-gray-600 mb-2"></div>
                  <Database className="text-purple-400/70" size={32} />
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-purple-400 mt-2">Azure SQL Database (Geo-Replicated)</div>

          </div>
        </div>
      </section>

      {/* 7 */}
      <section id="summary" className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-900/10 border border-amber-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-amber-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> Remember</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center gap-2"><span>•</span> <strong className="text-gray-200">Regions</strong> = Geographical areas.</li>
              <li className="flex items-center gap-2"><span>•</span> <strong className="text-gray-200">Zones</strong> = Data center level HA.</li>
              <li className="flex items-center gap-2"><span>•</span> <strong className="text-gray-200">Region Pair</strong> = DR & Geo-redundancy.</li>
              <li className="flex items-center gap-2"><span>•</span> <strong className="text-gray-200">Edge Zones</strong> = Low latency at the edge.</li>
              <li className="flex items-center gap-2"><span>•</span> <strong className="text-gray-200">Design for</strong> High Availability & Resilience.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span>☑️</span> Use Availability Zones for production workloads.</li>
              <li className="flex items-start gap-2"><span>☑️</span> Enable Geo-redundant storage.</li>
              <li className="flex items-start gap-2"><span>☑️</span> Keep critical data and apps in paired regions.</li>
              <li className="flex items-start gap-2"><span>☑️</span> Use Edge Zones for real-time applications.</li>
              <li className="flex items-start gap-2"><span>☑️</span> Regularly review and test your DR strategy.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
