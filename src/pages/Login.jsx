import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';
import { decodeToken } from '../utils/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginAdmin({ email, password });
      if (!data.is_admin) {
        setError("Bu foydalanuvchida admin huquqi yo'q.");
        return;
      }

      localStorage.setItem('token', data.access_token);
      const tokenPayload = decodeToken(data.access_token);
      localStorage.setItem('isAdmin', tokenPayload?.is_admin ? 'true' : 'false');
      navigate('/admin');
    } catch {
      setError("Email yoki parol noto'g'ri. Avval admin user yaratilganini tekshiring.");
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center pt-24 px-6 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 rounded-3xl max-w-md w-full text-center shadow-2xl border border-white/10"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
          <ShieldAlert size={40} className="-rotate-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Tizimga kirish</h2>
        <p className="text-slate-400 mb-8">Ushbu sahifa faqat tizim administratorlari uchun yopiq hudud hisoblanadi.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Admin email"
              className="w-full bg-[#0F172A]/80 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center text-lg"
              autoFocus
            />
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-500" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Parolni kiriting"
                className="w-full bg-[#0F172A]/80 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-center tracking-widest font-mono text-lg"
              />
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm font-medium mt-3"
              >
                {error}
              </motion.p>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl transition-all hover:bg-slate-200 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
