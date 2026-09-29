import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Cpu, Server, Key, Shield, Globe, Box, Terminal, CheckSquare, Lightbulb, Star, ArrowRight } from 'lucide-react';

export default function AwsEc2() {
  const toc = [
    { label: "1. Core Components", hash: "components" },
    { label: "2. EC2 Launch Flow", hash: "launch-flow" },
    { label: "3. Example & Connect", hash: "example" }
  ];

  const components = [
    {
      id: 1,
      title: "What is EC2?",
      icon: <Cpu className="text-orange-400" size={32} />,
      points: [
        "EC2 = Elastic Compute Cloud",
        "Virtual servers in AWS cloud.",
        "Full control of OS, storage, networking & security."
      ],
      color: "border-orange-500/30"
    },
    {
      id: 2,
      title: "Instance Types",
      icon: <Server className="text-blue-400" size={32} />,
      points: [
        "Different types for different workloads.",
        "Example families: t, m, c, r, i, g",
        "Choose based on CPU, Memory, Storage, Network."
      ],
      color: "border-blue-500/30"
    },
    {
      id: 3,
      title: "AMI (Amazon Machine Image)",
      icon: <Box className="text-purple-400" size={32} />,
      points: [
        "Pre-configured template.",
        "Includes OS, software & settings.",
        "Use AWS Marketplace, or custom AMI."
      ],
      color: "border-purple-500/30"
    },
    {
      id: 4,
      title: "Key Pair",
      icon: <Key className="text-yellow-400" size={32} />,
      points: [
        "Used to securely connect to EC2.",
        "Consists of Public key & Private key (.pem).",
        "Keep private key safe!"
      ],
      color: "border-yellow-500/30"
    },
    {
      id: 5,
      title: "Security Groups",
      icon: <Shield className="text-green-400" size={32} />,
      points: [
        "Acts as a virtual firewall.",
        "Control inbound & outbound traffic.",
        "Rules based on IP, Port, Protocol."
      ],
      color: "border-green-500/30"
    },
    {
      id: 6,
      title: "Elastic IP",
      icon: <Globe className="text-cyan-400" size={32} />,
      points: [
        "Static IPv4 address.",
        "Not attached to instance by default.",
        "Re-attach to running instance."
      ],
      color: "border-cyan-500/30"
    }
  ];

  return (
    <GuideLayout
      title="EC2 (Virtual Servers)"
      intro="Amazon EC2 provides secure, resizable compute capacity in the cloud. You get virtual servers in minutes."
      toc={toc}
    >

      {/* 1 */}
      <section id="components" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map(comp => (
            <div key={comp.id} className={`border rounded-xl p-6 bg-[#111] ${comp.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {comp.icon}
                  <h3 className="font-bold text-white text-lg">{comp.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{comp.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {comp.points.map((point, i) => (
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
      <section id="launch-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          EC2 Launch Flow
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto relative">
          <div className="min-w-[800px] flex justify-between items-center relative z-10 mb-8">
            
            <div className="flex flex-col items-center gap-2">
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700">
                <Box className="text-purple-400" size={32}/>
              </div>
              <span className="font-bold text-white text-sm">AMI</span>
              <span className="text-[0.625rem] text-gray-500">(OS Template)</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700">
                <Cpu className="text-blue-400" size={32}/>
              </div>
              <span className="font-bold text-white text-sm">Instance Type</span>
              <span className="text-[0.625rem] text-gray-500">(Size)</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700">
                <Shield className="text-green-400" size={32}/>
              </div>
              <span className="font-bold text-white text-sm">Security Group</span>
              <span className="text-[0.625rem] text-gray-500">(Firewall)</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-700">
                <Key className="text-yellow-400" size={32}/>
              </div>
              <span className="font-bold text-white text-sm">Key Pair</span>
              <span className="text-[0.625rem] text-gray-500">(Access)</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/30">
                <Server className="text-orange-500" size={32}/>
              </div>
              <span className="font-bold text-orange-400 text-sm">EC2 Instance</span>
              <span className="text-[0.625rem] text-orange-300">(Running)</span>
            </div>
            
          </div>

          <div className="max-w-[700px] mx-auto border-t-2 border-l-2 border-r-2 border-dashed border-gray-700 h-16 rounded-t-xl relative">
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1a1a] px-4 py-1 rounded border border-gray-700 flex items-center gap-2">
               <Globe className="text-cyan-400" size={16} />
               <span className="text-xs text-gray-300">Elastic IP (Static Address)</span>
             </div>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="example" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-white text-lg mb-4 border-b border-gray-800 pb-2">Example: Launch EC2 Instance</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckSquare size={16} className="text-green-500 shrink-0" />
                  <span>1. Choose an <strong className="text-purple-400">AMI</strong> (e.g., Amazon Linux 2)</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckSquare size={16} className="text-green-500 shrink-0" />
                  <span>2. Select <strong className="text-blue-400">Instance Type</strong> (e.g., t3.micro)</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckSquare size={16} className="text-green-500 shrink-0" />
                  <span>3. Configure <strong className="text-green-400">Security Group</strong> (Allow SSH 22)</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckSquare size={16} className="text-green-500 shrink-0" />
                  <span>4. Create or Select <strong className="text-yellow-400">Key Pair</strong> (.pem file)</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckSquare size={16} className="text-green-500 shrink-0" />
                  <span>5. Launch Instance</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckSquare size={16} className="text-green-500 shrink-0" />
                  <span>6. (Optional) Allocate & Associate <strong className="text-cyan-400">Elastic IP</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl overflow-hidden">
              <div className="bg-[#222] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                <Terminal className="text-gray-400" size={16} />
                <span className="text-xs text-gray-300 font-bold">Connect to EC2 (Linux)</span>
              </div>
              <div className="p-4">
                <code className="text-sm text-orange-400 font-mono">
                  ssh -i your-key.pem ec2-user@&lt;Public-IP&gt;
                </code>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 text-green-500"><Lightbulb size={120} /></div>
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> You pay for running EC2 instances.</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Stop = Stop charging (EBS data safe).</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Terminate = Delete (EBS deleted if not attached).</li>
              </ul>
            </div>
            
            <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
              <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> BEST PRACTICE</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Use Least Privilege in Security Groups.</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Use IAM Roles for EC2 (not access keys).</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Enable monitoring with CloudWatch.</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Regularly stop unused instances.</li>
              </ul>
            </div>
          </div>
          
        </div>
      </section>

    </GuideLayout>
  );
}
