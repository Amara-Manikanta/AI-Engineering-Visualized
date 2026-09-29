import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Shield, User, Users, HardHat, FileText, Smartphone, Lightbulb, Star, ArrowRight, Cloud } from 'lucide-react';

export default function AwsIam() {
  const toc = [
    { label: "1. Core IAM Components", hash: "components" },
    { label: "2. Security Principles", hash: "security" },
    { label: "3. How IAM Works", hash: "how-it-works" },
    { label: "4. Example Policy", hash: "policy" }
  ];

  const components = [
    {
      id: 1,
      title: "Users",
      icon: <User className="text-blue-400" size={32} />,
      points: [
        "An individual identity.",
        "Has unique credentials.",
        "Can belong to one or more groups."
      ],
      color: "border-blue-500/30 bg-[#1a1a1a]"
    },
    {
      id: 2,
      title: "Groups",
      icon: <Users className="text-emerald-400" size={32} />,
      points: [
        "Collection of users.",
        "Permissions applied to the group.",
        "Easier management of access."
      ],
      color: "border-emerald-500/30 bg-[#1a1a1a]"
    },
    {
      id: 3,
      title: "Roles",
      icon: <HardHat className="text-orange-400" size={32} />,
      points: [
        "Used by AWS services or external users.",
        "Temporary access.",
        "No long-term credentials."
      ],
      color: "border-orange-500/30 bg-[#1a1a1a]"
    },
    {
      id: 4,
      title: "Policies",
      icon: <FileText className="text-purple-400" size={32} />,
      points: [
        "JSON documents.",
        "Define permissions (Allow/Deny).",
        "Attach to Users, Groups or Roles."
      ],
      color: "border-purple-500/30 bg-[#1a1a1a]"
    }
  ];

  const security = [
    {
      id: 5,
      title: "MFA (Multi-Factor Authentication)",
      icon: <Smartphone className="text-cyan-400" size={32} />,
      points: [
        "Extra layer of security.",
        "Requires a second verification (OTP or Authenticator app).",
        "Protects against unauthorized access."
      ],
      color: "border-cyan-500/30"
    },
    {
      id: 6,
      title: "Least Privilege Principle",
      icon: <Shield className="text-green-400" size={32} />,
      points: [
        "Grant minimum permissions necessary.",
        "Reduces security risks.",
        "Best practice for all AWS accounts."
      ],
      color: "border-green-500/30"
    }
  ];

  const policyJson = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ]
    }
  ]
}`;

  return (
    <GuideLayout
      title="IAM (Identity & Access Management)"
      intro="IAM helps you securely manage access to AWS services and resources for your users and applications."
      toc={toc}
    >

      {/* 1 */}
      <section id="components" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Core IAM Components
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {components.map(comp => (
            <div key={comp.id} className={`border rounded-xl p-6 ${comp.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {comp.icon}
                  <h3 className="font-bold text-white text-lg">{comp.title}</h3>
                </div>
                <span className="bg-[#111] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{comp.id}</span>
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
      <section id="security" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Security Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {security.map(sec => (
            <div key={sec.id} className={`border rounded-xl p-6 bg-[#111] ${sec.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {sec.icon}
                  <h3 className="font-bold text-white text-lg">{sec.title}</h3>
                </div>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-800">{sec.id}</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                {sec.points.map((point, i) => (
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
      <section id="how-it-works" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          How IAM Works
        </h2>
        
        <div className="bg-[#111] border border-gray-800 rounded-xl p-8 overflow-x-auto relative">
          <div className="min-w-[600px] flex justify-between items-center relative z-10">
            
            <div className="flex flex-col items-center gap-2">
              <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                <User className="text-blue-400" size={32}/>
              </div>
              <span className="font-bold text-blue-400">User</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                <Users className="text-emerald-400" size={32}/>
              </div>
              <span className="font-bold text-emerald-400">Group</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                <FileText className="text-purple-400" size={32}/>
              </div>
              <span className="font-bold text-purple-400">Policy</span>
            </div>

            <ArrowRight className="text-gray-600" />

            <div className="flex flex-col items-center gap-2">
              <div className="bg-orange-900/20 p-4 rounded-xl border border-orange-500/30">
                <Cloud className="text-orange-400" size={32}/>
              </div>
              <span className="font-bold text-orange-400">AWS Services</span>
            </div>
            
          </div>

          <div className="mt-8 border border-green-500/30 border-dashed rounded-lg p-4 bg-green-900/10 text-center relative max-w-[500px] mx-auto">
            <div className="absolute -top-4 left-4 border-l border-t border-green-500/50 w-4 h-4 border-dashed rounded-tl"></div>
            <div className="absolute -top-4 right-[45%] border-r border-t border-green-500/50 w-4 h-4 border-dashed rounded-tr"></div>
            <span className="text-sm font-bold text-green-400">Permissions control access to AWS resources</span>
          </div>
        </div>
      </section>

      {/* 4 */}
      <section id="policy" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
            <div className="bg-[#1a1a1a] border-b border-gray-800 p-4 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2"><FileText className="text-purple-400"/> Example Policy (Read Only S3)</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm font-mono leading-relaxed">
                <code>{policyJson}</code>
              </pre>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 text-green-500"><Lightbulb size={120} /></div>
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Users are people.</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Roles are for applications or services.</li>
                <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Policies define what is allowed.</li>
              </ul>
            </div>
            
            <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
              <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> BEST PRACTICE</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Use Groups to manage permissions.</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Enable MFA for all users.</li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Follow Least Privilege always.</li>
              </ul>
            </div>
          </div>
          
        </div>
      </section>

    </GuideLayout>
  );
}
