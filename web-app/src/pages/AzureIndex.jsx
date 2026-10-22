import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { Cloud, Globe, Shield, Server, Database, ArrowRight, Network, Route, Globe2, Layout, Container, Activity, ShieldAlert, History, Component } from 'lucide-react';

export default function AzureIndex() {
  const toc = [
    { label: "Overview", hash: "hero" },
    { label: "Azure Topics", hash: "topics" }
  ];

  const topics = [
    { 
      title: "Azure Basics", 
      path: "/azure/basics", 
      icon: <Cloud className="text-blue-400" size={32} />, 
      desc: "An introduction to Microsoft's cloud platform, benefits, and popular services." 
    },
    { 
      title: "Global Infrastructure", 
      path: "/azure/infrastructure", 
      icon: <Globe className="text-emerald-400" size={32} />, 
      desc: "Explore Regions, Availability Zones, Edge Zones, and high availability architecture." 
    },
    { 
      title: "Azure Identity", 
      path: "/azure/identity", 
      icon: <Shield className="text-indigo-400" size={32} />, 
      desc: "Deep dive into Microsoft Entra ID, RBAC, Managed Identities, and access security." 
    },
    { 
      title: "Virtual Machines", 
      path: "/azure/vms", 
      icon: <Server className="text-purple-400" size={32} />, 
      desc: "Scalable compute resources, sizes, scale sets, deployment flows, and Bastion." 
    },
    { 
      title: "Azure Storage", 
      path: "/azure/storage", 
      icon: <Database className="text-orange-400" size={32} />, 
      desc: "Durable object storage: Blob, File, Queue, Table, redundancy options, and lifecycle." 
    },
    { 
      title: "Azure Networking", 
      path: "/azure/networking", 
      icon: <Network className="text-cyan-400" size={32} />, 
      desc: "VNet, Subnets, NSGs, Route Tables, Endpoints, NAT, and Traffic Flow." 
    },
    { 
      title: "Load Balancer", 
      path: "/azure/load-balancer", 
      icon: <Route className="text-pink-400" size={32} />, 
      desc: "L4 Load Balancer, App Gateway, Front Door, Traffic Manager, WAF & Autoscaling." 
    },
    { 
      title: "Azure DNS", 
      path: "/azure/dns", 
      icon: <Globe2 className="text-blue-500" size={32} />, 
      desc: "Public/Private Zones, Record Types, DNS Resolver, and Traffic Flow." 
    },
    { 
      title: "App Service", 
      path: "/azure/app-service", 
      icon: <Layout className="text-yellow-400" size={32} />, 
      desc: "PaaS Web Apps, Deployment Slots, Scaling, SSL, and CI/CD integrations." 
    },
    { 
      title: "Azure Kubernetes Service", 
      path: "/azure/aks", 
      icon: <Container className="text-blue-300" size={32} />, 
      desc: "Managed Kubernetes, Node Pools, Control Plane, Pods, HPA, and Azure CNI." 
    },
    { 
      title: "Azure Monitoring", 
      path: "/azure/monitoring", 
      icon: <Activity className="text-green-400" size={32} />, 
      desc: "Azure Monitor, Log Analytics, App Insights, Alerts, Metrics, and Dashboards." 
    },
    { 
      title: "Azure Security", 
      path: "/azure/security", 
      icon: <ShieldAlert className="text-red-400" size={32} />, 
      desc: "Defender, Sentinel, Key Vault, Policy, RBAC, WAF, and DDoS Protection." 
    },
    { 
      title: "Backup & DR", 
      path: "/azure/backup", 
      icon: <History className="text-indigo-400" size={32} />, 
      desc: "Azure Backup, Site Recovery, Vaults, Soft Delete, and Cross Region Restore." 
    },
    { 
      title: "Azure Architecture", 
      path: "/azure/architecture", 
      icon: <Component className="text-purple-400" size={32} />, 
      desc: "Full-stack cloud architectures, Region Pairs, DR, and Security Layers." 
    }
  ];

  return (
    <GuideLayout
      title="Microsoft Azure"
      intro="A visual guide to building, deploying, and managing applications on Microsoft's cloud platform."
      toc={toc}
    >
      <section id="hero" className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a] text-gray-300 rounded-2xl mb-12 border border-[#333]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <motion.div 
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px]"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Azure Masterclass
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-white"
          >
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Microsoft Azure</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            A comprehensive visual guide exploring everything from global infrastructure and identity management to scalable compute and highly durable storage architectures.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <a href="#topics" className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Explore Topics ↓
            </a>
          </motion.div>
        </div>
      </section>

      {/* Topics Section */}
      <section id="topics" className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Select a Module</h2>
          <p className="text-gray-400">Choose a topic below to start learning about Azure architecture and services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, i) => (
            <Link key={i} to={topic.path} className={i === topics.length - 1 ? "md:col-span-2 lg:col-span-1 lg:col-start-2" : ""}>
              <motion.div 
                whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.5)" }}
                className="bg-[#111] border border-gray-800 rounded-xl p-6 h-full flex flex-col transition-colors hover:bg-[#1a1a1a]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-[#1a1a1a] rounded-lg border border-gray-800">
                    {topic.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                </div>
                <p className="text-gray-400 mb-6 flex-grow">{topic.desc}</p>
                <div className="flex items-center text-blue-400 font-medium text-sm mt-auto">
                  Start Module <ArrowRight size={16} className="ml-1" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </GuideLayout>
  );
}
