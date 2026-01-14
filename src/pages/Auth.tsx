import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CardRetro } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, Heart, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.displayName);
        if (error) throw error;
        toast.success('Account created! Welcome to Career Crush 🎉');
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast.success('Welcome back! 👋');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 blob-pink blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 blob-yellow blur-3xl opacity-50" />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Illustration */}
          <div className="hidden md:flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-primary/20 border-2 border-border shadow-retro-xl flex items-center justify-center">
                <Briefcase className="w-24 h-24 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-secondary border-2 border-border shadow-retro flex items-center justify-center">
                <Heart className="w-8 h-8 text-secondary-foreground" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black">Career Crush</h1>
              <p className="text-muted-foreground mt-2">Your job search, organized.</p>
            </div>
          </div>

          {/* Right side - Form card */}
          <CardRetro className="p-8">
            <div className="md:hidden text-center mb-6">
              <h1 className="text-2xl font-black">Career Crush 💼</h1>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-2xl font-black mb-2">
                  {mode === 'login' ? 'Welcome Back! 👋' : 'Join the Crush! 🎉'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {mode === 'login'
                    ? 'Sign in to continue your job search journey'
                    : 'Create your account and start tracking applications'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-2">
                        <User className="h-4 w-4" /> Your Name
                      </label>
                      <InputRetro
                        placeholder="What should we call you?"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </label>
                    <InputRetro
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </label>
                    <InputRetro
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>

                  <ButtonRetro type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </ButtonRetro>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-3 text-muted-foreground font-bold">or continue with</span>
                  </div>
                </div>

                <ButtonRetro
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </ButtonRetro>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="font-bold text-primary hover:underline"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </CardRetro>
        </div>
      </div>
    </div>
  );
}
