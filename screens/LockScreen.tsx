import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, Delete } from 'lucide-react';

interface LockScreenProps {
  pin: string;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ pin, onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [isBiometricScan, setIsBiometricScan] = useState(false);

  useEffect(() => {
    if (input.length === 4) {
      if (input === pin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setInput('');
          setError(false);
        }, 500);
      }
    }
  }, [input, pin, onUnlock]);

  const handleNum = (n: number) => {
    if (input.length < 4) setInput(prev => prev + n);
  };

  const handleBiometric = () => {
    setIsBiometricScan(true);
    setTimeout(() => {
      onUnlock();
    }, 1200);
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
    <div className="fixed inset-0 bg-black z-[999] flex flex-col items-center justify-center p-4">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800 shadow-2xl shadow-primary/10">
          <Lock size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">Enter PIN to access Money Brain</p>
      </div>

      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border transition-all duration-300 ${
              i < input.length 
                ? error ? 'bg-danger border-danger' : 'bg-primary border-primary shadow-[0_0_10px_#00d2ff]' 
                : 'border-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-xs w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNum(num)}
            className="w-20 h-20 rounded-full bg-surface border border-gray-800 text-2xl font-bold text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
        <button onClick={() => handleBiometric()} className="w-20 h-20 rounded-full flex items-center justify-center text-success hover:bg-success/10 transition-colors">
          <Fingerprint size={32} />
        </button>
        <button onClick={() => handleNum(0)} className="w-20 h-20 rounded-full bg-surface border border-gray-800 text-2xl font-bold text-white hover:bg-white/10 transition-all">
          0
        </button>
        <button onClick={() => setInput(prev => prev.slice(0, -1))} className="w-20 h-20 rounded-full flex items-center justify-center text-danger hover:bg-danger/10 transition-colors">
          <Delete size={28} />
        </button>
      </div>
    </div>
  );
};

export default LockScreen;