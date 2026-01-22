import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Lightbulb, TrendingUp, Bug, HelpCircle } from 'lucide-react';
import { CardRetro, CardRetroContent, CardRetroHeader, CardRetroTitle } from '@/components/ui/card-retro';
import { ButtonRetro } from '@/components/ui/button-retro';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FeedbackType = 'suggestion' | 'improvement' | 'bug' | 'other';

const feedbackTypes: { value: FeedbackType; label: string; icon: React.ReactNode; emoji: string }[] = [
  { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb className="w-4 h-4" />, emoji: '💡' },
  { value: 'improvement', label: 'Improvement', icon: <TrendingUp className="w-4 h-4" />, emoji: '📈' },
  { value: 'bug', label: 'Bug Report', icon: <Bug className="w-4 h-4" />, emoji: '🐛' },
  { value: 'other', label: 'Other', icon: <HelpCircle className="w-4 h-4" />, emoji: '💬' },
];

export function FeedbackForm() {
  const { profile } = useApp();
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    if (message.trim().length < 10) {
      toast.error('Please provide more detail in your feedback');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-feedback', {
        body: {
          userName: profile?.display_name || 'Anonymous User',
          userEmail: user?.email || 'no-email@unknown.com',
          message: message.trim(),
          feedbackType,
        },
      });

      if (error) throw error;

      toast.success('Thank you! Your feedback has been sent 💜');
      setMessage('');
      setFeedbackType('suggestion');
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardRetro className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardRetroHeader>
          <CardRetroTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Us Feedback
          </CardRetroTitle>
        </CardRetroHeader>
        <CardRetroContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            We'd love to hear from you! Share your suggestions, report issues, or let us know how we can make Career Crush even better.
          </p>

          {/* Feedback Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold">What type of feedback is this?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {feedbackTypes.map((type) => (
                <motion.button
                  key={type.value}
                  onClick={() => setFeedbackType(type.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all",
                    feedbackType === type.value
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className="text-xl block mb-1">{type.emoji}</span>
                  <span className="text-xs font-bold">{type.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold">Your Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'suggestion'
                  ? "I have an idea for a new feature..."
                  : feedbackType === 'improvement'
                  ? "This feature could be better if..."
                  : feedbackType === 'bug'
                  ? "I found an issue when..."
                  : "I wanted to share..."
              }
              className="min-h-[150px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Be as detailed as possible</span>
              <span>{message.length}/2000</span>
            </div>
          </div>

          {/* Submit Button */}
          <ButtonRetro
            onClick={handleSubmit}
            disabled={isSending || !message.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </>
            )}
          </ButtonRetro>
        </CardRetroContent>
      </CardRetro>

      {/* Info Card */}
      <CardRetro>
        <CardRetroContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💜</span>
            <div>
              <h4 className="font-bold mb-1">We read every message</h4>
              <p className="text-sm text-muted-foreground">
                Your feedback helps shape the future of Career Crush. Thank you for taking the time to share your thoughts with us!
              </p>
            </div>
          </div>
        </CardRetroContent>
      </CardRetro>
    </div>
  );
}
