import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User as UserIcon, Loader2, Sparkles} from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo2.png'
export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) {
      toast.error('Please enter both User ID and Password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(userId, password);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-300 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center  animate-fade-in-up">
          <div className="inline-flex items-center justify-center  rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 mb-4 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center">
              <img src={logo} alt="Logo" className='' />
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
            <p className="text-slate-400 text-xs mt-1">Please enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">User ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <UserIcon className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Enter User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="pl-10 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] mt-4 overflow-hidden group relative"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <Sparkles className="w-4 h-4 opacity-70 group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-slate-500 text-[10px] font-medium tracking-wide uppercase">
            &copy; {new Date().getFullYear()} RSB Transmissions (I) Ltd. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-[20%] right-[15%] w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-20" />
      <div className="absolute bottom-[20%] left-[15%] w-2 h-2 bg-cyan-500 rounded-full animate-ping opacity-20" style={{ animationDelay: '1s' }} />
    </div>
  );
}
