import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Globe, ArrowRightLeft, LayoutDashboard, CopyPlus, Globe2, Lock, Activity, GitBranch, Terminal, Cloud, CheckSquare, Lightbulb, Star, RefreshCw, Package, GitMerge, ArrowRight } from 'lucide-react';

export default function AzureAppService() {
  const toc = [
    { label: "1. Core Features", hash: "core-features" },
    { label: "2. Configuration & Monitoring", hash: "config-monitoring" },
    { label: "3. Deployment Options", hash: "deployment" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const features = [
    {
      id: 1,
      title: "Web Apps",
      icon: <Globe className="text-blue-400" size={32} />,
      points: [
        "Host web applications, APIs and mobile backends.",
        "Supports .NET, Java, Node.js, Python, PHP, Go, etc.",
        "Automatic scaling and built-in load balancing.",
        "Integrated with Azure services."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Deployment Slots",
      icon: <ArrowRightLeft className="text-emerald-400" size={32} />,
      points: [
        "Create multiple slots in the same App.",
        "Test changes in Staging/Demo slot.",
        "Swap with Production slot in one click.",
        "Zero-downtime deployments."
      ],
      color: "border-emerald-500/30"
    },
    {
      id: 3,
      title: "App Service Plan",
      icon: <LayoutDashboard className="text-purple-400" size={32} />,
      points: [
        "Defines compute resources for your app.",
        "Pricing tiers: Free, Shared, Basic, Standard, Premium (V2/V3).",
        "All apps in a plan share the resources."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 4,
      title: "Scaling",
      icon: <CopyPlus className="text-orange-400" size={32} />,
      points: [
        "Scale Up - Increase size (CPU/RAM).",
        "Scale Out - Add more instances.",
        "Scale In - Reduce instances to save cost.",
        "Supports manual and auto scaling rules."
      ],
      color: "border-orange-500/30"
    }
  ];

  const configMon = [
    {
      id: 5,
      title: "Custom Domain",
      icon: <Globe2 className="text-cyan-400" size={32} />,
      points: [
        "Map your custom domain to App Service.",
        "Update DNS with CNAME record.",
        "Supports apex domain and subdomain."
      ],
      color: "border-cyan-500/30"
    },
    {
      id: 6,
      title: "SSL (HTTPS)",
      icon: <Lock className="text-green-400" size={32} />,
      points: [
        "Enable HTTPS for secure access.",
        "Use Free SSL (App Service Managed Certificate).",
        "Or integrate with Azure Key Vault for custom SSL.",
        "Auto-renewal supported."
      ],
      color: "border-green-500/30"
    },
    {
      id: 7,
      title: "Monitoring",
      icon: <Activity className="text-pink-400" size={32} />,
      points: [
        "Built-in Application Insights.",
        "Real-time logs and metrics.",
        "Performance monitoring.",
        "Custom alerts and dashboards.",
        "Log Analytics integration."
      ],
      color: "border-pink-500/30"
    }
  ];

  return (
    <GuideLayout
      title="Azure App Service"
      intro="Azure App Service is a fully managed platform for building, deploying and scaling web, mobile and API applications in the cloud."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-features" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(feature => (
            <div key={feature.id} className={`border rounded-xl p-6 bg-[#111] ${feature.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{feature.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
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
      <section id="config-monitoring" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-cyan-500/20 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Configuration & Monitoring
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {configMon.map(config => (
            <div key={config.id} className={`border rounded-xl p-6 bg-[#111] ${config.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <h3 className="font-bold text-white">{config.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{config.id}</span>
              </div>
              <ul className="space-y-1 text-xs text-gray-400">
                {config.points.map((point, i) => (
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
      <section id="deployment" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Deployment Options & CI/CD
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-800">
            <h3 className="font-bold text-gray-300">Supported Deployment Sources</h3>
            <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">8</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center mb-12">
            <div className="flex flex-col items-center gap-2">
              <GitBranch className="text-white" size={32} />
              <span className="text-xs text-gray-400">GitHub Actions</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="text-blue-500" size={32} />
              <span className="text-xs text-gray-400">Azure DevOps</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <GitMerge className="text-orange-500" size={32} />
              <span className="text-xs text-gray-400">Git Repo</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Globe className="text-cyan-400" size={32} />
              <span className="text-xs text-gray-400">FTP / FTPS</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Package className="text-yellow-500" size={32} />
              <span className="text-xs text-gray-400">ZIP Deploy</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LayoutDashboard className="text-blue-400" size={32} />
              <span className="text-xs text-gray-400">Docker</span>
            </div>
          </div>

          <h3 className="font-bold text-gray-300 text-center mb-6">CI/CD Pipeline for Continuous Delivery</h3>
          
          <div className="flex items-center justify-between overflow-x-auto">
            <div className="min-w-[600px] flex items-center justify-between w-full">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                  <Terminal className="text-gray-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400">Code</span>
              </div>
              
              <ArrowRight className="text-gray-600 shrink-0" />

              <div className="flex flex-col items-center gap-2">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                  <RefreshCw className="text-blue-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400">Build</span>
              </div>

              <ArrowRight className="text-gray-600 shrink-0" />

              <div className="flex flex-col items-center gap-2">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                  <CheckSquare className="text-green-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400">Test</span>
              </div>

              <ArrowRight className="text-gray-600 shrink-0" />

              <div className="flex flex-col items-center gap-2">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                  <Cloud className="text-purple-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400">Deploy</span>
              </div>

              <ArrowRight className="text-gray-600 shrink-0" />

              <div className="flex flex-col items-center gap-2">
                <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30">
                  <Globe className="text-blue-400" size={32} />
                </div>
                <span className="text-sm font-bold text-blue-400">App Service</span>
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
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> App Service is a PaaS offering.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> It abstracts infrastructure management.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Apps run in App Service Plan.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Supports multiple languages and frameworks.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Focus on code, not on servers.</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use appropriate App Service Plan for your workload.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable HTTPS and enforce secure connections.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Deployment Slots for safe releases.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Auto Scaling for scalability and cost optimization.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Monitor with Application Insights and set alerts.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Managed Identity for secure access to Azure resources.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Regularly review logs, metrics and performance.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
