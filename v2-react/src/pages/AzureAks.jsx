import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Container, Server, Settings, Box, Network, Route, ArrowUpRight, CopyPlus, CheckSquare, Lightbulb, Star, ArrowRight } from 'lucide-react';

export default function AzureAks() {
  const toc = [
    { label: "1. Core AKS Architecture", hash: "architecture" },
    { label: "2. Workloads & Networking", hash: "workloads" },
    { label: "3. Scaling & CNI", hash: "scaling" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const architecture = [
    {
      id: 2,
      title: "Node Pool",
      icon: <Server className="text-emerald-400" size={32} />,
      points: [
        "Group of nodes with the same configuration.",
        "System node pool (default) runs AKS system pods.",
        "User node pools for application workloads.",
        "Supports multiple node pools with different sizes and OS."
      ],
      color: "border-emerald-500/30 bg-[#1a1a1a]"
    },
    {
      id: 3,
      title: "Control Plane",
      icon: <Settings className="text-purple-400" size={32} />,
      points: [
        "Fully managed by Azure.",
        "Handles scheduling, API server, etcd, controller manager.",
        "Highly available and automatically upgraded.",
        "Not accessible directly from the internet (private by default)."
      ],
      color: "border-purple-500/30 bg-[#1a1a1a]"
    }
  ];

  const workloads = [
    {
      id: 4,
      title: "Pods",
      icon: <Box className="text-green-400" size={32} />,
      points: [
        "Smallest deployable unit in Kubernetes.",
        "One or more containers that share network and storage.",
        "Pods are ephemeral and replaceable."
      ],
      color: "border-green-500/30"
    },
    {
      id: 5,
      title: "Service",
      icon: <Network className="text-blue-400" size={32} />,
      points: [
        "Provides stable IP and DNS name to access pods.",
        "Types: ClusterIP, NodePort, LoadBalancer, ExternalName.",
        "Load balances traffic across pods."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 6,
      title: "Ingress",
      icon: <Route className="text-orange-400" size={32} />,
      points: [
        "Manages external HTTP/HTTPS access.",
        "Routes traffic to services based on host/path.",
        "Uses Ingress Controller (NGINX, AGIC).",
        "Supports TLS termination."
      ],
      color: "border-orange-500/30"
    }
  ];

  const scaling = [
    {
      id: 7,
      title: "HPA (Horizontal Pod Autoscaler)",
      icon: <ArrowUpRight className="text-pink-400" size={32} />,
      points: [
        "Automatically scales pods based on CPU/Memory or custom metrics.",
        "Maintains application performance and reduces cost.",
        "Works with metrics server."
      ],
      color: "border-pink-500/30"
    },
    {
      id: 8,
      title: "Cluster Autoscaler",
      icon: <CopyPlus className="text-cyan-400" size={32} />,
      points: [
        "Automatically adjusts the number of nodes in the node pool based on pod demand.",
        "Ensures enough capacity for pods to run.",
        "Optimizes cost by removing unused nodes."
      ],
      color: "border-cyan-500/30"
    }
  ];

  const networkOptions = [
    { feature: "Pod IP", cni: "Azure VNet IP", kubenet: "Kubernetes CIDR" },
    { feature: "Network Policy", cni: "Azure Network Policy", kubenet: "Limited (Calico only)" },
    { feature: "Performance", cni: "Higher", kubenet: "Lower" },
    { feature: "SNAT", cni: "Not required", kubenet: "Required (Node SNAT)" },
    { feature: "Best For", cni: "Production workloads", kubenet: "Simple / Dev workloads" }
  ];

  return (
    <GuideLayout
      title="Azure Kubernetes Service (AKS)"
      intro="AKS is a fully managed Kubernetes service on Azure that makes it easy to deploy, manage and scale containerized applications."
      toc={toc}
    >

      {/* 1 */}
      <section id="architecture" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          AKS Architecture & Core Components
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="lg:col-span-1 bg-[#111] border border-blue-500/30 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white flex items-center gap-2"><Container className="text-blue-400" /> AKS Architecture</h3>
              <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">1</span>
            </div>
            
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 relative mb-4">
              <div className="absolute top-2 left-2 text-[0.625rem] text-gray-500 font-bold uppercase">Azure Region</div>
              
              <div className="mt-4 bg-purple-500/20 border border-purple-500/30 rounded p-3 mb-4 text-center">
                <Settings className="text-purple-400 mx-auto mb-1" size={20} />
                <span className="text-xs text-purple-400 font-bold">Control Plane</span><br/>
                <span className="text-[0.625rem] text-gray-400">(Microsoft Managed)</span>
              </div>
              
              <div className="flex justify-center gap-2 mb-4">
                <ArrowRight className="text-gray-600 rotate-90" size={16} />
                <ArrowRight className="text-gray-600 rotate-90" size={16} />
              </div>
              
              <div className="border border-dashed border-emerald-500/50 rounded p-3 mb-2">
                <div className="text-[0.625rem] text-emerald-500 font-bold mb-2 text-center uppercase">Node Pools (Worker Nodes)</div>
                <div className="flex justify-between gap-2">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded p-2 flex-1 text-center text-emerald-400 text-xs">Node</div>
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded p-2 flex-1 text-center text-emerald-400 text-xs">Node</div>
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded p-2 flex-1 text-center text-emerald-400 text-xs">Node</div>
                </div>
              </div>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-2 text-center text-cyan-400 text-xs font-bold">
                Azure VNet
              </div>
            </div>
            <ul className="space-y-1 text-xs text-gray-400 mt-4">
              <li>- Managed control plane by Microsoft.</li>
              <li>- Worker nodes run your containers.</li>
              <li>- Integrated with Azure services.</li>
              <li>- High availability across zones.</li>
            </ul>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {architecture.map(arch => (
              <div key={arch.id} className={`border rounded-xl p-5 ${arch.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {arch.icon}
                    <h3 className="font-bold text-white">{arch.title}</h3>
                  </div>
                  <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{arch.id}</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-400">
                  {arch.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-gray-600 mt-0.5">-</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="workloads" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Workloads & Networking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workloads.map(workload => (
            <div key={workload.id} className={`border rounded-xl p-6 bg-[#111] ${workload.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {workload.icon}
                  <h3 className="font-bold text-white text-lg">{workload.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{workload.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {workload.points.map((point, i) => (
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

      {/* 3 */}
      <section id="scaling" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-pink-500/20 text-pink-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Scaling & CNI Comparison
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {scaling.map(scale => (
            <div key={scale.id} className={`border rounded-xl p-6 bg-[#111] ${scale.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {scale.icon}
                  <h3 className="font-bold text-white text-lg">{scale.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{scale.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {scale.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white">11. Key AKS Networking Options Comparison</h3>
            <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">11</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tl-xl">Feature</th>
                  <th className="py-4 px-6 bg-blue-900/20 border-b border-blue-500/30 text-blue-400 font-bold">Azure CNI</th>
                  <th className="py-4 px-6 bg-[#1a1a1a] border-b border-gray-700 text-gray-300 font-bold rounded-tr-xl">Kubenet</th>
                </tr>
              </thead>
              <tbody>
                {networkOptions.map((model, i) => (
                  <tr key={i} className="border-b border-[#222]">
                    <td className="py-4 px-6 text-gray-300 font-medium">{model.feature}</td>
                    <td className="py-4 px-6 bg-blue-900/10 text-blue-300">{model.cni}</td>
                    <td className="py-4 px-6 text-gray-400">{model.kubenet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> AKS = Managed Kubernetes on Azure.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Control Plane is managed by Microsoft.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Pods are ephemeral; use Deployments for resilience.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Services provide stable access to pods.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Ingress exposes HTTP/HTTPS applications.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> HPA scales pods; Cluster Autoscaler scales nodes.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Azure CNI is recommended for production.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use multiple node pools for different workload types.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Auto Upgrades and Node Image Auto Patching.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Azure Monitor and Container Insights for observability.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Network Policy (Azure CNI) for security.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Managed Identities for pod-to-Azure resource access.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Store secrets in Azure Key Vault using CSI Driver.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Regularly review RBAC roles and cluster access.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Plan for backups and DR (Velero, etc.).</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
