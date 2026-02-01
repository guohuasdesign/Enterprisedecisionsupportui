import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, 
  AlertTriangle, 
  Layers, 
  Activity, 
  History, 
  Settings, 
  Search, 
  Filter, 
  ChevronRight, 
  Maximize2, 
  Download, 
  ShieldCheck, 
  Clock, 
  Map as MapIcon,
  Zap,
  Box,
  TrendingUp,
  FileText,
  User,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  Database,
  BarChart3
} from 'lucide-react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker, 
  Line,
  Sphere,
  Graticule
} from 'react-simple-maps';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line as ReLine,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OpenAITest } from '../components/OpenAITest';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Data ---
const THEME = {
  bg: '#0B0F14',
  surface: '#121821',
  primary: '#4C8DFF',
  risk: {
    low: '#10B981', // Muted Green
    medium: '#F59E0B', // Amber
    high: '#EF4444', // Red
  }
};

const GEO_URL = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

const MOCK_VESSELS = [
  { id: 'v1', name: 'EVER GIVEN II', cargo: 'Semiconductors', value: 450000000, status: 'En Route', lat: 30.0, lng: 32.5, risk: 'High', destination: 'Rotterdam' },
  { id: 'v2', name: 'MAERSK ALABAMA', cargo: 'Automotive Parts', value: 120000000, status: 'En Route', lat: 12.0, lng: 45.0, risk: 'Medium', destination: 'Singapore' },
  { id: 'v3', name: 'COSCO SHIPPING', cargo: 'Consumer Electronics', value: 890000000, status: 'En Route', lat: 22.5, lng: 114.0, risk: 'Low', destination: 'Hamburg' },
  { id: 'v4', name: 'MSC EMMA', cargo: 'Pharma supplies', value: 340000000, status: 'Anchored', lat: 51.9, lng: 4.4, risk: 'Low', destination: 'Antwerp' },
  { id: 'v5', name: 'OCEAN ZEPHYR', cargo: 'Industrial Machinery', value: 560000000, status: 'En Route', lat: -10.0, lng: 120.0, risk: 'High', destination: 'Long Beach' },
];

const MOCK_EVENTS = [
  { id: 'e1', type: 'Port Strike', severity: 'High', lat: 30.5, lng: 32.2, radius: 200, time: '2026-02-01 08:00', description: 'Major labour disruption at Suez canal access point.' },
  { id: 'e2', type: 'Typhoon', severity: 'Medium', lat: 20.0, lng: 125.0, radius: 400, time: '2026-02-01 04:30', description: 'Tropical storm heading Northwest towards East China Sea.' },
  { id: 'e3', type: 'Geopolitical Tension', severity: 'High', lat: 12.0, lng: 43.0, radius: 150, time: '2026-01-31 22:00', description: 'Increased security risk in Bab-el-Mandeb strait.' },
];

const MOCK_SCENARIOS = [
  { id: 's1', name: 'Strategic Reroute (Cape)', delay: 168, cost: 420000, legal: 'Low', co2: 1200, confidence: 94 },
  { id: 's2', name: 'Alternative Port (Jebel Ali)', delay: 48, cost: 180000, legal: 'Medium', co2: 450, confidence: 88 },
  { id: 's3', name: 'Wait & Proceed', delay: 72, cost: 95000, legal: 'High', co2: 120, confidence: 72 },
  { id: 's4', name: 'Partial Air Freight', delay: 12, cost: 2400000, legal: 'Low', co2: 5400, confidence: 98 },
  { id: 's5', name: 'Emergency Transshipment', delay: 36, cost: 580000, legal: 'Medium', co2: 380, confidence: 85 },
];

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
      active 
        ? "text-[#4C8DFF] bg-[#4C8DFF]/10 border-r-2 border-[#4C8DFF]" 
        : "text-slate-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const RiskBadge = ({ level }: { level: string }) => {
  const color = level === 'High' ? THEME.risk.high : level === 'Medium' ? THEME.risk.medium : THEME.risk.low;
  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
    >
      {level} Risk
    </span>
  );
};

// --- Screen 1: Situation Overview ---
const SituationOverview = ({ onVesselClick, onNavigateToTest }: any) => {
  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Main Center Map */}
        <div className="flex-[3] bg-[#121821] border border-white/10 relative overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/5 flex justify-between items-center bg-[#121821]/80 backdrop-blur z-10">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#4C8DFF]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Global Operational View</h2>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-4 text-[10px] uppercase font-bold text-slate-500 mr-4">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Event</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#4C8DFF]" /> Vessel</div>
              </div>
              <button className="p-1.5 hover:bg-white/5 border border-white/10 rounded"><Maximize2 size={14} /></button>
              <button className="p-1.5 hover:bg-white/5 border border-white/10 rounded"><Layers size={14} /></button>
            </div>
          </div>
          <div className="flex-1 bg-[#0B0F14] relative">
            <ComposableMap projectionConfig={{ scale: 140 }}>
              <Sphere stroke="#1e293b" strokeWidth={0.5} id="sphere" fill="transparent" />
              <Graticule stroke="#1e293b" strokeWidth={0.5} />
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1a222e"
                      stroke="#0B0F14"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#242f3e", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              {/* Disruption Events */}
              {MOCK_EVENTS.map(event => (
                <Marker key={event.id} coordinates={[event.lng, event.lat]}>
                  <circle r={8} fill={`${event.severity === 'High' ? THEME.risk.high : THEME.risk.medium}33`} stroke={event.severity === 'High' ? THEME.risk.high : THEME.risk.medium} strokeWidth={1} />
                  <circle r={2} fill={event.severity === 'High' ? THEME.risk.high : THEME.risk.medium} />
                </Marker>
              ))}
              {/* Vessels */}
              {MOCK_VESSELS.map(vessel => (
                <Marker key={vessel.id} coordinates={[vessel.lng, vessel.lat]} onClick={() => onVesselClick(vessel)}>
                  <rect x={-4} y={-4} width={8} height={8} fill={THEME.primary} className="cursor-pointer hover:stroke-white hover:stroke-2" />
                </Marker>
              ))}
            </ComposableMap>
            
            {/* Map Legend/Stats Overlay */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
              <div className="bg-[#121821]/90 backdrop-blur border border-white/10 p-3 rounded shadow-2xl">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Active Disruption Map</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between gap-8">
                    <span className="text-slate-400">Total Vessels</span>
                    <span className="font-mono text-white">1,248</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-slate-400">At Risk</span>
                    <span className="font-mono text-red-400">42</span>
                  </div>
                  <div className="flex justify-between gap-8">
                    <span className="text-slate-400">Critical Alerts</span>
                    <span className="font-mono text-orange-400">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Quick Insight */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-[#121821] border border-white/10 p-4 flex flex-col gap-4">
            {onNavigateToTest && (
              <button 
                onClick={onNavigateToTest}
                className="w-full bg-green-600 hover:bg-green-600/90 text-white font-bold py-2 text-xs flex items-center justify-center gap-2 rounded mb-2 cursor-pointer"
              >
                <Settings size={14} />
                TEST OPENAI API
              </button>
            )}
            <button className="w-full bg-[#4C8DFF] hover:bg-[#4C8DFF]/90 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 rounded">
              <Zap size={16} />
              RUN SCENARIO ANALYSIS
            </button>
            
            <div className="pt-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Top At-Risk Vessels</div>
              <div className="space-y-2">
                {MOCK_VESSELS.filter(v => v.risk !== 'Low').map(v => (
                  <div key={v.id} className="p-2 bg-white/5 border border-white/5 rounded hover:border-[#4C8DFF]/30 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-white group-hover:text-[#4C8DFF]">{v.name}</span>
                      <RiskBadge level={v.risk} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{v.cargo}</span>
                      <span className="text-slate-200">€{(v.value/1000000).toFixed(0)}M</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded">
              <div className="flex items-center gap-2 text-amber-500 mb-2">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase">Legal Alert Card</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Key Contract Risk: force majeure clauses in Suez transit agreements may be triggered if disruption persists &gt; 48h.
              </p>
            </div>
          </div>

          <div className="flex-1 bg-[#121821] border border-white/10 p-4 overflow-hidden flex flex-col">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Regional Risk Exposure</div>
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { region: 'Suez', risk: 85 },
                  { region: 'Panama', risk: 42 },
                  { region: 'S. China', risk: 68 },
                  { region: 'Malacca', risk: 24 },
                  { region: 'Hormuz', risk: 55 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="region" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121821', border: '1px solid #ffffff20', fontSize: '10px' }}
                    itemStyle={{ color: '#4C8DFF' }}
                  />
                  <Bar dataKey="risk" fill="#4C8DFF" radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Global Table */}
      <div className="h-[250px] bg-[#121821] border border-white/10 flex flex-col">
        <div className="p-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">All Active Vessels Risk Exposure</h2>
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
              <Search size={12} className="text-slate-500" />
              <input type="text" placeholder="Search vessel, cargo, ID..." className="bg-transparent border-none text-[10px] focus:ring-0 w-48 text-white" />
            </div>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors">
            <Download size={12} />
            EXPORT CSV
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#121821] z-10">
              <tr className="border-b border-white/10 text-[10px] font-bold text-slate-500 uppercase">
                <th className="px-4 py-3">Vessel Name</th>
                <th className="px-4 py-3">Cargo Type</th>
                <th className="px-4 py-3 text-right">Cargo Value (€)</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Operational Status</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">ETA Impact</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-300">
              {MOCK_VESSELS.map(v => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                  <td className="px-4 py-3 font-bold text-white group-hover:text-[#4C8DFF]">{v.name}</td>
                  <td className="px-4 py-3">{v.cargo}</td>
                  <td className="px-4 py-3 text-right font-mono">{(v.value).toLocaleString()}</td>
                  <td className="px-4 py-3">{v.destination}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", v.status === 'En Route' ? 'bg-green-500' : 'bg-slate-500')} />
                      {v.status}
                    </div>
                  </td>
                  <td className="px-4 py-3"><RiskBadge level={v.risk} /></td>
                  <td className="px-4 py-3 text-red-400 font-bold">+12h</td>
                </tr>
              ))}
              {/* Fill with more rows for scroll effect */}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={`extra-${i}`} className="border-b border-white/5 hover:bg-white/5 text-slate-500 opacity-50">
                  <td className="px-4 py-3">MSC VOYAGER {100 + i}</td>
                  <td className="px-4 py-3">Bulk Grain</td>
                  <td className="px-4 py-3 text-right font-mono">12,500,000</td>
                  <td className="px-4 py-3">Felixtowe</td>
                  <td className="px-4 py-3">En Route</td>
                  <td className="px-4 py-3"><RiskBadge level="Low" /></td>
                  <td className="px-4 py-3">On Schedule</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Screen 2: Incident Analysis ---
const IncidentAnalysis = ({ eventId, onGenerateScenarios }: any) => {
  const event = MOCK_EVENTS[0]; // For demo, focus on first event
  
  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left: Event Details */}
        <div className="flex-[1] flex flex-col gap-4">
          <div className="bg-[#121821] border border-white/10 p-4">
            <div className="flex items-center gap-2 text-red-500 mb-4">
              <AlertTriangle size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Incident Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Event Type</label>
                <div className="text-white font-bold">{event.type}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Severity</label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[85%]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-red-500">8.5</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Detection Time</label>
                <div className="text-white font-mono text-xs">{event.time}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Description</label>
                <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Assets Affected</span>
                <span className="text-sm font-mono font-bold text-white">14</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Exposure Value</span>
                <span className="text-sm font-mono font-bold text-white">€1.42B</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Avg. Delay Expected</span>
                <span className="text-sm font-mono font-bold text-red-400">+74h</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-[#121821] border border-white/10 p-4 flex flex-col">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Affected Vessel Cluster</div>
            <div className="space-y-3 flex-1 overflow-auto">
              {MOCK_VESSELS.slice(0, 3).map(v => (
                <div key={v.id} className="p-3 bg-white/5 border border-white/5 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white">{v.name}</span>
                    <span className="text-[10px] font-mono text-red-400 font-bold">CRITICAL</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="text-slate-400">Dist. to Center: <span className="text-white">14nm</span></div>
                    <div className="text-slate-400 text-right">Value: <span className="text-white">€{(v.value/1e6).toFixed(0)}M</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Zoomed Map */}
        <div className="flex-[2] bg-[#121821] border border-white/10 relative">
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
             <button className="bg-white/10 hover:bg-white/20 p-2 rounded backdrop-blur"><Maximize2 size={16} /></button>
          </div>
          <div className="h-full bg-[#0B0F14] overflow-hidden">
             <ComposableMap projectionConfig={{ scale: 2000, center: [32.5, 30.5] }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1a222e"
                        stroke="#0B0F14"
                        strokeWidth={0.5}
                      />
                    ))
                  }
                </Geographies>
                <Marker coordinates={[32.2, 30.5]}>
                   <circle r={80} fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth={1} />
                   <circle r={20} fill="rgba(239, 68, 68, 0.3)" />
                   <circle r={4} fill="#ef4444" />
                </Marker>
                {MOCK_VESSELS.slice(0, 2).map(v => (
                  <Marker key={v.id} coordinates={[v.lng, v.lat]}>
                    <rect x={-4} y={-4} width={8} height={8} fill={THEME.primary} />
                    <text x={10} y={4} fontSize={10} fill="white" className="font-bold select-none">{v.name}</text>
                    <Line from={[v.lng, v.lat]} to={[32.5, 32.5]} stroke={THEME.primary} strokeWidth={1} strokeDasharray="4 4" />
                  </Marker>
                ))}
             </ComposableMap>
          </div>
        </div>

        {/* Right: Asset Table + CTA */}
        <div className="flex-[1.5] flex flex-col gap-4">
          <div className="flex-1 bg-[#121821] border border-white/10 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-white/5 flex justify-between items-center">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Affected Asset Analysis</h3>
               <button className="p-1 hover:bg-white/5 rounded text-slate-500"><Filter size={14} /></button>
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left">
                  <thead className="text-[10px] text-slate-500 font-bold uppercase bg-[#121821] sticky top-0">
                    <tr className="border-b border-white/5">
                      <th className="px-3 py-3">Asset</th>
                      <th className="px-3 py-3 text-right">Value</th>
                      <th className="px-3 py-3">Risk Index</th>
                    </tr>
                  </thead>
                  <tbody className="text-[11px] text-slate-300">
                    {MOCK_VESSELS.map(v => (
                      <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-3 py-3">
                          <div className="font-bold text-white">{v.name}</div>
                          <div className="text-[10px] text-slate-500">{v.cargo}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono">€{(v.value/1e6).toFixed(1)}M</td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-col items-end">
                             <div className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold", v.risk === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500')}>
                               {v.risk}
                             </div>
                             <div className="text-[9px] text-slate-500 mt-1">L: High Compliance</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
          
          <div className="bg-[#121821] border border-white/10 p-4">
            <button 
              onClick={onGenerateScenarios}
              className="w-full bg-[#4C8DFF] hover:bg-[#4C8DFF]/90 text-white font-bold py-4 text-sm flex items-center justify-center gap-2 rounded shadow-lg shadow-[#4C8DFF]/20"
            >
              <Activity size={18} />
              GENERATE RESPONSE SCENARIOS
            </button>
            <div className="mt-3 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Powered by Intelligent Decision Support v4.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Risk Timeline */}
      <div className="h-[200px] bg-[#121821] border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Asset Impact Timeline (T+72h)</h3>
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-[#4C8DFF]" /> Expected Path</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-red-500" /> Disruption Impact</div>
          </div>
        </div>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { time: 'T-24', baseline: 10, impact: 10 },
              { time: 'T-12', baseline: 12, impact: 12 },
              { time: 'T+0', baseline: 15, impact: 45 },
              { time: 'T+12', baseline: 18, impact: 65 },
              { time: 'T+24', baseline: 22, impact: 85 },
              { time: 'T+48', baseline: 25, impact: 75 },
              { time: 'T+72', baseline: 28, impact: 40 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ backgroundColor: '#121821', border: '1px solid #ffffff20', fontSize: '10px' }} />
              <Area type="monotone" dataKey="impact" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={2} />
              <Area type="monotone" dataKey="baseline" stroke="#4C8DFF" fill="transparent" strokeWidth={1} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Screen 3: Scenario Lab ---
const ScenarioLab = ({ onScenarioSelect }: any) => {
  const [selectedScenario, setSelectedScenario] = useState(MOCK_SCENARIOS[0]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Controls */}
        <div className="w-72 border-r border-white/10 bg-[#121821] p-4 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-white pb-4 border-b border-white/5">
            <Activity size={18} className="text-[#4C8DFF]" />
            <h2 className="text-sm font-bold uppercase tracking-widest">Scenario Lab</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">Focus Vessel</label>
              <select className="w-full bg-[#0B0F14] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4C8DFF] focus:ring-0 outline-none">
                <option>EVER GIVEN II</option>
                <option>MAERSK ALABAMA</option>
              </select>
            </div>
            
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">Response Strategy</label>
              <select className="w-full bg-[#0B0F14] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[#4C8DFF] focus:ring-0 outline-none">
                <option>Strategic Reroute</option>
                <option>Wait & Proceed</option>
                <option>Alternative Port</option>
                <option>Transshipment</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Cost Sensitivity</label>
                <span className="text-[10px] text-white font-mono">0.65</span>
              </div>
              <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4C8DFF]" />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Legal Risk Tolerance</label>
                <span className="text-[10px] text-white font-mono">LOW</span>
              </div>
              <input type="range" className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4C8DFF]" />
            </div>
          </div>

          <div className="mt-auto p-4 bg-blue-500/5 border border-blue-500/20 rounded">
            <div className="flex items-center gap-2 text-[#4C8DFF] mb-2">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase">Simulation Engine</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              Currently using Monte Carlo model v4.2. Run time: 1.2s. Confidence interval: 94.2% based on historical GeoJSON data.
            </p>
          </div>
        </div>

        {/* Center - Map Simulation */}
        <div className="flex-1 bg-[#0B0F14] relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 bg-[#121821]/90 p-2 border border-white/10 rounded backdrop-blur">
             <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-3 h-0.5 bg-slate-500 border-dashed border" /> Original
                </div>
                <div className="flex items-center gap-2 text-[#4C8DFF]">
                  <div className="w-3 h-0.5 bg-[#4C8DFF]" /> Proposed
                </div>
             </div>
          </div>
          
          <div className="flex-1">
             <ComposableMap projectionConfig={{ scale: 800, center: [35, 25] }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#1a222e"
                        stroke="#0B0F14"
                        strokeWidth={0.5}
                      />
                    ))
                  }
                </Geographies>
                {/* Simulated Routes */}
                <Line 
                  from={[32.5, 30.5]} 
                  to={[10, -30]} 
                  stroke="#4C8DFF" 
                  strokeWidth={2} 
                />
                <Line 
                  from={[32.5, 30.5]} 
                  to={[32.5, 45]} 
                  stroke="#64748b" 
                  strokeWidth={1} 
                  strokeDasharray="4 4"
                />
                <Marker coordinates={[32.5, 30.5]}>
                   <rect x={-5} y={-5} width={10} height={10} fill="#4C8DFF" />
                   <text y={-15} textAnchor="middle" fontSize={10} fill="white" className="font-bold">EVER GIVEN II</text>
                </Marker>
                <Marker coordinates={[10, -25]}>
                   <text textAnchor="middle" fontSize={10} fill="#4C8DFF" className="font-bold bg-black">ETA: FEB 12 (+168h)</text>
                </Marker>
             </ComposableMap>
          </div>
          
          {/* Right Floating Overlay: Comparison Table */}
          <div className="absolute right-6 top-6 bottom-6 w-96 bg-[#121821] border border-white/10 flex flex-col shadow-2xl">
             <div className="p-3 border-b border-white/5 bg-[#121821]/80">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Response Scenarios</h3>
             </div>
             <div className="flex-1 overflow-auto">
                <div className="divide-y divide-white/5">
                   {MOCK_SCENARIOS.map(s => (
                     <div 
                      key={s.id} 
                      onClick={() => setSelectedScenario(s)}
                      className={cn(
                        "p-4 cursor-pointer transition-all border-l-2",
                        selectedScenario.id === s.id 
                          ? "bg-[#4C8DFF]/5 border-[#4C8DFF]" 
                          : "hover:bg-white/5 border-transparent"
                      )}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <span className={cn("text-xs font-bold", selectedScenario.id === s.id ? "text-[#4C8DFF]" : "text-white")}>{s.name}</span>
                           <span className="text-[10px] font-mono text-slate-400">ID-{s.id.toUpperCase()}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                           <div className="flex flex-col">
                              <span className="text-[9px] text-slate-500 uppercase font-bold">Delay Impact</span>
                              <span className="text-[11px] font-mono font-bold text-red-400">+{s.delay}h</span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[9px] text-slate-500 uppercase font-bold">Cost Est.</span>
                              <span className="text-[11px] font-mono font-bold text-white">€{(s.cost/1000).toFixed(0)}k</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] text-slate-500 uppercase font-bold">Legal Risk</span>
                              <span className={cn("text-[11px] font-bold", s.legal === 'Low' ? 'text-green-500' : 'text-amber-500')}>{s.legal}</span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-[9px] text-slate-500 uppercase font-bold">Confidence</span>
                              <span className="text-[11px] font-mono font-bold text-blue-400">{s.confidence}%</span>
                           </div>
                        </div>
                        {selectedScenario.id === s.id && (
                          <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                             <div className="text-[9px] text-slate-500 uppercase font-bold mb-2">Detailed Insight</div>
                             <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                               Strategy utilizes Cape of Good Hope rerouting. Avoiding Mediterranean surcharges but increasing fuel consumption.
                             </p>
                             <div className="flex gap-2">
                                <div className="px-2 py-1 bg-white/5 rounded text-[9px] text-slate-300 border border-white/5">CO2: {s.co2}t</div>
                                <div className="px-2 py-1 bg-white/5 rounded text-[9px] text-slate-300 border border-white/5">Fuel: €184k</div>
                             </div>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
             <div className="p-4 border-t border-white/5 bg-[#121821]">
                <button 
                  onClick={() => onScenarioSelect(selectedScenario)}
                  className="w-full bg-[#4C8DFF] hover:bg-[#4C8DFF]/90 text-white font-bold py-3 text-sm flex items-center justify-center gap-2 rounded transition-transform active:scale-95"
                >
                  <ArrowRight size={16} />
                  SEND TO DECISION CENTER
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Screen 4: Decision Center ---
const DecisionCenter = ({ selectedScenario, onApprove }: any) => {
  const scenario = selectedScenario || MOCK_SCENARIOS[0];
  
  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-auto">
      {/* Top Header Summary */}
      <div className="bg-[#121821] border border-white/10 p-6 flex justify-between items-center">
        <div>
           <div className="text-[10px] text-[#4C8DFF] font-bold uppercase tracking-[0.2em] mb-1">Decision Workbench</div>
           <h1 className="text-2xl font-bold text-white tracking-tight">Mitigation Strategy: {scenario.name}</h1>
           <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
             <span className="flex items-center gap-1.5"><MapIcon size={14} /> Global Logistics Unit</span>
             <span className="text-slate-700">•</span>
             <span className="flex items-center gap-1.5"><Clock size={14} /> Created: Today, 08:42 AM</span>
             <span className="text-slate-700">•</span>
             <span className="flex items-center gap-1.5"><Database size={14} /> ID: DS-8492-AX</span>
           </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Confidence Score</span>
            <div className="text-2xl font-mono font-bold text-[#4C8DFF]">{scenario.confidence}%</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-[#4C8DFF]/20 border-t-[#4C8DFF] flex items-center justify-center">
             <ShieldCheck size={24} className="text-[#4C8DFF]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Scenario Impact Cards */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#121821] border border-white/10 p-5 rounded-sm">
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <Clock size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">ETA Impact</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">+{scenario.delay}h</div>
              <div className="text-[11px] text-slate-500 mt-2">Estimated Arrival: Feb 12, 14:00</div>
            </div>
            <div className="bg-[#121821] border border-white/10 p-5 rounded-sm">
              <div className="flex items-center gap-2 text-amber-500 mb-4">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cost Impact</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">€{(scenario.cost/1000).toFixed(0)}k</div>
              <div className="text-[11px] text-slate-500 mt-2">+12.4% over baseline budget</div>
            </div>
            <div className="bg-[#121821] border border-white/10 p-5 rounded-sm">
              <div className="flex items-center gap-2 text-green-400 mb-4">
                <Zap size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Op. Efficiency</span>
              </div>
              <div className="text-3xl font-mono font-bold text-white">82%</div>
              <div className="text-[11px] text-slate-500 mt-2">Route optimization efficiency</div>
            </div>
          </div>

          <div className="bg-[#121821] border border-white/10 p-6 flex-1 min-h-[300px] flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-white/5 pb-3 flex justify-between">
              DECISION RATIONALE & TRACEABILITY
              <span className="font-mono text-[10px] text-slate-500">VERSION 4.2.0-SIM</span>
            </h3>
            
            <div className="space-y-6">
               <section>
                 <h4 className="text-[11px] font-bold text-[#4C8DFF] mb-2 uppercase">Core Rationale</h4>
                 <p className="text-sm text-slate-300 leading-relaxed font-medium">
                   The selected rerouting strategy provides the optimal balance between cost escalation and schedule reliability. While adding 168 hours to the ETA, it avoids high-risk geopolitical zones where insurance premiums have increased by 400%. This route utilizes established bunkering hubs in South Africa, ensuring operational continuity.
                 </p>
               </section>

               <section>
                 <h4 className="text-[11px] font-bold text-[#4C8DFF] mb-2 uppercase">Key Assumptions</h4>
                 <ul className="space-y-2">
                    {[
                      "Vessel maintains avg speed of 18 knots",
                      "Fuel prices remain within ±5% of T-0 spot rate",
                      "No secondary disruptions in Cape region ports",
                      "Insurance coverage remains valid for rerouted path"
                    ].map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <div className="w-1 h-1 rounded-full bg-slate-600 mt-1.5" />
                        {a}
                      </li>
                    ))}
                 </ul>
               </section>

               <section>
                 <h4 className="text-[11px] font-bold text-[#4C8DFF] mb-2 uppercase">Data Sources</h4>
                 <div className="flex flex-wrap gap-2">
                    {["GeoJSON Events", "AIS Real-time", "Lloyd's List Intelligence", "Sentinel-2 Satellite", "Internal CRM"].map(s => (
                      <span key={s} className="px-2 py-1 bg-white/5 border border-white/5 text-[10px] text-slate-500 font-mono">{s}</span>
                    ))}
                 </div>
               </section>
            </div>
          </div>
        </div>

        {/* Legal & Final Action Side */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-amber-500/5 border border-amber-500/20 p-6">
            <div className="flex items-center gap-2 text-amber-500 mb-4">
              <ShieldCheck size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Legal Compliance Card</h3>
            </div>
            <div className="space-y-4">
               <div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[11px] text-slate-400">Contract Obligations</span>
                     <span className="text-[11px] font-bold text-green-500">VALID</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-full" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[11px] text-slate-400">Force Majeure Status</span>
                     <span className="text-[11px] font-bold text-amber-500">POTENTIAL</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-500 w-1/2" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-[11px] text-slate-400">Legal Risk Rating</span>
                     <span className="text-[11px] font-bold text-white">{scenario.legal}</span>
                  </div>
               </div>
            </div>
            <p className="mt-6 text-[11px] text-slate-400 leading-relaxed bg-black/40 p-3 border border-white/5">
              Note: Clause 14.b of the Master Service Agreement allows for deviation in event of war risk or natural peril without breach of contract.
            </p>
          </div>

          <div className="bg-[#121821] border border-white/10 p-6 flex-1 flex flex-col justify-between">
            <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Decision Authorization</h3>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded bg-[#4C8DFF]/10 flex items-center justify-center text-[#4C8DFF]">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Sarah Chen</div>
                    <div className="text-[11px] text-slate-500 font-medium">Head of Global Operations</div>
                  </div>
               </div>
               
               <div className="space-y-3">
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   Model Version: IDS-CORE-V4
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                   <div className="w-2 h-2 rounded-full bg-slate-500" />
                   Simulation ID: 8A-FF-02-12
                 </div>
               </div>
            </div>

            <div className="mt-8 space-y-3">
               <button 
                onClick={onApprove}
                className="w-full bg-[#4C8DFF] hover:bg-[#4C8DFF]/90 text-white font-bold py-4 text-sm flex items-center justify-center gap-2 rounded shadow-xl shadow-[#4C8DFF]/20"
               >
                 <CheckCircle2 size={18} />
                 APPROVE DECISION
               </button>
               <button className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 font-bold py-3 text-sm flex items-center justify-center gap-2 rounded">
                 <XCircle size={16} />
                 REQUEST RE-ANALYSIS
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Screen 5: Audit & History ---
const AuditHistory = () => {
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  
  const auditData = [
    { id: 'DS-8492-AX', incident: 'Suez Port Strike', scenario: 'Strategic Reroute', approvedBy: 'S. Chen', timestamp: '2026-02-01 08:42', version: '4.2.0', status: 'Approved' },
    { id: 'DS-8488-BC', incident: 'Typhoon Mawar', scenario: 'Wait & Proceed', approvedBy: 'J. Doe', timestamp: '2026-01-28 14:15', version: '4.1.8', status: 'Approved' },
    { id: 'DS-8475-DD', incident: 'Red Sea Tension', scenario: 'Emergency Diversion', approvedBy: 'S. Chen', timestamp: '2026-01-24 11:30', version: '4.1.5', status: 'Approved' },
    { id: 'DS-8462-ZZ', incident: 'Panama Congestion', scenario: 'Partial Cargo Redirect', approvedBy: 'A. Miller', timestamp: '2026-01-20 09:05', version: '4.1.0', status: 'Rejected' },
    { id: 'DS-8451-KL', incident: 'Bridge Collapse (Balt)', scenario: 'Port Swap', approvedBy: 'S. Chen', timestamp: '2026-01-15 16:40', version: '4.0.2', status: 'Approved' },
  ];

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-hidden">
      <div className="flex justify-between items-center bg-[#121821] border border-white/10 p-4">
        <div className="flex items-center gap-2">
           <History size={18} className="text-[#4C8DFF]" />
           <h1 className="text-sm font-bold uppercase tracking-widest text-white">Enterprise Trust Layer — Decision Audit Trail</h1>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded">
             <Search size={14} className="text-slate-500" />
             <input type="text" placeholder="Search ID, Manager, Incident..." className="bg-transparent border-none text-xs focus:ring-0 w-64 text-white" />
           </div>
           <button className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white rounded">
             <Download size={14} />
             EXPORT ALL (.JSON)
           </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-[2] bg-[#121821] border border-white/10 flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-[#121821] z-20">
                <tr className="border-b border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Decision ID</th>
                  <th className="px-6 py-4">Incident</th>
                  <th className="px-6 py-4">Scenario Chosen</th>
                  <th className="px-6 py-4">Approved By</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-300">
                {auditData.map(a => (
                  <tr 
                    key={a.id} 
                    onClick={() => setSelectedAudit(a)}
                    className={cn(
                      "border-b border-white/5 cursor-pointer transition-colors group",
                      selectedAudit?.id === a.id ? "bg-[#4C8DFF]/5" : "hover:bg-white/5"
                    )}
                  >
                    <td className="px-6 py-4 font-mono font-bold text-white group-hover:text-[#4C8DFF]">{a.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{a.incident}</td>
                    <td className="px-6 py-4">{a.scenario}</td>
                    <td className="px-6 py-4">{a.approvedBy}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{a.timestamp}</td>
                    <td className="px-6 py-4">
                       <span className={cn(
                         "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                         a.status === 'Approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                       )}>
                         {a.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-[1] bg-[#121821] border border-white/10 flex flex-col">
          {selectedAudit ? (
            <div className="p-6 flex flex-col h-full">
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 border-b border-white/5 pb-3">Decision Replay Viewer</h3>
               
               <div className="flex-1 overflow-auto space-y-8 pr-2">
                 <div>
                    <div className="text-[10px] text-[#4C8DFF] font-bold uppercase mb-2">Selected Scenario</div>
                    <div className="text-lg font-bold text-white">{selectedAudit.scenario}</div>
                    <div className="text-xs text-slate-500 mt-1">Version: {selectedAudit.version}</div>
                 </div>

                 <div className="h-40 bg-[#0B0F14] border border-white/5 relative flex items-center justify-center">
                    <MapIcon size={32} className="text-slate-800" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] to-transparent" />
                    <span className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500">Historical Map Snapshot</span>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded">
                       <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Legal Verification Notes</div>
                       <p className="text-[11px] text-slate-400 leading-relaxed">
                         Verified against maritime law database v2026.1. Strategy compliant with force majeure triggers. Re-insurance confirmed.
                       </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/5 rounded">
                       <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">Audit Trace</div>
                       <div className="space-y-3 mt-3">
                          <div className="flex gap-3 text-[10px]">
                            <div className="text-slate-500 font-mono">08:40:12</div>
                            <div className="text-slate-300">Scenario simulation initialized</div>
                          </div>
                          <div className="flex gap-3 text-[10px]">
                            <div className="text-slate-500 font-mono">08:41:05</div>
                            <div className="text-slate-300">Cost-benefit analysis validated</div>
                          </div>
                          <div className="flex gap-3 text-[10px]">
                            <div className="text-slate-500 font-mono">08:42:01</div>
                            <div className="text-slate-300">Auth token verified by S. Chen</div>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-white/5">
                  <button className="w-full bg-[#4C8DFF] hover:bg-[#4C8DFF]/90 text-white font-bold py-3 text-xs flex items-center justify-center gap-2 rounded">
                    <FileText size={16} />
                    EXPORT FULL AUDIT PDF
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <Database size={48} className="text-slate-600 mb-4" />
              <div className="text-sm font-bold text-slate-400">Select a decision ID to view full audit trace</div>
              <p className="text-xs text-slate-500 mt-2">All decisions are cryptographically signed and immutable.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [activeScreen, setActiveScreen] = useState('situation');
  const [selectedVessel, setSelectedVessel] = useState<any>(null);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [activeIncident, setActiveIncident] = useState<any>(MOCK_EVENTS[0]);

  const renderScreen = () => {
    switch(activeScreen) {
      case 'situation': return <SituationOverview onVesselClick={(v: any) => { setSelectedVessel(v); setActiveScreen('analysis'); }} onNavigateToTest={() => setActiveScreen('api-test')} />;
      case 'analysis': return <IncidentAnalysis eventId={activeIncident?.id} onGenerateScenarios={() => setActiveScreen('scenario-lab')} />;
      case 'scenario-lab': return <ScenarioLab onScenarioSelect={(s: any) => { setSelectedScenario(s); setActiveScreen('decision-center'); }} />;
      case 'decision-center': return <DecisionCenter selectedScenario={selectedScenario} onApprove={() => setActiveScreen('audit')} />;
      case 'audit': return <AuditHistory />;
      case 'api-test': return (
        <div className="flex flex-col h-full gap-4 p-4 overflow-auto">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={20} className="text-[#4C8DFF]" />
            <h1 className="text-xl font-bold text-white">OpenAI API Connection Test</h1>
          </div>
          <OpenAITest />
        </div>
      );
      default: return <SituationOverview />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0B0F14] text-slate-200 overflow-hidden font-sans selection:bg-[#4C8DFF]/30">
      {/* Top Navigation */}
      <header className="h-12 border-b border-white/10 bg-[#121821] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#4C8DFF] rounded-sm flex items-center justify-center">
              <Zap size={14} className="text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tighter text-white">IDSS <span className="text-slate-500 font-medium">| V4.2</span></span>
          </div>
          <nav className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs font-bold text-white bg-white/5 rounded">OPERATIONS</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">COMPLIANCE</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors">STRATEGY</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-white/10">
            <div className="text-right">
              <div className="text-[10px] font-bold text-white uppercase leading-none">Global System State</div>
              <div className="flex items-center gap-1.5 justify-end mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-[9px] font-mono text-green-500 font-bold uppercase">Nominal / Secure</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-1.5 text-slate-400 hover:text-white transition-colors relative">
               <Activity size={18} />
               <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#121821]" />
             </button>
             <button className="p-1.5 text-slate-400 hover:text-white transition-colors"><Settings size={18} /></button>
             <div className="flex items-center gap-2 ml-2">
               <div className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold border border-white/10">SC</div>
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-56 border-r border-white/10 bg-[#0B0F14] flex flex-col pt-4">
          <div className="px-4 mb-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Command Center</div>
          </div>
          <SidebarItem 
            icon={Globe} 
            label="Situation Room" 
            active={activeScreen === 'situation'} 
            onClick={() => setActiveScreen('situation')}
          />
          <SidebarItem 
            icon={AlertTriangle} 
            label="Incident Analysis" 
            active={activeScreen === 'analysis'} 
            onClick={() => setActiveScreen('analysis')}
          />
          <SidebarItem 
            icon={Activity} 
            label="Scenario Lab" 
            active={activeScreen === 'scenario-lab'} 
            onClick={() => setActiveScreen('scenario-lab')}
          />
          <SidebarItem 
            icon={BarChart3} 
            label="Decision Center" 
            active={activeScreen === 'decision-center'} 
            onClick={() => setActiveScreen('decision-center')}
          />
          <SidebarItem 
            icon={History} 
            label="Audit & History" 
            active={activeScreen === 'audit'} 
            onClick={() => setActiveScreen('audit')}
          />
          <SidebarItem 
            icon={Settings} 
            label="API Test" 
            active={activeScreen === 'api-test'} 
            onClick={() => setActiveScreen('api-test')}
          />
          
          <div className="mt-auto p-4 border-t border-white/10">
            <div className="bg-[#121821] p-3 rounded-sm border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Trust Score</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-mono font-bold text-white leading-none">A+</span>
                <span className="text-[9px] text-slate-600 font-bold">BLOCKCHAIN VERIFIED</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
