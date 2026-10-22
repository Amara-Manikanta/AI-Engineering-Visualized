import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Activity, Database, Lightbulb, Lightbulb as Bulb, Bell, BarChart2, Settings, LayoutDashboard, PanelTop, ArrowRight, Cloud, Server, Box, Globe, CheckSquare, Star } from 'lucide-react';

export default function AzureMonitoring() {
  const toc = [
    { label: "1. Core Services", hash: "core-services" },
    { label: "2. Telemetry & Tools", hash: "telemetry" },
    { label: "3. Architecture Flow", hash: "architecture" },
    { label: "4. Summary & Best Practices", hash: "summary" }
  ];

  const coreServices = [
    {
      id: 1,
      title: "Azure Monitor",
      icon: <Activity className="text-blue-400" size={32} />,
      points: [
        "Centralized monitoring service for Azure.",
        "Collects metrics, logs and traces from resources.",
        "Provides insights, alerts and visualizations.",
        "Supports proactive and reactive monitoring."
      ],
      color: "border-blue-500/30 bg-blue-500/10"
    },
    {
      id: 2,
      title: "Log Analytics",
      icon: <Database className="text-emerald-400" size={32} />,
      points: [
        "Log data platform in Azure Monitor.",
        "Stores and queries logs using KQL.",
        "Perform ad-hoc queries and analysis.",
        "Used for troubleshooting, compliance and reporting."
      ],
      color: "border-emerald-500/30 bg-emerald-500/10"
    },
    {
      id: 3,
      title: "Application Insights",
      icon: <Bulb className="text-purple-400" size={32} />,
      points: [
        "Monitor web apps, mobile apps and APIs.",
        "End-to-end request tracing.",
        "Performance, availability and failure analysis.",
        "Real-time telemetry and user experience monitoring."
      ],
      color: "border-purple-500/30 bg-purple-500/10"
    },
    {
      id: 4,
      title: "Alerts",
      icon: <Bell className="text-orange-400" size={32} />,
      points: [
        "Get notified on important conditions.",
        "Alert-rules on metrics, logs and activity logs.",
        "Multiple action groups: Email, SMS, Webhook, ITSM, Azure Function.",
        "Supports smart detection and dynamic thresholds."
      ],
      color: "border-orange-500/30 bg-orange-500/10"
    }
  ];

  const telemetryTools = [
    {
      id: 5,
      title: "Metrics",
      icon: <BarChart2 className="text-cyan-400" size={32} />,
      points: [
        "Numeric values that describe a resource.",
        "Platform, custom and diagnostic metrics.",
        "Real-time and historical metrics.",
        "Visualize with charts and set alerts."
      ],
      color: "border-cyan-500/30"
    },
    {
      id: 6,
      title: "Diagnostic Settings",
      icon: <Settings className="text-green-400" size={32} />,
      points: [
        "Send resource logs and metrics to destinations.",
        "Destinations: Log Analytics, Storage Account, Event Hub.",
        "Enables centralized collection and auditing."
      ],
      color: "border-green-500/30"
    },
    {
      id: 7,
      title: "Workbook",
      icon: <PanelTop className="text-pink-400" size={32} />,
      points: [
        "Interactive reports with rich visualizations.",
        "Combine text, queries, charts and parameters.",
        "Shareable and customizable.",
        "Ideal for dashboards, reports and insights."
      ],
      color: "border-pink-500/30"
    },
    {
      id: 8,
      title: "Dashboard",
      icon: <LayoutDashboard className="text-indigo-400" size={32} />,
      points: [
        "Custom dashboards with tiles and charts.",
        "Drag and drop widgets.",
        "Share and collaborate.",
        "Real-time overview of your environment."
      ],
      color: "border-indigo-500/30"
    }
  ];

  return (
    <GuideLayout
      title="Azure Monitoring"
      intro="Azure Monitoring provides a comprehensive set of services to collect, analyze and act on telemetry data from your Azure resources and applications."
      toc={toc}
    >

      {/* 1 */}
      <section id="core-services" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Monitoring Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreServices.map(service => (
            <div key={service.id} className={`border rounded-xl p-5 bg-[#111] ${service.color}`}>
              <div className="flex items-center justify-between mb-4">
                {service.icon}
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{service.id}</span>
              </div>
              <h3 className="font-bold text-white mb-3 text-lg leading-tight">{service.title}</h3>
              <ul className="space-y-1 text-xs text-gray-300">
                {service.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-gray-500 mt-0.5">-</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 2 */}
      <section id="telemetry" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-cyan-500/20 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Telemetry & Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {telemetryTools.map(tool => (
            <div key={tool.id} className={`border rounded-xl p-5 bg-[#1a1a1a] ${tool.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {tool.icon}
                  <h3 className="font-bold text-white">{tool.title}</h3>
                </div>
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{tool.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                {tool.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-600 mt-0.5">•</span>
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
          Azure Monitoring Architecture
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto">
          <div className="min-w-[900px] flex items-stretch justify-between gap-6">
            
            {/* Data Sources */}
            <div className="w-48 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shrink-0 flex flex-col justify-center">
              <h4 className="text-center font-bold text-gray-300 text-sm mb-4">Data Sources</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400"><Cloud className="text-blue-400" size={16}/> Azure Resources</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Globe className="text-indigo-400" size={16}/> Applications</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Server className="text-purple-400" size={16}/> Virtual Machines</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Box className="text-emerald-400" size={16}/> Containers (AKS)</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Database className="text-orange-400" size={16}/> Databases</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Server className="text-gray-400" size={16}/> On-premises</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Azure Monitor Core */}
            <div className="flex-1 flex flex-col gap-4 min-w-[400px]">
              
              {/* Top: Azure Monitor */}
              <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Activity className="text-blue-400" />
                  <span className="font-bold text-blue-400">Azure Monitor</span>
                </div>
                
                <div className="flex justify-around items-center">
                  <div className="flex flex-col items-center gap-1">
                    <Database size={20} className="text-gray-400"/>
                    <span className="text-[0.625rem] text-gray-400">Collect</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Database size={20} className="text-gray-400"/>
                    <span className="text-[0.625rem] text-gray-400">Store</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BarChart2 size={20} className="text-gray-400"/>
                    <span className="text-[0.625rem] text-gray-400">Analyze</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <LayoutDashboard size={20} className="text-gray-400"/>
                    <span className="text-[0.625rem] text-gray-400">Visualize</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Settings size={20} className="text-gray-400"/>
                    <span className="text-[0.625rem] text-gray-400">Act</span>
                  </div>
                </div>
              </div>

              {/* Bottom: Data Platform */}
              <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-4 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-xs text-gray-500">↓</div>
                <h4 className="font-bold text-emerald-400 text-sm mb-4">Data Platform</h4>
                <div className="flex justify-around items-center">
                  <div className="flex flex-col items-center gap-1">
                    <BarChart2 size={20} className="text-cyan-400"/>
                    <span className="text-[0.625rem] text-gray-400">Metrics</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Database size={20} className="text-blue-400"/>
                    <span className="text-[0.625rem] text-gray-400">Logs</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bulb size={20} className="text-purple-400"/>
                    <span className="text-[0.625rem] text-gray-400">Traces</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Activity size={20} className="text-green-400"/>
                    <span className="text-[0.625rem] text-gray-400">Activity Logs</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Bell size={20} className="text-orange-400"/>
                    <span className="text-[0.625rem] text-gray-400">Alerts</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="text-gray-600 border border-gray-600 border-dashed rounded-full" />
            </div>

            {/* Outputs & Actions */}
            <div className="w-48 bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 shrink-0 flex flex-col justify-center">
              <h4 className="text-center font-bold text-gray-300 text-sm mb-4">Outputs & Actions</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400"><LayoutDashboard className="text-blue-400" size={16}/> Dashboards</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><PanelTop className="text-emerald-400" size={16}/> Workbooks</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Bell className="text-orange-400" size={16}/> Alerts & Notifications</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Settings className="text-purple-400" size={16}/> Automation</div>
                <div className="flex items-center gap-2 text-xs text-gray-400"><Globe className="text-cyan-400" size={16}/> Integration (ITSM)</div>
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
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Monitoring helps detect issues before they impact users.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Use Log Analytics for deep dive and custom queries.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Application Insights for application performance monitoring.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Enable Diagnostic Settings for all critical resources.</li>
              <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span> Alerts reduce MTTR (Mean Time To Resolve).</li>
            </ul>
          </div>
          
          <div className="bg-emerald-900/10 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-emerald-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Star size={24} /> Best Practices</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Enable Azure Monitor for all subscriptions.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Centralize logs in Log Analytics Workspace.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Use Application Insights for user-facing applications.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Create meaningful dashboards and workbooks.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Set alerts for critical metrics and logs.</li>
              <li className="flex items-start gap-2"><CheckSquare size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Review and optimize retention to control costs.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
