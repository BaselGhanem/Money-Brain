const { useState, useEffect, useMemo, useRef, useContext, createContext } = React;
const { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, 
  Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area 
} = Recharts;

// --- ICONS MAPPING ---
// Lucide UMD exports as window.lucideReact
const { 
  LayoutDashboard, PieChart: IconPieChart, Target, Settings, Plus, 
  BrainCircuit, Wallet, LogOut, CreditCard, Layers, X, Mic, Check, 
  ArrowRightLeft, Trash2, HelpCircle, Utensils, Car, Receipt, Gamepad2, 
  ShoppingBag, HeartPulse, Briefcase, GraduationCap, TrendingUp, Coffee, 
  Home, Plane, Wifi, Smartphone, Gift, Music, Zap, Anchor, Wrench, 
  Book, Camera, Dumbbell, Star, ShoppingCart, Truck, Umbrella, Watch, 
  Sun, Moon, ArrowUpRight, ArrowDownRight, Activity, Eye, EyeOff, Search, 
  Pencil, Download, Upload, Filter, Calculator, Divide, User, Bell, 
  WifiOff, Trophy, Quote, Calendar, Share2
} = lucideReact;

const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    Utensils, Car, Receipt, Gamepad2, ShoppingBag, HeartPulse, Briefcase, 
    GraduationCap, TrendingUp, ArrowRightLeft, Coffee, Home, Plane, Wifi, 
    Smartphone, Gift, Music, Zap, Anchor, Wrench, Book, Camera, Dumbbell, 
    Star, ShoppingCart, Truck, Umbrella, Watch, Sun, Moon, Calculator, Divide,
    User, Bell, Trophy, Share2
  };
  const LucideIcon = icons[name] || HelpCircle;
  return <LucideIcon size={size} className={className} />;
};

// --- SOUNDS & UTILS ---
const playSound = (type) => {
  // Simple synthesizer for SFX to avoid external assets
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
    gain.gain.setValueAtTime(0.1, now);
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

// --- DATA & CONSTANTS ---
const QUOTES = [
  "Do not save what is left after spending, but spend what is left after saving.",
  "A penny saved is a penny earned.",
  "Financial freedom is available to those who learn about it and work for it.",
  "Beware of little expenses. A small leak will sink a great ship.",
  "It's not how much money you make, but how much money you keep."
];

const DEFAULT_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils', color: '#ffcc00', type: 'expense', budget: 500 },
  { id: 'transport', label: 'Transport', icon: 'Car', color: '#3a86ff', type: 'expense', budget: 200 },
  { id: 'bills', label: 'Bills & Utils', icon: 'Receipt', color: '#ff0055', type: 'expense', budget: 300 },
  { id: 'entertainment', label: 'Entertainment', icon: 'Gamepad2', color: '#7000ff', type: 'expense', budget: 150 },
  { id: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: '#00d2ff', type: 'expense', budget: 400 },
  { id: 'health', label: 'Health', icon: 'HeartPulse', color: '#00ff9d', type: 'expense', budget: 100 },
  { id: 'work', label: 'Business', icon: 'Briefcase', color: '#ffffff', type: 'income', budget: 0 },
  { id: 'education', label: 'Education', icon: 'GraduationCap', color: '#f97316', type: 'expense', budget: 1000 },
  { id: 'investment', label: 'Investment', icon: 'TrendingUp', color: '#10b981', type: 'both', budget: 0 },
];

const BADGES = [
  { id: 'saver_1', label: 'Novice Saver', desc: 'Saved 100 JOD total', threshold: 100, icon: 'Star' },
  { id: 'saver_2', label: 'Smart Investor', desc: 'Net worth > 1000 JOD', threshold: 1000, icon: 'TrendingUp' },
  { id: 'saver_3', label: 'Money Master', desc: 'Net worth > 5000 JOD', threshold: 5000, icon: 'Trophy' },
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

const NetWorthChart = ({ transactions }) => {
  // Enhanced to show actual trend based on history
  const data = useMemo(() => {
    if (transactions.length === 0) return [];
    const sorted = [...transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 0;
    // Group by day for smoother chart
    const daily = {};
    sorted.forEach(t => {
      const day = new Date(t.date).toLocaleDateString();
      if (t.type === 'income') runningBalance += t.amount;
      if (t.type === 'expense') runningBalance -= t.amount;
      daily[day] = runningBalance;
    });
    // Take last 7 data points or all if less
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

// 2. Modals
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

const TransactionModal = ({ isOpen, onClose, onSave, accounts, categories, editingTransaction }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(categories[0]?.id || 'food');
  const [accountId, setAccountId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setDesc(editingTransaction.desc);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setAccountId(editingTransaction.accountId);
      setIsRecurring(!!editingTransaction.isRecurring);
    } else {
      setDesc('');
      setAmount('');
      setType('expense');
      setCategory(categories[0]?.id || 'food');
      setAccountId(accounts[0]?.id || '');
      setIsRecurring(false);
    }
  }, [editingTransaction, isOpen, accounts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    playSound('success');
    vibrate(10);
    onSave({
      id: editingTransaction?.id,
      date: editingTransaction?.date,
      desc,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      isRecurring
    });
    onClose();
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
        <div>
           <label className="text-xs text-gray-500 uppercase block mb-1">Description</label>
           <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none" placeholder="What is this for?" />
        </div>
        <div>
           <label className="text-xs text-gray-500 uppercase block mb-1">Account</label>
           <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-elevated border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-primary outline-none">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
           </select>
        </div>
        {type !== 'transfer' && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => { setCategory(cat.id); playSound('click'); }} className={`p-2 rounded-lg border transition-all flex items-center gap-1 ${category === cat.id ? 'bg-primary/20 border-primary text-primary' : 'bg-elevated border-transparent text-gray-400 hover:border-gray-600'}`}>
                  <Icon name={cat.icon} size={14} />
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
           <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4" />
           <span className="text-sm text-gray-400">Recurring Monthly</span>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2">
          <Check size={20} /> Save
        </button>
      </form>
    </ModalWrapper>
  );
};

// 3. Screens
const Dashboard = ({ transactions, accounts, categories, settings, onEditTx, onTogglePrivacy }) => {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.initialBalance, 0) + 
    transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : t.type === 'expense' ? acc - t.amount : acc, 0);

  const format = (amt) => settings.privacyMode ? '****' : `${amt.toLocaleString()} ${settings.currency}`;

  // Feature: Quick Actions
  const addQuick = (catId, amt, desc) => {
    const newTx = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: amt,
      desc: desc,
      type: 'expense',
      category: catId,
      accountId: accounts[0]?.id || '1',
      mood: 'neutral'
    };
    onEditTx(newTx, true); // true = direct save
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
        <div className="md:col-span-2 bg-gradient-to-br from-elevated to-surface border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
           <span className="text-gray-400 text-sm">Total Net Worth</span>
           <div className="text-4xl font-bold mt-2 text-white">{format(totalBalance)}</div>
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
   const [activeTool, setActiveTool] = useState('split');
   
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
               <label className="text-xs text-gray-400">Loan Amount: {amount}</label>
               <input type="range" min="1000" max="100000" step="1000" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full"/>
               
               <label className="text-xs text-gray-400">Interest Rate: {rate}%</label>
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

   return (
      <div className="space-y-6">
         <h2 className="text-2xl font-bold">Financial Tools</h2>
         <div className="flex bg-elevated p-1 rounded-xl">
            <button onClick={() => setActiveTool('split')} className={`flex-1 py-2 rounded-lg ${activeTool==='split' ? 'bg-primary text-black' : 'text-gray-400'}`}>Split Bill</button>
            <button onClick={() => setActiveTool('loan')} className={`flex-1 py-2 rounded-lg ${activeTool==='loan' ? 'bg-primary text-black' : 'text-gray-400'}`}>Loan Calc</button>
         </div>
         {activeTool === 'split' ? <Splitter /> : <LoanCalc />}
      </div>
   );
};

const LockScreen = ({ pin, onUnlock }) => {
   const [input, setInput] = useState('');
   const [error, setError] = useState(false);
   
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

   return (
      <div className="fixed inset-0 bg-dark z-[999] flex flex-col items-center justify-center p-4">
         <div className={`mb-8 p-6 rounded-2xl bg-surface border border-gray-800 ${error ? 'animate-pulse text-danger' : ''}`}>
             <div className="flex gap-4 justify-center">
                {[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full border transition-all ${i < input.length ? 'bg-primary border-primary' : 'border-gray-600'}`}/>)}
             </div>
         </div>
         <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={()=>numClick(n)} className="w-20 h-20 rounded-full bg-surface border border-gray-800 text-2xl font-bold hover:bg-white/10">{n}</button>)}
            <button className="w-20 h-20 flex items-center justify-center text-primary"><HelpCircle/></button>
            <button onClick={()=>numClick(0)} className="w-20 h-20 rounded-full bg-surface border border-gray-800 text-2xl font-bold hover:bg-white/10">0</button>
            <button onClick={()=>{setInput(p=>p.slice(0,-1)); playSound('click');}} className="w-20 h-20 flex items-center justify-center text-danger"><Trash2/></button>
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
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  // Load Data
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

    // Online Listener
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Theme
    if (loadedSet.theme === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  }, []);

  // Save Data
  useEffect(() => localStorage.setItem('mb_transactions', JSON.stringify(transactions)), [transactions]);
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
     if(confirm("Factory Reset: Are you sure? This cannot be undone.")) {
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
          {!isOnline && <div className="bg-danger text-white text-center text-xs py-1">Offline Mode</div>}
          
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
             
             {activeTab === 'analytics' && (
                <div className="space-y-6 animate-slide-up">
                   <h2 className="text-2xl font-bold">Analytics</h2>
                   <div className="bg-surface p-4 rounded-2xl border border-gray-800">
                      <h3 className="mb-4 text-gray-400">Spending</h3>
                      <CategoryChart transactions={transactions} categories={categories} />
                   </div>
                   <div className="bg-surface p-4 rounded-2xl border border-gray-800">
                      <h3 className="mb-4 text-gray-400">Net Worth Trend</h3>
                      <NetWorthChart transactions={transactions} />
                   </div>
                   <div className="space-y-3">
                      <h3 className="font-bold">Badges</h3>
                      <div className="grid grid-cols-3 gap-2">
                         {BADGES.map(b => (
                            <div key={b.id} className="bg-elevated p-2 rounded-xl text-center border border-gray-800 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                               <div className="mx-auto w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mb-1 text-primary">
                                  <Icon name={b.icon} size={16}/>
                               </div>
                               <div className="text-[10px] font-bold">{b.label}</div>
                            </div>
                         ))}
                      </div>
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
             
             {activeTab === 'wallets' && (
                <div className="space-y-4 animate-slide-up">
                   <h2 className="text-2xl font-bold">Wallets</h2>
                   {accounts.map(acc => (
                      <div key={acc.id} className="p-6 rounded-2xl text-white relative overflow-hidden shadow-lg" style={{background: acc.color}}>
                         <div className="relative z-10 flex justify-between">
                            <span className="font-bold text-xl">{acc.name}</span>
                            <CreditCard />
                         </div>
                         <div className="relative z-10 mt-4 text-2xl font-mono">
                            {settings.privacyMode ? '****' : `${acc.initialBalance} ${settings.currency}`}
                         </div>
                         <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                   ))}
                   <button className="w-full py-4 border-2 border-dashed border-gray-800 rounded-2xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-colors">
                      + Add New Wallet
                   </button>
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
            accounts={accounts}
            categories={categories}
            editingTransaction={editingTx}
          />
        </div>
      )}
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);