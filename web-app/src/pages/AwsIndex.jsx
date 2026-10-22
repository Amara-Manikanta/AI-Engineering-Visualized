import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { Cloud, Server, Database, Shield, Globe, Network, ArrowRightLeft, BookOpen } from 'lucide-react';

export default function AwsIndex() {

  const topics = [
    { 
      title: "AWS Basics",
      id: "basics", 
      path: "/aws/basics", 
      icon: <Cloud className="text-orange-400" size={32} />, 
      desc: "Cloud Computing, Why AWS, Benefits, and Top Services." 
    },
    { 
      title: "Global Infrastructure",
      id: "infrastructure", 
      path: "/aws/infrastructure", 
      icon: <Globe className="text-blue-400" size={32} />, 
      desc: "Regions, Availability Zones, Edge Locations, and Local Zones." 
    },
    { 
      title: "IAM (Identity & Access)",
      id: "iam", 
      path: "/aws/iam", 
      icon: <Shield className="text-green-400" size={32} />, 
      desc: "Users, Groups, Roles, Policies, MFA, and Least Privilege." 
    },
    { 
      title: "EC2 (Virtual Servers)",
      id: "ec2", 
      path: "/aws/ec2", 
      icon: <Server className="text-orange-500" size={32} />, 
      desc: "Instance Types, AMI, Key Pairs, Security Groups, and Elastic IP." 
    },
    { 
      title: "Storage Services",
      id: "storage", 
      path: "/aws/storage", 
      icon: <Database className="text-cyan-400" size={32} />, 
      desc: "S3, EBS, EFS, Glacier, and Storage Comparison." 
    },
    { 
      title: "Networking Basics",
      id: "networking", 
      path: "/aws/networking", 
      icon: <Network className="text-pink-400" size={32} />, 
      desc: "VPC, Subnets, Internet Gateway, Route Tables, and NAT Gateway." 
    },
    { 
      title: "Load Balancer & Auto Scaling",
      id: "load-balancer", 
      path: "/aws/load-balancer", 
      icon: <ArrowRightLeft className="text-indigo-400" size={32} />, 
      desc: "ALB, NLB, Auto Scaling Groups, and Scaling Policies." 
    },
    { 
      title: "Route 53 & DNS",
      id: "dns", 
      path: "/aws/dns", 
      icon: <BookOpen className="text-teal-400" size={32} />, 
      desc: "DNS Basics, Hosted Zones, Record Types, and Routing Policies." 
    }
  ];

  const toc = topics.map((t, i) => ({ label: `${i + 1}. ${t.title}`, hash: t.id }));

  return (
    <GuideLayout
      title="AWS Cheat Sheets"
      intro="Your visual guide to Amazon Web Services. Explore our interactive cheat sheets covering core AWS concepts, infrastructure, and services."
      toc={toc}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {topics.map((topic) => (
          <Link key={topic.id} id={topic.id} to={topic.path} className="block scroll-mt-24">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-[#111] border border-gray-800 hover:border-orange-500/50 rounded-xl p-6 h-full transition-colors relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 opacity-10">
                {topic.icon}
              </div>
              <div className="mb-4">
                {topic.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{topic.title}</h3>
              <p className="text-sm text-gray-400">{topic.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </GuideLayout>
  );
}
