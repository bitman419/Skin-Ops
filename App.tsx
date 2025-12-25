
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Shield, 
  Sun, 
  Wind, 
  Clock, 
  Plus, 
  Settings, 
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Zap,
  Camera,
  Trash2,
  X,
  History as HistoryIcon,
  User,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { 
  SkinGoal, 
  ActiveType, 
  UserProfile, 
  SkinState, 
  EnvState, 
  RoutineLog, 
  SymptomLog,
  DecisionResult
} from './types';
import { calculateBarrierScore, getStatusColor, decideOnActive } from './services/engine';
import { GoogleGenAI } from '@google/genai';

// --- Types & Constants ---
type Screen = 'DASHBOARD' | 'ROUTINE' | 'ADD' | 'HISTORY' | 'PROFILE';

interface UserProduct {
  id: string;
  name: string;
  category: 'cleanse' | 'moisturize' | 'active' | 'sunscreen';
  actives: ActiveType[];
}

// --- Components ---

const Header: React.FC<{ onSettings: () => void }> = ({ onSettings }) => (
  <header className="flex justify-between items-center p-6 tactical-border bg-black/50 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
        <Activity className="text-black w-5 h-5" />
      </div>
      <h1 className="text-xl font-bold tracking-tighter font-space">SKIN OPS</h1>
    </div>
    <div className="flex items-center gap-4">
      <div className="text-xs font-mono text-zinc-500 hidden sm:block">STATUS: OPERATIONAL</div>
      <Settings className="w-5 h-5 text-zinc-400 cursor-pointer" onClick={onSettings} />
    </div>
  </header>
);

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const color = getStatusColor(score);
  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-zinc-900/50 rounded-2xl tactical-border">
      <div className="absolute top-2 right-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Barrier Health</div>
      <div className={`text-7xl font-bold font-space ${color} transition-all duration-700`}>
        {score}
      </div>
      <div className="text-xs text-zinc-400 mt-2 font-mono uppercase tracking-tighter">
        {score > 75 ? 'Resilient' : score > 55 ? 'Stable' : score > 30 ? 'Compromised' : 'Critical'}
      </div>
      
      <div className="w-full mt-6 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-current transition-all duration-1000 ${color}`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

const EnvCard: React.FC<{ env: EnvState }> = ({ env }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="p-4 bg-zinc-900/30 rounded-xl tactical-border flex items-center gap-3">
      <Sun className="text-yellow-500 w-5 h-5" />
      <div>
        <div className="text-[10px] text-zinc-500 uppercase font-mono">UV Index</div>
        <div className="text-sm font-bold">{env.uvIndex} <span className="text-xs font-normal text-zinc-400">High</span></div>
      </div>
    </div>
    <div className="p-4 bg-zinc-900/30 rounded-xl tactical-border flex items-center gap-3">
      <Droplets className="text-blue-400 w-5 h-5" />
      <div>
        <div className="text-[10px] text-zinc-500 uppercase font-mono">Humidity</div>
        <div className="text-sm font-bold">{env.humidity}%</div>
      </div>
    </div>
  </div>
);

const RoutineItem: React.FC<{ 
  title: string; 
  status: 'GREEN' | 'YELLOW' | 'RED';
  reason: string;
  suggestion: string;
}> = ({ title, status, reason, suggestion }) => {
  const statusConfig = {
    GREEN: { icon: <CheckCircle2 className="text-green-500" />, bg: 'border-green-500/30 bg-green-500/5' },
    YELLOW: { icon: <AlertTriangle className="text-yellow-500" />, bg: 'border-yellow-500/30 bg-yellow-500/5' },
    RED: { icon: <Shield className="text-red-500" />, bg: 'border-red-500/30 bg-red-500/5' }
  };

  return (
    <div className={`p-4 rounded-xl border ${statusConfig[status].bg} mb-3`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold flex items-center gap-2">
          {statusConfig[status].icon}
          {title}
        </h3>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-current ${status === 'GREEN' ? 'text-green-500' : status === 'YELLOW' ? 'text-yellow-500' : 'text-red-500'}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-zinc-300 mb-2">{reason}</p>
      <div className="bg-black/40 p-2 rounded text-xs font-mono text-zinc-400 flex gap-2 items-start">
        <Zap className="w-3 h-3 text-zinc-500 mt-0.5" />
        <div>RECMD: {suggestion}</div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('DASHBOARD');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Alex",
    goals: [SkinGoal.ACNE, SkinGoal.ANTI_AGING],
    sensitivity: 4,
    shaves: true,
    fragranceTolerance: false
  });

  const [products, setProducts] = useState<UserProduct[]>([
    { id: '1', name: 'Gentle Cleanser', category: 'cleanse', actives: [] },
    { id: '2', name: 'Retinol 0.5%', category: 'active', actives: [ActiveType.RETINOID] },
    { id: '3', name: 'Daily Sunscreen SPF 50', category: 'sunscreen', actives: [] },
  ]);

  const [skinState, setSkinState] = useState<SkinState>({
    barrierScore: 82,
    lastUpdated: Date.now(),
    currentSymptoms: {
      timestamp: Date.now(),
      stinging: false,
      redness: false,
      peeling: false,
      dryness: false,
      burning: false
    }
  });

  const [envState] = useState<EnvState>({
    uvIndex: 8,
    humidity: 22,
    temp: 84,
    pollution: 42
  });

  const [routineLogs, setRoutineLogs] = useState<RoutineLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Generate Decisions for current products
  const productDecisions = useMemo(() => {
    return products.map(p => {
      // For actives, run the engine. For others, assume Green unless barrier is critical.
      let decision: DecisionResult;
      if (p.category === 'active' && p.actives.length > 0) {
        decision = decideOnActive(p.actives[0], skinState.barrierScore, skinState.currentSymptoms, envState);
      } else {
        decision = {
          status: skinState.barrierScore < 30 ? 'YELLOW' : 'GREEN',
          reason: skinState.barrierScore < 30 ? 'Low barrier health - keep it simple.' : 'Safe for daily maintenance.',
          suggestion: skinState.barrierScore < 30 ? 'Apply to damp skin.' : 'Use as directed.'
        };
      }
      return { ...p, decision };
    });
  }, [products, skinState.barrierScore, skinState.currentSymptoms, envState]);

  const toggleSymptom = (symptom: keyof SymptomLog) => {
    if (symptom === 'timestamp') return;
    const newSymptoms = { ...skinState.currentSymptoms, [symptom]: !skinState.currentSymptoms[symptom] };
    const newScore = calculateBarrierScore(82, newSymptoms, routineLogs, envState);
    setSkinState({ ...skinState, currentSymptoms: newSymptoms, barrierScore: newScore });
    
    // Log to history if symptom is newly true
    if (newSymptoms[symptom]) {
      setRoutineLogs(prev => [{
        timestamp: Date.now(),
        productName: `SYMPTOM: ${symptom.toUpperCase()}`,
        category: 'cleanse', // placeholder
        activesUsed: []
      }, ...prev]);
    }
  };

  const handleScanProduct = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: file.type } },
            { text: "Analyze this skincare product. Identify the 'name', 'category' (choose from: cleanse, moisturize, active, sunscreen), and 'actives' (choose from: Retinoid, AHA/BHA, Vitamin C, Benzoyl Peroxide, Azelaic Acid, Niacinamide). Return as valid JSON with these keys." }
          ]
        }
      });

      const text = response.text || '{}';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(cleaned);

      const newProduct: UserProduct = {
        id: Date.now().toString(),
        name: result.name || 'Unknown Product',
        category: result.category || 'moisturize',
        actives: (result.actives || []).filter((a: string) => Object.values(ActiveType).includes(a as ActiveType))
      };

      setProducts(prev => [...prev, newProduct]);
      setCurrentScreen('ROUTINE');
    } catch (err) {
      console.error("Scanning failed", err);
      alert("AI Scan failed. Please try again or add manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // --- Screens ---

  const Dashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ScoreGauge score={skinState.barrierScore} />
      <EnvCard env={envState} />
      
      <section className="bg-zinc-900/40 p-5 rounded-2xl tactical-border">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold font-space">Symptom Pulse</h2>
            <p className="text-xs text-zinc-500">Real-time barrier health check</p>
          </div>
          <button 
            onClick={() => setShowCheckIn(!showCheckIn)}
            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg transition-colors"
          >
            {showCheckIn ? <ChevronRight className="rotate-90" /> : <Plus />}
          </button>
        </div>

        {showCheckIn && (
          <div className="grid grid-cols-2 gap-3 mt-6 animate-in slide-in-from-top duration-300">
            {['stinging', 'redness', 'peeling', 'dryness', 'burning'].map((sym) => (
              <button
                key={sym}
                onClick={() => toggleSymptom(sym as keyof SymptomLog)}
                className={`p-3 rounded-xl border text-sm font-mono uppercase transition-all ${
                  skinState.currentSymptoms[sym as keyof SymptomLog]
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold font-space uppercase tracking-tight">Priority Decisions</h2>
          </div>
          <button onClick={() => setCurrentScreen('ROUTINE')} className="text-xs text-zinc-500 flex items-center gap-1 font-mono uppercase">View All <ChevronRight className="w-3 h-3" /></button>
        </div>
        
        {productDecisions.filter(d => d.category === 'active').slice(0, 2).map((d) => (
          <RoutineItem 
            key={d.id}
            title={d.name}
            status={d.decision.status}
            reason={d.decision.reason}
            suggestion={d.decision.suggestion}
          />
        ))}
      </section>
    </div>
  );

  const RoutineView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-3xl font-bold font-space">MY SHELF</h2>
        <button onClick={() => setCurrentScreen('ADD')} className="text-xs font-mono uppercase bg-green-500 text-black px-3 py-1 rounded-full font-bold">+ Add</button>
      </div>

      <div className="space-y-8">
        {['cleanse', 'active', 'moisturize', 'sunscreen'].map(cat => (
          <div key={cat} className="space-y-3">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-1">{cat}s</h3>
            {productDecisions.filter(p => p.category === cat).map(p => (
              <div key={p.id} className="bg-zinc-900/40 p-4 rounded-xl tactical-border group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.decision.status === 'GREEN' ? 'bg-green-500' : p.decision.status === 'YELLOW' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="font-bold">{p.name}</span>
                  </div>
                  <button onClick={() => deleteProduct(p.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-zinc-400 mb-2">{p.actives.length > 0 ? p.actives.join(', ') : 'No heavy actives'}</div>
                <div className="text-[10px] bg-black/50 p-2 rounded text-zinc-500 font-mono italic">
                  OPS: {p.decision.reason}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const AddProductView = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setCurrentScreen('ROUTINE')} className="p-2 bg-zinc-900 rounded-full"><X className="w-5 h-5" /></button>
        <h2 className="text-2xl font-bold font-space">ACQUIRE PRODUCT</h2>
      </div>

      <div className="relative aspect-square w-full max-w-sm mx-auto bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 overflow-hidden group">
        {isScanning ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            <p className="font-mono text-xs uppercase text-green-500 animate-pulse">Analyzing Ingredients...</p>
          </div>
        ) : (
          <>
            <Camera className="w-16 h-16 text-zinc-700 group-hover:text-green-500 transition-colors" />
            <div className="text-center p-4">
              <p className="font-bold">Scan Product Bottle</p>
              <p className="text-xs text-zinc-500">AI will auto-detect category & actives</p>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleScanProduct}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="text-center">
          <p className="text-zinc-500 text-sm font-mono">— OR —</p>
        </div>
        <button className="w-full bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-left flex justify-between items-center group">
          <div>
            <div className="font-bold">Manual Entry</div>
            <div className="text-xs text-zinc-500">Type in details yourself</div>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-700 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  const HistoryView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <h2 className="text-3xl font-bold font-space">MISSION LOGS</h2>
      <div className="space-y-4">
        {routineLogs.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/20 rounded-2xl tactical-border text-zinc-600 italic">
            No history recorded yet. Use the symptom pulse to start logging.
          </div>
        ) : (
          routineLogs.map((log, i) => (
            <div key={i} className="p-4 bg-zinc-900/40 rounded-xl tactical-border flex justify-between items-center">
              <div>
                <div className="font-bold text-sm">{log.productName}</div>
                <div className="text-[10px] text-zinc-500 font-mono">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-[10px] font-mono text-green-500 bg-green-500/10 px-2 py-0.5 rounded">LOGGED</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-inter pb-24">
      <Header onSettings={() => setCurrentScreen('PROFILE')} />

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 space-y-8 overflow-y-auto">
        {currentScreen === 'DASHBOARD' && <Dashboard />}
        {currentScreen === 'ROUTINE' && <RoutineView />}
        {currentScreen === 'ADD' && <AddProductView />}
        {currentScreen === 'HISTORY' && <HistoryView />}
        {currentScreen === 'PROFILE' && (
          <div className="space-y-8 animate-in fade-in">
            <h2 className="text-3xl font-bold font-space">AGENT PROFILE</h2>
            <div className="p-6 bg-zinc-900 rounded-2xl tactical-border space-y-4">
               <div>
                  <label className="text-xs font-mono uppercase text-zinc-500">Name</label>
                  <p className="text-xl font-bold">{userProfile.name}</p>
               </div>
               <div>
                  <label className="text-xs font-mono uppercase text-zinc-500">Skin Goals</label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {userProfile.goals.map(g => <span key={g} className="bg-zinc-800 px-3 py-1 rounded text-xs">{g}</span>)}
                  </div>
               </div>
            </div>
            <button 
              onClick={() => {
                setProducts([{ id: '1', name: 'Gentle Cleanser', category: 'cleanse', actives: [] }, { id: '2', name: 'Retinol 0.5%', category: 'active', actives: [ActiveType.RETINOID] }, { id: '3', name: 'Daily Sunscreen SPF 50', category: 'sunscreen', actives: [] }]);
                setSkinState(s => ({...s, barrierScore: 82, currentSymptoms: { timestamp: Date.now(), stinging: false, redness: false, peeling: false, dryness: false, burning: false }}));
              }}
              className="w-full p-4 bg-red-900/20 text-red-500 rounded-xl font-mono text-xs border border-red-500/20 hover:bg-red-900/40 transition-all"
            >
              RESET LOCAL AGENT DATA
            </button>
          </div>
        )}

        {/* SECTION 14: DISCLAIMER (MANDATORY) */}
        <footer className="mt-12 p-4 bg-zinc-900/20 rounded-lg border border-zinc-800/50">
          <div className="flex gap-3 text-zinc-600 text-[10px] leading-relaxed">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p>
              SKIN OPS IS AN INFORMATIONAL TOOL. WE DO NOT PROVIDE MEDICAL ADVICE OR DIAGNOSES. 
              IF YOU EXPERIENCE SEVERE SWELLING, BLEEDING, OR SIGNS OF INFECTION, SEEK PROFESSIONAL 
              MEDICAL CARE IMMEDIATELY.
            </p>
          </div>
        </footer>
      </main>

      {/* STICKY CTA */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-zinc-800 flex justify-around items-center z-50">
        <button 
          onClick={() => setCurrentScreen('DASHBOARD')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'DASHBOARD' ? 'text-green-500' : 'text-zinc-500'}`}
        >
          <Activity className="w-6 h-6" />
          <span className="text-[10px] font-mono uppercase">Ops</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('ROUTINE')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'ROUTINE' ? 'text-green-500' : 'text-zinc-500'}`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-[10px] font-mono uppercase">Safe</span>
        </button>
        <div className="relative -mt-12">
          <button 
            onClick={() => setCurrentScreen('ADD')}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-110 active:scale-95 transition-all"
          >
            <Plus className="text-black w-8 h-8" />
          </button>
        </div>
        <button 
          onClick={() => setCurrentScreen('HISTORY')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'HISTORY' ? 'text-green-500' : 'text-zinc-500'}`}
        >
          <HistoryIcon className="w-6 h-6" />
          <span className="text-[10px] font-mono uppercase">Log</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('PROFILE')}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === 'PROFILE' ? 'text-green-500' : 'text-zinc-500'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-mono uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
}
