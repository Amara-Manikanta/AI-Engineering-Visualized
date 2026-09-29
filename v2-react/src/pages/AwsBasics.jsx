import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Cloud, Server, Database, Shield, Network, Globe, MapPin, Building, Lightbulb, Star, Zap, HardDrive } from 'lucide-react';

export default function AwsBasics() {
  const toc = [
    { label: "1. What is Cloud & AWS?", hash: "what-is-aws" },
    { label: "2. Why AWS & Benefits", hash: "why-aws" },
    { label: "3. Global Infrastructure", hash: "infrastructure" },
    { label: "4. Top AWS Services", hash: "top-services" }
  ];

  const basics = [
    {
      id: 1,
      title: "What is Cloud Computing?",
      points: [
        "Delivery of IT services over the internet.",
        "On-demand resources, pay-as-you-go.",
        "No need to manage physical hardware."
      ]
    },
    {
      id: 2,
      title: "What is AWS?",
      points: [
        "AWS (Amazon Web Services) is a comprehensive cloud platform.",
        "Offers 200+ fully featured services.",
        "Global, reliable, secure and scalable."
      ]
    }
  ];

  const whyAndBenefits = [
    {
      id: 3,
      title: "Why Companies Use AWS?",
      points: [
        "Reduce infrastructure cost",
        "Rapid innovation and agility",
        "Scalable and flexible resources",
        "High availability and reliability",
        "Global reach in minutes"
      ]
    },
    {
      id: 4,
      title: "Benefits of AWS",
      points: [
        "Pay-as-you-go pricing",
        "Elasticity & Scalability",
        "High Availability",
        "Security & Compliance",
        "Wide range of services"
      ]
    }
  ];

  const infra = [
    { title: "Regions", desc: "Separate geographic areas.", icon: <Globe className="text-blue-400" size={24}/> },
    { title: "Availability Zones (AZ)", desc: "Multiple data centers in each region.", icon: <Building className="text-emerald-400" size={24}/> },
    { title: "Edge Locations", desc: "CDN for fast content delivery.", icon: <Network className="text-purple-400" size={24}/> },
    { title: "Local & Wavelength Zones", desc: "Closer to users for low latency.", icon: <MapPin className="text-red-400" size={24}/> },
    { title: "Multiple Data Centers", desc: "Powering millions of applications worldwide.", icon: <Server className="text-cyan-400" size={24}/> }
  ];

  const topServices = [
    { name: "EC2", icon: <Server className="text-orange-500" size={32}/> },
    { name: "S3", icon: <Database className="text-green-500" size={32}/> },
    { name: "RDS", icon: <HardDrive className="text-blue-500" size={32}/> },
    { name: "Lambda", icon: <Zap className="text-yellow-500" size={32}/> },
    { name: "VPC", icon: <Cloud className="text-purple-500" size={32}/> }
  ];

  return (
    <GuideLayout
      title="AWS Basics"
      intro="Amazon Web Services is the world's most popular cloud platform. Build, deploy and scale applications on the cloud."
      toc={toc}
    >
      {/* 1 */}
      <section id="what-is-aws" className="mb-12 border-b border-[#333] pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {basics.map(item => (
              <div key={item.id} className="bg-[#111] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#1a1a1a] text-gray-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-gray-700">{item.id}</div>
                <h3 className="text-xl font-bold text-orange-400 mb-4">{item.title}</h3>
                <ul className="space-y-2">
                  {item.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center">
            <Cloud className="text-orange-500 mb-4" size={64} />
            <span className="font-bold text-white text-xl mb-8">aws</span>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <Server className="text-gray-400" size={24} />
                <span className="text-xs text-gray-500">Compute</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Database className="text-gray-400" size={24} />
                <span className="text-xs text-gray-500">Storage</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="text-gray-400" size={24} />
                <span className="text-xs text-gray-500">Security</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Network className="text-gray-400" size={24} />
                <span className="text-xs text-gray-500">Networking</span>
              </div>
            </div>
            <div className="w-full h-px bg-gray-700 my-4 border-dashed border-t"></div>
            <span className="text-xs text-gray-400 text-center">Cloud computing abstractions</span>
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="why-aws" className="mb-12 border-b border-[#333] pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {whyAndBenefits.map(item => (
            <div key={item.id} className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                <h3 className="text-xl font-bold text-orange-400">{item.title}</h3>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">{item.id}</span>
              </div>
              <ul className="space-y-2">
                {item.points.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 3 */}
      <section id="infrastructure" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white">AWS Global Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {infra.map((item, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 flex flex-col items-center text-center gap-3">
              <div className="bg-[#111] p-3 rounded-full border border-gray-800">
                {item.icon}
              </div>
              <h4 className="font-bold text-gray-200">{item.title}</h4>
              <p className="text-xs text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4 */}
      <section id="top-services" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">Top AWS Services <Star className="text-yellow-400" size={24}/></h2>
        <div className="flex flex-wrap gap-6 mb-12">
          {topServices.map((svc, i) => (
            <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center w-32 h-32 hover:border-orange-500/50 transition-colors">
              <div className="mb-3">{svc.icon}</div>
              <span className="font-bold text-gray-300">{svc.name}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-green-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> You don't manage infrastructure.</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> You focus on building the business.</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> AWS handles the heavy lifting.</li>
            </ul>
          </div>
          
          <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> PRO TIP</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Start Small, Scale as You Grow.</li>
              <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Use Managed Services whenever possible.</li>
              <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Monitor cost and optimize resources.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
