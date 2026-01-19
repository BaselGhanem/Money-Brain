const { useState, useEffect, useMemo, useRef, useContext, createContext } = React;
const { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, 
  Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area 
} = Recharts;

// --- ICONS MAPPING ---
const { 
  LayoutDashboard, PieChart: IconPieChart, Target, Settings, Plus, 
  BrainCircuit, Wallet, LogOut, CreditCard, Layers, X, Mic, Check, 
  ArrowRightLeft, Trash2, HelpCircle, Utensils, Car, Receipt, Gamepad2, 
  ShoppingBag, HeartPulse, Briefcase, GraduationCap, TrendingUp, Coffee, 
  Home, Plane, Wifi, Smartphone, Gift, Music, Zap, Anchor, Wrench, 
  Book, Camera, Dumbbell, Star, ShoppingCart, Truck, Umbrella, Watch, 
  Sun, Moon, ArrowUpRight, ArrowDownRight, Activity, Eye, EyeOff, Search, 
  Pencil, Download, Upload, Filter, Calculator, Divide, User, Bell, 
  WifiOff, Trophy, Quote, Calendar, Share2, Fingerprint, Lock, Delete, AlertTriangle, Sliders
} = lucideReact;

// Dynamic Icon Component
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    Utensils, Car, Receipt, Gamepad2, ShoppingBag, HeartPulse, Briefcase, 
    GraduationCap, TrendingUp, ArrowRightLeft, Coffee, Home, Plane, Wifi, 
    Smartphone, Gift, Music, Zap, Anchor, Wrench, Book, Camera, Dumbbell, 
    Star, ShoppingCart, Truck, Umbrella, Watch, Sun, Moon, Calculator, Divide,
    User, Bell, Trophy, Share2, Target, CreditCard, Layers, BrainCircuit
  };
  const LucideIcon = icons[name] || HelpCircle;
  return <LucideIcon size={size} className={className} />;
};

// --- UTILITIES & SERVICES ---

const playSound = (type) => {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  
  if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'success') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'delete') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }
};

const vibrate = (pattern = 5) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};

const triggerConfetti = () => {
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.backgroundColor = ['#00d2ff', '#7000ff', '#00ff9d', '#ff0055'][Math.floor(Math.random() * 4)];
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
};

const formatCurrency = (amount, currency, privacy) => {
  if (privacy) return '******';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

// --- DATA ---
const DEFAULT_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils', color: '#ffcc00', type: 'expense' },
  { id: 'transport', label: 'Transport', icon: 'Car', color: '#3a86ff', type: 'expense' },
  { id: 'bills', label: 'Bills & Utils', icon: 'Receipt', color: '#ff0055', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#7000ff', type: 'expense' },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#00d2ff', type: 'expense' },
  { id: 'health', label: 'Health', icon: 'HeartPulse', color: '#00ff9d', type: 'expense' },
  { id: 'work', label: 'Business', icon: 'Briefcase', color: '#ffffff', type: 'income' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', color: '#f97316', type: 'expense' },
  { id: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#10b981', type: 'both' },
  { id: 'transfer', label: 'Transfer', icon: 'ArrowRightLeft', color: '#888888', type: 'both' },
];

const ACCOUNT_COLORS = [
  'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', 
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', 
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #232526 0%, #414345 100%)',
];

const CATEGORY_COLORS = [
  '#ffcc00', '#3a86ff', '#ff0055', '#7000ff', '#00d2ff', '#00ff9d', 
  '#ffffff', '#f97316', '#10b981', '#888888', '#ec4899', '#6366f1'
];

const QUOTES = [
  "Do not save what is left after spending, but spend what is left after saving.",
  "Financial freedom is available to those who learn about it and work for it.",
  "Beware of little expenses. A small leak will sink a great ship.",
  "It's not how much money you make, but how much money you keep."
];

const MOODS = [
  { id: 'happy', label: 'Confident', emoji: '🤩' },
  { id: 'neutral', label: 'Neutral', emoji: '😐' },
  { id: 'stressed', label: 'Stressed', emoji: '🤯' },
  { id: 'impulsive', label: 'Impulsive', emoji: '💸' },
];

// --- COMPONENTS ---

// 1. Charts
const CategoryChart = ({ transactions, categories = [] }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const data = categories.map(cat => {
    const total = expenses
      .filter(t => t.category === cat.id)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { name: cat.label, value: total, color: cat.color };
  }).filter(d => d.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1a1d24', borderRadius: '8px', border: '1px solid #333', color: '#fff' }} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const MoodChart = ({ transactions }) => {
  const data = [
    { name: 'Happy', value: transactions.filter(t => t.mood === 'happy' && t.type === 'expense').reduce((a,c) => a + c.amount, 0) },
    { name: 'Stressed', value: transactions.filter(t => t.mood === 'stressed' && t.type === 'expense').reduce((a,c) => a + c.amount, 0) },
    { name: 'Impulsive', value: transactions.filter(t => t.mood === 'impulsive' && t.type === 'expense').reduce((a,c) => a + c.amount, 0) },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={80} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a1d24', borderRadius: '8px', border: '1px solid #333' }} />
          <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 1 ? '#ff0055' : index === 2 ? '#ffcc00' : '#00d2ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const NetWorthChart = ({ transactions }) => {
  const data = useMemo(() => {
    if (transactions.length === 0) return [];
    const sorted = [...transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 0;
    const daily = {};
    sorted.forEach(t => {
      const day = new Date(t.date).toLocaleDateString();
      if (t.type === 'income') runningBalance += t.amount;
      if (t.type === 'expense') runningBalance -= t.amount;
      daily[day] = runningBalance;
    });
    const keys = Object.keys(daily);
    const recentKeys = keys.slice(-10);
    return recentKeys.map(k => ({ name: k, amount: daily[k] }));
  }, [transactions]);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ backgroundColor: '#1a1d24', border: 'none', color: '#fff' }} />
          <Area type="monotone" dataKey="amount" stroke="#00d2ff" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 2. Lock Screen
const LockScreen = ({ pin, onUnlock }) => {
   const [input, setInput] = useState('');
   const [error, setError] = useState(false);
   const [isBiometricScan, setIsBiometricScan] = useState(false);

   useEffect(() => {
      if(input.length === 4) {
         if(input === pin) { playSound('success'); onUnlock(); }
         else {
            setError(true);
            vibrate([50, 50, 50]);
            playSound('delete');
            setTimeout(() => { setInput(''); setError(false); }, 500);
         }
      }
   }, [input]);

   const numClick = (n) => {
      if(input.length < 4) {
         playSound('click');
         vibrate(5);
         setInput(p => p + n);
      }
   }

   const handleBiometric = () => {
      setIsBiometricScan(true);
      playSound('success');
      setTimeout(() => { onUnlock(); }, 1200);
   };

   if (isBiometricScan) {
      return (
        <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
            <Fingerprint size={80} className="text-primary relative z-10" />
          </div>
          <p className="mt-8 text-primary font-bold tracking-widest animate-pulse">VERIFYING...</p>
        </div>
      );
   }

   return (
      <div className="fixed inset-0 bg-dark z-[999] flex flex-col items-center justify-center p-4">
         <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800 shadow-2xl shadow-primary/10">
               <Lock size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
         </div>

         <div className={`flex gap-4 mb-10 p-4 rounded-xl ${error ? 'animate-pulse bg-danger/10' : ''}`}>
            {[0,1,2,3].map(i => (
               <div key={i} className={`w-4 h-4 rounded-full border transition-all ${i < input.length ? 'bg-primary border-primary' : 'border-gray-700'}`}/>
            ))}
         </div>

         <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={()=>numClick(n)} className="w-20 h-20 rounded-full bg-surface border border-gray-800 text-2xl font-bold hover:bg-white/10">{n}</button>)}
            <button onClick={handleBiometric} className="w-20 h-20 flex items-center justify-center text-success bg-surface rounded-full border border-gray-800"><Fingerprint size={28}/></button>
            <button onClick={()=>numClick(0)} className="w-20 h-20 rounded-full bg-surface border border-gray-800 text-2xl font-bold hover:bg-white/10">0</button>
            <button onClick={()=>{setInput(p=>p.slice(0,-1)); playSound('click');}} className="w-20 h-20 flex items-center justify-center text-danger bg-surface rounded-full border border-gray-800"><Delete size={28}/></button>
         </div>
      </div>
   );
};

// 3. Modals
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
};

const TransactionModal = ({ isOpen, onClose, onSave, onDelete, accounts, categories, editingTransaction }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(categories[0]?.id || 'food');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [mood, setMood] = useState('neutral');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setDesc(editingTransaction.desc);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setAccountId(editingTransaction.accountId);
      setToAccountId(editingTransaction.toAccountId || '');
      setIsRecurring(!!editingTransaction.isRecurring);
      setMood(editingTransaction.mood || 'neutral');
    } else {
      setDesc('');
      setAmount('');
      setType('expense');
      setCategory(categories[0]?.id || 'food');
      setAccountId(accounts[0]?.id || '');
      setToAccountId('');
      setIsRecurring(false);
      setMood('neutral');
    }
  }, [editingTransaction, isOpen, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !accountId) return;
    playSound('success');
    vibrate(10);
    onSave({
      id: editingTransaction?.id,
      date: editingTransaction?.date,
      desc,
      amount: parseFloat(amount),
      type,
      category: type === 'transfer' ? 'transfer' : category,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      isRecurring,
      mood
    });
    onClose();
  };

  const toggleListening = () => {
    setIsListening(true);
    // Mock voice recognition
    setTimeout(() => {
      setIsListening(false);
      setDesc('Dinner with friends');
      setAmount('25');
      playSound('success');
    }, 1500);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex bg-elevated p-1 rounded-xl">
          {['expense', 'income', 'transfer'].map(t => (
            <button key={t} type="button" onClick={() => { setType(t); playSound('click'); }} className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${type === t ? 'bg-primary text-black' : 'text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-elevated border border-gray-700 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white focus:border-primary focus:ring-1 outline-none transition-all" autoFocus />
        </div>

        <div className="relative">
           <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none" placeholder="Description" />
           <button type="button" onClick={toggleListening} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${isListening ? 'bg-danger text-white animate-pulse' : 'text-primary'}`}>
             <Mic size={18} />
           </button>
        </div>

        <div>
           <label className="text-xs text-gray-500 uppercase block mb-1">Account</label>
           <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
           </select>
        </div>

        {type === 'transfer' && (
           <div className="animate-slide-up">
              <div className="flex justify-center my-2 text-primary"><ArrowRightLeft size={16}/></div>
              <label className="text-xs text-gray-500 uppercase block mb-1">To Account</label>
              <select value={toAccountId} onChange={e => setToAccountId(e.target.value)} className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white">
                 <option value="" disabled>Select Destination</option>
                 {accounts.filter(a => a.id !== accountId).map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
           </div>
        )}

        {type !== 'transfer' && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {categories.filter(c => c.id !== 'transfer').map((cat) => (
                <button key={cat.id} type="button" onClick={() => { setCategory(cat.id); playSound('click'); }} className={`p-2 rounded-lg border transition-all flex items-center gap-1 ${category === cat.id ? 'bg-primary/20 border-primary text-primary' : 'bg-elevated border-transparent text-gray-400 hover:border-gray-600'}`}>
                  <Icon name={cat.icon} size={14} />
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {type === 'expense' && (
           <div className="flex gap-2">
              {MOODS.map(m => (
                 <button key={m.id} type="button" onClick={() => setMood(m.id)} className={`flex-1 py-2 rounded-xl text-xl border transition-all ${mood === m.id ? 'bg-accent/20 border-accent' : 'bg-elevated border-transparent'}`}>
                    {m.emoji}
                 </button>
              ))}
           </div>
        )}

        <div className="flex items-center gap-2">
           <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4" />
           <span className="text-sm text-gray-400">Recurring Monthly</span>
        </div>

        <div className="flex gap-3">
           {editingTransaction && onDelete && (
              <button type="button" onClick={() => { onDelete(editingTransaction.id); onClose(); }} className="flex-1 bg-danger/10 text-danger font-bold py-4 rounded-xl flex items-center justify-center"><Trash2 size={20}/></button>
           )}
           <button type="submit" className="flex-[4] bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2">
             <Check size={20} /> Save
           </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// 4. Screens

const Dashboard = ({ transactions, accounts, categories, settings, onEditTx, onTogglePrivacy }) => {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  
  const totalBalance = accounts.reduce((total, acc) => {
     const accTx = transactions.filter(t => t.accountId === acc.id || t.toAccountId === acc.id);
     const accBal = accTx.reduce((bal, t) => {
        if (t.accountId === acc.id) return t.type === 'income' ? bal + t.amount : bal - t.amount;
        if (t.toAccountId === acc.id && t.type === 'transfer') return bal + t.amount;
        return bal;
     }, acc.initialBalance);
     return total + accBal;
  }, 0);

  const format = (amt) => formatCurrency(amt, settings.currency, settings.privacyMode);
  const income = transactions.filter(t => t.type === 'income').reduce((a,c) => a+c.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a,c) => a+c.amount, 0);

  const addQuick = (catId, amt, desc) => {
    onEditTx({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: amt,
      desc: desc,
      type: 'expense',
      category: catId,
      accountId: accounts[0]?.id || '1',
      mood: 'neutral'
    }, true);
    triggerConfetti();
    playSound('success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hi, {settings.userName}</h1>
          <p className="text-gray-500 text-sm">{quote}</p>
        </div>
        <div className="flex gap-2">
           <button onClick={onTogglePrivacy} className="p-2 bg-elevated rounded-full hover:bg-gray-800">
             {settings.privacyMode ? <EyeOff size={20} className="text-gray-400"/> : <Eye size={20} className="text-primary"/>}
           </button>
           <div className="relative">
              <Bell size={20} className="text-gray-400 mt-2"/>
              <span className="absolute top-1 right-0 w-2 h-2 bg-danger rounded-full"></span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-br from-elevated to-surface border border-gray-800 p-6 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
           <div className="relative z-10">
              <span className="text-gray-400 text-sm">Total Net Worth</span>
              <div className="text-4xl font-bold mt-2 text-white">{format(totalBalance)}</div>
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2 text-success">
                   <div className="p-1 bg-success/10 rounded-lg"><ArrowUpRight size={16}/></div>
                   <span className="text-sm font-bold">{format(income)}</span>
                </div>
                <div className="flex items-center gap-2 text-danger">
                   <div className="p-1 bg-danger/10 rounded-lg"><ArrowDownRight size={16}/></div>
                   <span className="text-sm font-bold">{format(expense)}</span>
                </div>
              </div>
           </div>
        </div>
        <div className="bg-elevated border border-gray-800 p-6 rounded-2xl text-center">
           <Trophy className="mx-auto text-warning mb-2" size={32} />
           <div className="font-bold text-white">Level 5 Saver</div>
           <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
             <div className="bg-warning h-2 rounded-full" style={{width: '70%'}}></div>
           </div>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
         {accounts.map(acc => (
            <div key={acc.id} className="min-w-[150px] p-4 rounded-xl bg-elevated border border-gray-800 relative overflow-hidden h-24 flex flex-col justify-between">
               <div className="absolute right-0 top-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8"></div>
               <span className="text-xs font-bold text-gray-400">{acc.name}</span>
               <div className="h-1 bg-gray-700 rounded-full w-full"><div className="h-full rounded-full" style={{background: acc.color, width: '60%'}}></div></div>
            </div>
         ))}
      </div>

      <div>
         <h3 className="font-bold mb-3">Quick Add</h3>
         <div className="flex gap-3">
            <button onClick={() => addQuick('food', 5, 'Coffee')} className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-full border border-gray-700 hover:border-primary transition-colors">
               <Coffee size={16} className="text-warning"/> <span>Coffee (5)</span>
            </button>
            <button onClick={() => addQuick('transport', 2, 'Bus Ticket')} className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-full border border-gray-700 hover:border-primary transition-colors">
               <Car size={16} className="text-secondary"/> <span>Bus (2)</span>
            </button>
            <button onClick={() => addQuick('food', 10, 'Lunch')} className="flex items-center gap-2 px-4 py-2 bg-elevated rounded-full border border-gray-700 hover:border-primary transition-colors">
               <Utensils size={16} className="text-success"/> <span>Lunch (10)</span>
            </button>
         </div>
      </div>

      <div>
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <div className="relative mb-4">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
             <input type="text" placeholder="Search..." className="bg-elevated border-none rounded-full py-2 pl-9 pr-4 text-sm text-white w-full" />
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(tx => {
             const cat = categories.find(c => c.id === tx.category) || categories[0];
             return (
               <div key={tx.id} onClick={() => onEditTx(tx)} className="bg-surface p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-elevated transition-colors border border-gray-800/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center text-black" style={{background: cat.color}}>
                        <Icon name={cat.icon} size={18}/>
                     </div>
                     <div>
                        <div className="font-bold">{tx.desc}</div>
                        <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</div>
                     </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-white'}`}>
                     {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                  </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

const Tools = () => {
   const [activeTool, setActiveTool] = useState('simulator');
   
   const Splitter = () => {
      const [total, setTotal] = useState('');
      const [people, setPeople] = useState(2);
      const [tip, setTip] = useState(0);
      const perPerson = total ? ((parseFloat(total) * (1 + tip/100)) / people).toFixed(2) : '0.00';
      return (
         <div className="space-y-4 animate-slide-up">
            <div className="flex gap-2">
               <input type="number" value={total} onChange={e=>setTotal(e.target.value)} placeholder="Total Bill" className="flex-1 bg-elevated p-3 rounded-xl border border-gray-700 text-white"/>
               <input type="number" value={people} onChange={e=>setPeople(e.target.value)} placeholder="People" className="w-20 bg-elevated p-3 rounded-xl border border-gray-700 text-white"/>
            </div>
            <div>
               <label className="text-xs text-gray-400">Tip: {tip}%</label>
               <input type="range" min="0" max="30" step="5" value={tip} onChange={e=>setTip(parseInt(e.target.value))} className="w-full"/>
            </div>
            <div className="bg-surface p-6 rounded-xl text-center border border-gray-800">
               <div className="text-sm text-gray-400">Per Person</div>
               <div className="text-4xl font-bold text-primary">{perPerson}</div>
            </div>
         </div>
      );
   };

   const LoanCalc = () => {
      const [amount, setAmount] = useState(10000);
      const [rate, setRate] = useState(5);
      const [years, setYears] = useState(5);
      const r = rate / 100 / 12;
      const n = years * 12;
      const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return (
         <div className="space-y-4 animate-slide-up">
            <div className="space-y-2">
               <label className="text-xs text-gray-400">Loan: {amount}</label>
               <input type="range" min="1000" max="100000" step="1000" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full"/>
               <label className="text-xs text-gray-400">Interest: {rate}%</label>
               <input type="range" min="1" max="20" step="0.1" value={rate} onChange={e=>setRate(e.target.value)} className="w-full"/>
               <label className="text-xs text-gray-400">Years: {years}</label>
               <input type="range" min="1" max="30" value={years} onChange={e=>setYears(e.target.value)} className="w-full"/>
            </div>
            <div className="bg-surface p-6 rounded-xl text-center border border-gray-800">
               <div className="text-sm text-gray-400">Monthly Payment</div>
               <div className="text-4xl font-bold text-danger">{monthly.toFixed(2)}</div>
            </div>
         </div>
      )
   }

   const Simulator = () => {
      const [loan, setLoan] = useState(0);
      const [cutback, setCutback] = useState(0);
      const [extraIncome, setExtraIncome] = useState(0);
      const baseExpense = 1200;
      const simulatedExpense = baseExpense - (baseExpense * (cutback / 100)) + loan;
      const monthlyNet = (1500 + extraIncome) - simulatedExpense;
      const proj = monthlyNet * 6;
      return (
         <div className="space-y-6 animate-slide-up">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-3xl text-center border border-white/10">
               <h2 className="text-2xl font-bold">Future Simulator</h2>
               <div className={`text-4xl font-bold my-2 ${proj>=0?'text-success':'text-danger'}`}>{proj.toFixed(0)}</div>
               <p className="text-indigo-200 text-sm">Projected 6-Month Savings</p>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-gray-800 space-y-4">
               <div>
                  <label className="text-xs text-gray-400">Cutback: {cutback}%</label>
                  <input type="range" min="0" max="50" value={cutback} onChange={e=>setCutback(Number(e.target.value))} className="w-full"/>
               </div>
               <div>
                  <label className="text-xs text-gray-400">Side Hustle: {extraIncome}</label>
                  <input type="range" min="0" max="1000" value={extraIncome} onChange={e=>setExtraIncome(Number(e.target.value))} className="w-full"/>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold">Financial Tools</h2>
         <div className="flex bg-elevated p-1 rounded-xl overflow-x-auto">
            <button onClick={() => setActiveTool('simulator')} className={`flex-1 py-2 px-4 whitespace-nowrap rounded-lg ${activeTool==='simulator' ? 'bg-primary text-black' : 'text-gray-400'}`}>Simulator</button>
            <button onClick={() => setActiveTool('split')} className={`flex-1 py-2 px-4 whitespace-nowrap rounded-lg ${activeTool==='split' ? 'bg-primary text-black' : 'text-gray-400'}`}>Split Bill</button>
            <button onClick={() => setActiveTool('loan')} className={`flex-1 py-2 px-4 whitespace-nowrap rounded-lg ${activeTool==='loan' ? 'bg-primary text-black' : 'text-gray-400'}`}>Loan Calc</button>
         </div>
         {activeTool === 'split' ? <Splitter /> : activeTool === 'loan' ? <LoanCalc /> : <Simulator />}
      </div>
   );
};

const Wallets = ({ accounts, transactions, onEditAccount, onAddAccount }) => {
   return (
      <div className="space-y-6 animate-slide-up">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Wallets</h2>
            <button onClick={onAddAccount} className="bg-white text-black px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1"><Plus size={16}/> Add</button>
         </div>
         <div className="grid md:grid-cols-2 gap-4">
            {accounts.map(acc => (
               <div key={acc.id} onClick={() => onEditAccount(acc)} className="p-6 rounded-2xl relative overflow-hidden shadow-lg group cursor-pointer" style={{background: acc.color}}>
                  <div className="flex justify-between items-start text-white relative z-10">
                     <span className="font-bold text-xl text-shadow">{acc.name}</span>
                     {acc.type === 'cash' ? <Wallet /> : <CreditCard />}
                  </div>
                  <div className="relative z-10 mt-4 text-2xl font-mono text-shadow">{formatCurrency(acc.initialBalance, 'JOD', false)}</div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
               </div>
            ))}
         </div>
      </div>
   );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLocked, setIsLocked] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
     currency: 'JOD', userName: 'User', pin: '1234', theme: 'dark', privacyMode: false
  });
  
  // Modals
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const loadedTx = JSON.parse(localStorage.getItem('mb_transactions') || '[]');
    const loadedAcc = JSON.parse(localStorage.getItem('mb_accounts') || JSON.stringify([
       { id: '1', name: 'Cash', type: 'cash', color: '#10b981', initialBalance: 0 }
    ]));
    const loadedCat = JSON.parse(localStorage.getItem('mb_categories') || JSON.stringify(DEFAULT_CATEGORIES));
    const loadedSet = JSON.parse(localStorage.getItem('mb_settings') || JSON.stringify(settings));
    
    setTransactions(loadedTx);
    setAccounts(loadedAcc);
    setCategories(loadedCat);
    setSettings(loadedSet);

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    if (loadedSet.theme === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => localStorage.setItem('mb_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('mb_accounts', JSON.stringify(accounts)), [accounts]);
  useEffect(() => localStorage.setItem('mb_settings', JSON.stringify(settings)), [settings]);

  const handleTxSave = (tx, direct = false) => {
    if (direct) {
       setTransactions(prev => [tx, ...prev]);
    } else if (tx.id) {
       setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
    } else {
       const newTx = { ...tx, id: Date.now().toString(), date: new Date().toISOString() };
       setTransactions(prev => [newTx, ...prev]);
       if(newTx.type === 'expense' && Math.abs(newTx.amount) >= 100) triggerConfetti();
    }
    setEditingTx(null);
  };

  const handleTxDelete = (id) => {
     setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAccountSave = (acc) => {
     if(acc.id && accounts.some(a => a.id === acc.id)) {
        setAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
     } else {
        setAccounts(prev => [...prev, {...acc, id: Date.now().toString()}]);
     }
     setEditingAccount(null);
  };

  const exportCSV = () => {
     const headers = "Date,Description,Amount,Type,Category\n";
     const rows = transactions.map(t => `${t.date},${t.desc},${t.amount},${t.type},${t.category}`).join("\n");
     const blob = new Blob([headers + rows], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'money_brain_export.csv';
     a.click();
     playSound('success');
  };

  const resetData = () => {
     if(confirm("Factory Reset: Are you sure?")) {
        localStorage.clear();
        window.location.reload();
     }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'wallets', icon: Wallet, label: 'Wallets' },
    { id: 'add', icon: Plus, label: 'Add', isFab: true },
    { id: 'tools', icon: Calculator, label: 'Tools' },
    { id: 'analytics', icon: IconPieChart, label: 'Stats' },
  ];

  return (
    <>
      {isLocked && <LockScreen pin={settings.pin} onUnlock={() => setIsLocked(false)} />}
      
      {!isLocked && (
        <div className={`flex flex-col h-screen ${settings.theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-dark text-white'}`}>
          {!isOnline && <div className="bg-danger text-white text-center text-xs py-1">Offline Mode - Changes Saved Locally</div>}
          
          <main className="flex-1 overflow-y-auto p-4 pb-24 scroll-smooth">
             {activeTab === 'dashboard' && (
                <Dashboard 
                  transactions={transactions} 
                  accounts={accounts} 
                  categories={categories}
                  settings={settings}
                  onEditTx={(tx, direct) => { if(direct) handleTxSave(tx, true); else { setEditingTx(tx); setIsTxModalOpen(true); }}}
                  onTogglePrivacy={() => setSettings(s => ({...s, privacyMode: !s.privacyMode}))}
                />
             )}
             
             {activeTab === 'wallets' && (
                <Wallets 
                   accounts={accounts} 
                   transactions={transactions}
                   onEditAccount={(acc) => { setEditingAccount(acc); setIsAccountModalOpen(true); }}
                   onAddAccount={() => { setEditingAccount(null); setIsAccountModalOpen(true); }}
                />
             )}

             {activeTab === 'analytics' && (
                <div className="space-y-6 animate-slide-up">
                   <h2 className="text-2xl font-bold">Analytics</h2>
                   <div className="bg-surface p-4 rounded-2xl border border-gray-800">
                      <h3 className="mb-4 text-gray-400">Spending Breakdown</h3>
                      <CategoryChart transactions={transactions} categories={categories} />
                   </div>
                   <div className="bg-surface p-4 rounded-2xl border border-gray-800">
                      <h3 className="mb-4 text-gray-400">Emotional Spending</h3>
                      <MoodChart transactions={transactions} />
                   </div>
                   <div className="bg-surface p-4 rounded-2xl border border-gray-800">
                      <h3 className="mb-4 text-gray-400">Net Worth History</h3>
                      <NetWorthChart transactions={transactions} />
                   </div>
                </div>
             )}

             {activeTab === 'tools' && (
                <div className="space-y-8 animate-slide-up">
                   <Tools />
                   
                   <div className="border-t border-gray-800 pt-8">
                      <h3 className="font-bold mb-4">Settings</h3>
                      <div className="bg-surface rounded-2xl border border-gray-800 divide-y divide-gray-800">
                         <div className="p-4 flex justify-between items-center" onClick={() => {
                            const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
                            setSettings({...settings, theme: newTheme});
                            if (newTheme === 'light') document.documentElement.classList.remove('dark');
                            else document.documentElement.classList.add('dark');
                         }}>
                            <span>Dark Mode</span>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.theme === 'dark' ? 'bg-primary' : 'bg-gray-600'}`}>
                               <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.theme === 'dark' ? 'translate-x-4' : ''}`}></div>
                            </div>
                         </div>
                         <div className="p-4 flex justify-between items-center" onClick={exportCSV}>
                            <span>Export CSV</span>
                            <Download size={18} className="text-success"/>
                         </div>
                         <div className="p-4 flex justify-between items-center" onClick={() => setIsLocked(true)}>
                            <span className="text-gray-400">Lock App</span>
                            <LogOut size={18} />
                         </div>
                         <div className="p-4 flex justify-between items-center text-danger" onClick={resetData}>
                            <span>Factory Reset</span>
                            <Trash2 size={18} />
                         </div>
                      </div>
                   </div>
                </div>
             )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-gray-800 pb-safe z-50">
             <div className="flex justify-around items-center p-2">
                {navItems.map(item => {
                   const IconComp = item.icon;
                   if (item.isFab) {
                      return (
                         <button key={item.id} onClick={() => { setIsTxModalOpen(true); playSound('click'); }} className="relative -top-6 w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center text-white border-4 border-dark hover:scale-110 transition-transform">
                            <Plus size={28} />
                         </button>
                      );
                   }
                   return (
                      <button key={item.id} onClick={() => { setActiveTab(item.id); playSound('click'); }} className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-primary' : 'text-gray-500'}`}>
                         <IconComp size={20} />
                         <span className="text-[10px]">{item.label}</span>
                      </button>
                   )
                })}
             </div>
          </nav>

          <TransactionModal 
            isOpen={isTxModalOpen}
            onClose={() => { setIsTxModalOpen(false); setEditingTx(null); }}
            onSave={handleTxSave}
            onDelete={handleTxDelete}
            accounts={accounts}
            categories={categories}
            editingTransaction={editingTx}
          />
          
          <ModalWrapper isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title={editingAccount ? "Edit Wallet" : "Add Wallet"}>
             <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.target);
                 handleAccountSave({
                    id: editingAccount?.id,
                    name: formData.get('name'),
                    initialBalance: parseFloat(formData.get('balance')),
                    type: 'card',
                    color: ACCOUNT_COLORS[0] // Simplify for single file
                 });
                 setIsAccountModalOpen(false);
             }} className="space-y-4">
                <input name="name" defaultValue={editingAccount?.name} placeholder="Wallet Name" className="w-full bg-elevated p-3 rounded-xl border border-gray-700 text-white" required />
                <input name="balance" type="number" defaultValue={editingAccount?.initialBalance} placeholder="Balance" className="w-full bg-elevated p-3 rounded-xl border border-gray-700 text-white" required />
                <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded-xl">Save Wallet</button>
             </form>
          </ModalWrapper>
        </div>
      )}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);