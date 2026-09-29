import React from 'react';
import GuideLayout from '../components/GuideLayout';
import { Globe, Building, Network, MapPin, ArrowRight, ArrowRightLeft, Lightbulb, Star, Cloud, User, Flag } from 'lucide-react';

export default function AwsInfrastructure() {
  const toc = [
    { label: "1. Regions", hash: "regions" },
    { label: "2. Availability Zones (AZ)", hash: "azs" },
    { label: "3. Edge & Local Zones", hash: "edge-local" },
    { label: "4. Summary & Example", hash: "summary" }
  ];

  return (
    <GuideLayout
      title="AWS Global Infrastructure"
      intro="AWS offers a secure, reliable & global network of data centers to run your applications anywhere in the world."
      toc={toc}
    >
      {/* 1 */}
      <section id="regions" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
          Regions
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 text-blue-500 opacity-20"><Globe size={64} /></div>
            <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><Globe /> Regions</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-1">•</span> A Region is a separate geographic area.</li>
              <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-1">•</span> Completely isolated from other Regions.</li>
              <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-1">•</span> Each Region has multiple AZs.</li>
              <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-1">•</span> Example: <code>us-east-1</code> (N. Virginia), <code>ap-south-1</code> (Mumbai).</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 flex items-center justify-center relative min-h-[250px]">
             {/* Map Placeholder */}
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 to-transparent"></div>
             
             <div className="relative w-full h-full">
               <div className="absolute top-[30%] left-[20%] flex flex-col items-center">
                 <MapPin className="text-purple-400" size={24} />
                 <span className="text-[0.625rem] text-gray-300 mt-1">N. Virginia<br/>(us-east-1)</span>
               </div>
               
               <div className="absolute top-[25%] left-[50%] flex flex-col items-center">
                 <MapPin className="text-green-400" size={24} />
                 <span className="text-[0.625rem] text-gray-300 mt-1">Ireland<br/>(eu-west-1)</span>
               </div>
               
               <div className="absolute top-[45%] left-[70%] flex flex-col items-center">
                 <MapPin className="text-red-400" size={24} />
                 <span className="text-[0.625rem] text-gray-300 mt-1">Mumbai<br/>(ap-south-1)</span>
               </div>
               
               <div className="absolute top-[75%] left-[85%] flex flex-col items-center">
                 <MapPin className="text-blue-400" size={24} />
                 <span className="text-[0.625rem] text-gray-300 mt-1">Sydney<br/>(ap-southeast-2)</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2 */}
      <section id="azs" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
          Availability Zones (AZ)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 relative">
            <div className="absolute top-4 right-4 text-emerald-500 opacity-20"><Building size={64} /></div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2"><Building /> Availability Zones</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300"><span className="text-emerald-500 mt-1">•</span> AZs are one or more data centers with independent power, cooling and networking.</li>
              <li className="flex items-start gap-2 text-gray-300"><span className="text-emerald-500 mt-1">•</span> Designed for high availability.</li>
              <li className="flex items-start gap-2 text-gray-300"><span className="text-emerald-500 mt-1">•</span> AZs are connected with low latency.</li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] border border-emerald-500/30 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#111] px-2 text-xs font-bold text-emerald-400 border border-emerald-500/30 rounded">Region (us-east-1)</div>
            
            <div className="flex justify-between items-center h-full mt-4">
              <div className="border border-emerald-500 border-dashed rounded-lg p-4 bg-emerald-900/10 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-300 mb-1">AZ A</span>
                <span className="text-[0.625rem] text-gray-500 mb-2">(use1-az1)</span>
                <Building className="text-emerald-400" size={32} />
              </div>
              
              <ArrowRightLeft className="text-emerald-600 shrink-0" />
              
              <div className="border border-emerald-500 border-dashed rounded-lg p-4 bg-emerald-900/10 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-300 mb-1">AZ B</span>
                <span className="text-[0.625rem] text-gray-500 mb-2">(use1-az2)</span>
                <Building className="text-emerald-400" size={32} />
              </div>
              
              <ArrowRightLeft className="text-emerald-600 shrink-0" />
              
              <div className="border border-emerald-500 border-dashed rounded-lg p-4 bg-emerald-900/10 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-300 mb-1">AZ C</span>
                <span className="text-[0.625rem] text-gray-500 mb-2">(use1-az3)</span>
                <Building className="text-emerald-400" size={32} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 */}
      <section id="edge-local" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <span className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
          Edge & Local Zones
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-6">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2"><Network /> Edge Locations</h3>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">3</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-gray-300"><span className="text-purple-500 mt-0.5">•</span> Used by CloudFront (CDN).</li>
                <li className="flex items-start gap-2 text-gray-300"><span className="text-purple-500 mt-0.5">•</span> Deliver content closer to users.</li>
                <li className="flex items-start gap-2 text-gray-300"><span className="text-purple-500 mt-0.5">•</span> Not used to run AWS resources.</li>
                <li className="flex items-start gap-2 text-gray-300"><span className="text-purple-500 mt-0.5">•</span> Hundreds of edge locations worldwide.</li>
              </ul>
              
              <div className="mt-6 border border-purple-500/30 rounded-lg p-4 bg-purple-900/10 flex justify-between items-center">
                <div className="flex flex-col items-center"><User className="text-gray-400" size={24}/><span className="text-xs text-gray-400 mt-1">User</span></div>
                <ArrowRight className="text-purple-400"/>
                <div className="flex flex-col items-center"><Network className="text-purple-400" size={24}/><span className="text-[0.625rem] text-purple-300 mt-1">Edge Locations</span></div>
                <ArrowRight className="text-purple-400"/>
                <div className="flex flex-col items-center"><Cloud className="text-orange-400" size={24}/><span className="text-[0.625rem] text-orange-300 mt-1">AWS Region</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2"><MapPin /> Local Zones</h3>
                <span className="bg-[#1a1a1a] text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">4</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-0.5">•</span> Extend AWS infrastructure closer to large population centers.</li>
                <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-0.5">•</span> Lower latency for real-time apps.</li>
                <li className="flex items-start gap-2 text-gray-300"><span className="text-blue-500 mt-0.5">•</span> Dependent on a parent Region.</li>
              </ul>
              
              <div className="mt-8 border border-blue-500/30 rounded-lg p-4 bg-blue-900/10 flex justify-between items-center relative">
                <div className="flex flex-col items-center"><Building className="text-gray-400" size={24}/><span className="text-xs text-gray-400 mt-1">User (City)</span></div>
                <ArrowRight className="text-blue-400"/>
                <div className="flex flex-col items-center"><MapPin className="text-blue-400" size={24}/><span className="text-xs text-blue-300 mt-1">Local Zone</span></div>
                
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-[0.625rem] text-orange-400">Low Latency</span>
                  <ArrowRight className="text-orange-500 border-dashed border-b border-orange-500 w-full" style={{height: 0}} />
                </div>
                
                <div className="border border-dashed border-gray-500 p-2 rounded text-center">
                  <span className="text-[0.625rem] text-gray-400 block mb-1">Parent Region</span>
                  <Flag className="text-gray-300 mx-auto" size={16} />
                  <span className="text-[0.625rem] text-gray-500">(us-east-1)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 */}
      <section id="summary" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-green-500"><Lightbulb size={120} /></div>
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2"><Lightbulb size={24} /> REMEMBER</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Region → Multiple AZs</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> AZ → Multiple Data Centers</li>
              <li className="flex items-start gap-2"><span className="text-green-500 font-bold">•</span> Edge & Local Zones → Closer to Users</li>
            </ul>
          </div>
          
          <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-orange-500"><Star size={120} /></div>
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2"><Star size={24} /> REAL-WORLD EXAMPLE</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> A user in <strong className="text-red-400">India</strong> accesses your app.</li>
              <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Request goes to nearest <strong className="text-red-400">Edge/Local Zone</strong>.</li>
              <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span> Data is processed in the AWS Region <strong className="text-red-400">(Mumbai)</strong>.</li>
            </ul>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
}
