import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp, UserMode } from '@/context/AppContext';
import { widgetRegistry, getWidgetsForMode } from '@/components/widgets/widgetRegistry';
import { WidgetSize, WidgetConfig } from '@/components/widgets/types';

export interface WidgetPreference {
  id?: string;
  widget_id: string;
  visible: boolean;
  priority: number;
  size: WidgetSize;
}

export interface WidgetWithPreference extends WidgetConfig {
  visible: boolean;
  priority: number;
  size: WidgetSize;
}

export function useWidgetPreferences() {
  const { user } = useAuth();
  const { profile } = useApp();
  const [preferences, setPreferences] = useState<WidgetPreference[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMode = (profile?.user_mode || 'active_seeker') as UserMode;

  // Fetch preferences from database
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('widget_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setPreferences(data.map(p => ({
          id: p.id,
          widget_id: p.widget_id,
          visible: p.visible,
          priority: p.priority,
          size: p.size as WidgetSize,
        })));
      }
    } catch (error) {
      console.error('Error fetching widget preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Get widgets for the current mode with preferences applied
  const getWidgetsWithPreferences = useCallback((): WidgetWithPreference[] => {
    const modeWidgets = getWidgetsForMode(currentMode);
    
    return modeWidgets.map(widget => {
      const pref = preferences.find(p => p.widget_id === widget.id);
      const defaultSettings = widget.defaultSettings[currentMode];
      
      return {
        ...widget,
        visible: pref?.visible ?? defaultSettings?.visible ?? true,
        priority: pref?.priority ?? defaultSettings?.priority ?? 100,
        size: pref?.size ?? defaultSettings?.size ?? 'medium',
      };
    }).sort((a, b) => a.priority - b.priority);
  }, [currentMode, preferences]);

  // Update a single widget preference
  const updatePreference = useCallback(async (
    widgetId: string, 
    updates: Partial<Pick<WidgetPreference, 'visible' | 'priority' | 'size'>>
  ) => {
    if (!user) return;

    const existingPref = preferences.find(p => p.widget_id === widgetId);
    const widget = widgetRegistry.find(w => w.id === widgetId);
    const defaultSettings = widget?.defaultSettings[currentMode];

    const newPref: WidgetPreference = {
      widget_id: widgetId,
      visible: updates.visible ?? existingPref?.visible ?? defaultSettings?.visible ?? true,
      priority: updates.priority ?? existingPref?.priority ?? defaultSettings?.priority ?? 100,
      size: updates.size ?? existingPref?.size ?? defaultSettings?.size ?? 'medium',
    };

    try {
      const { error } = await supabase
        .from('widget_preferences')
        .upsert({
          user_id: user.id,
          widget_id: widgetId,
          visible: newPref.visible,
          priority: newPref.priority,
          size: newPref.size,
        }, { onConflict: 'user_id,widget_id' });

      if (error) throw error;

      // Update local state
      setPreferences(prev => {
        const existing = prev.find(p => p.widget_id === widgetId);
        if (existing) {
          return prev.map(p => p.widget_id === widgetId ? { ...p, ...newPref } : p);
        }
        return [...prev, newPref];
      });
    } catch (error) {
      console.error('Error updating widget preference:', error);
    }
  }, [user, preferences, currentMode]);

  // Batch update priorities (for reordering)
  const updatePriorities = useCallback(async (orderedWidgetIds: string[]) => {
    if (!user) return;

    const updates = orderedWidgetIds.map((widgetId, index) => ({
      user_id: user.id,
      widget_id: widgetId,
      priority: index * 10,
      visible: preferences.find(p => p.widget_id === widgetId)?.visible ?? true,
      size: preferences.find(p => p.widget_id === widgetId)?.size ?? 'medium',
    }));

    try {
      const { error } = await supabase
        .from('widget_preferences')
        .upsert(updates, { onConflict: 'user_id,widget_id' });

      if (error) throw error;

      // Update local state
      setPreferences(prev => {
        const newPrefs = [...prev];
        updates.forEach(update => {
          const existing = newPrefs.find(p => p.widget_id === update.widget_id);
          if (existing) {
            existing.priority = update.priority;
          } else {
            newPrefs.push({
              widget_id: update.widget_id,
              visible: update.visible,
              priority: update.priority,
              size: update.size as WidgetSize,
            });
          }
        });
        return newPrefs;
      });
    } catch (error) {
      console.error('Error updating widget priorities:', error);
    }
  }, [user, preferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('widget_preferences')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setPreferences([]);
    } catch (error) {
      console.error('Error resetting widget preferences:', error);
    }
  }, [user]);

  return {
    loading,
    preferences,
    currentMode,
    getWidgetsWithPreferences,
    updatePreference,
    updatePriorities,
    resetToDefaults,
  };
}
