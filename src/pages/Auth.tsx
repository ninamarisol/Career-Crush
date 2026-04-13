import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardRetro } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { InputRetro } from '@/components/ui/input-retro';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Briefcase, Heart, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
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
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success('Password reset email sent! Check your inbox 📬');
        setMode('login');
      } else if (mode === 'signup') {
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
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (error: any) {
      toast.error(error.message || 'Apple sign in failed');
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
                  {mode === 'forgot' ? 'Reset Password 🔑' : mode === 'login' ? 'Welcome Back! 👋' : 'Join the Crush! 🎉'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {mode === 'forgot'
                    ? "Enter your email and we'll send you a reset link"
                    : mode === 'login'
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

                  {mode !== 'forgot' && (
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
                  )}

                  <ButtonRetro type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Loading...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </ButtonRetro>
                </form>

                {mode === 'login' && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <p className="text-center text-sm text-muted-foreground mt-4">
                  {mode === 'forgot'
                    ? 'Remember your password? '
                    : mode === 'login'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup')}
                    className="font-bold text-primary hover:underline"
                  >
                    {mode === 'forgot' ? 'Sign in' : mode === 'login' ? 'Sign up' : 'Sign in'}
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
