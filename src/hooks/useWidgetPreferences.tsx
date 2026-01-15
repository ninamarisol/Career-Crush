import { useState, useEffect, useCallback } from 'react';
import { UserMode } from '@/context/AppContext';
import { WidgetConfig, WidgetSize, WidgetInstance } from '@/components/widgets/types';
import { widgetRegistry } from '@/components/widgets/widgetRegistry';

interface WidgetPreference {
  widgetId: string;
  visible: boolean;
  size: WidgetSize;
  priority: number;
}

interface ModePreferences {
  [widgetId: string]: WidgetPreference;
}

interface AllPreferences {
  [mode: string]: ModePreferences;
}

const STORAGE_KEY = 'career-crush-widget-preferences';

// Load preferences from localStorage
function loadPreferences(): AllPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load widget preferences:', e);
  }
  return {};
}

// Save preferences to localStorage
function savePreferences(prefs: AllPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save widget preferences:', e);
  }
}

// Get default preferences for a mode from registry
function getDefaultPreferencesForMode(mode: UserMode): ModePreferences {
  const prefs: ModePreferences = {};
  
  widgetRegistry.forEach(widget => {
    if (widget.availableModes.includes(mode)) {
      const defaultSettings = widget.defaultSettings[mode];
      if (defaultSettings) {
        prefs[widget.id] = {
          widgetId: widget.id,
          visible: defaultSettings.visible,
          size: defaultSettings.size,
          priority: defaultSettings.priority,
        };
      }
    }
  });
  
  return prefs;
}

export function useWidgetPreferences(mode: UserMode | null) {
  const [allPreferences, setAllPreferences] = useState<AllPreferences>(loadPreferences);
  
  // Get preferences for current mode
  const modePreferences = mode 
    ? allPreferences[mode] || getDefaultPreferencesForMode(mode)
    : {};

  // Get available widgets for current mode
  const availableWidgets = mode 
    ? widgetRegistry.filter(w => w.availableModes.includes(mode))
    : [];

  // Get widget instances with preferences applied
  const widgetInstances: WidgetInstance[] = availableWidgets.map(widget => {
    const pref = modePreferences[widget.id];
    const defaultSettings = widget.defaultSettings[mode!];
    
    return {
      ...widget,
      visible: pref?.visible ?? defaultSettings?.visible ?? false,
      size: pref?.size ?? defaultSettings?.size ?? 'medium',
      priority: pref?.priority ?? defaultSettings?.priority ?? 100,
    };
  }).sort((a, b) => a.priority - b.priority);

  // Get only visible widgets
  const visibleWidgets = widgetInstances.filter(w => w.visible);

  // Update a single widget's preference
  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetPreference>) => {
    if (!mode) return;
    
    setAllPreferences(prev => {
      const modePrefs = prev[mode] || getDefaultPreferencesForMode(mode);
      const currentPref = modePrefs[widgetId];
      
      const newPrefs = {
        ...prev,
        [mode]: {
          ...modePrefs,
          [widgetId]: {
            widgetId,
            visible: updates.visible ?? currentPref?.visible ?? false,
            size: updates.size ?? currentPref?.size ?? 'medium',
            priority: updates.priority ?? currentPref?.priority ?? 100,
          },
        },
      };
      
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [mode]);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    if (!mode) return;
    
    const currentVisible = modePreferences[widgetId]?.visible ?? 
      widgetRegistry.find(w => w.id === widgetId)?.defaultSettings[mode]?.visible ?? 
      false;
    
    updateWidget(widgetId, { visible: !currentVisible });
  }, [mode, modePreferences, updateWidget]);

  // Move widget up in priority (lower number = higher priority)
  const moveWidgetUp = useCallback((widgetId: string) => {
    if (!mode) return;
    
    const sorted = [...widgetInstances].sort((a, b) => a.priority - b.priority);
    const index = sorted.findIndex(w => w.id === widgetId);
    
    if (index <= 0) return; // Already at top
    
    const current = sorted[index];
    const above = sorted[index - 1];
    
    // Swap priorities
    updateWidget(widgetId, { priority: above.priority - 0.5 });
  }, [mode, widgetInstances, updateWidget]);

  // Move widget down in priority
  const moveWidgetDown = useCallback((widgetId: string) => {
    if (!mode) return;
    
    const sorted = [...widgetInstances].sort((a, b) => a.priority - b.priority);
    const index = sorted.findIndex(w => w.id === widgetId);
    
    if (index >= sorted.length - 1) return; // Already at bottom
    
    const below = sorted[index + 1];
    
    // Swap priorities
    updateWidget(widgetId, { priority: below.priority + 0.5 });
  }, [mode, widgetInstances, updateWidget]);

  // Change widget size
  const setWidgetSize = useCallback((widgetId: string, size: WidgetSize) => {
    updateWidget(widgetId, { size });
  }, [updateWidget]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (!mode) return;
    
    setAllPreferences(prev => {
      const newPrefs = { ...prev };
      delete newPrefs[mode];
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [mode]);

  return {
    availableWidgets,
    widgetInstances,
    visibleWidgets,
    toggleWidget,
    moveWidgetUp,
    moveWidgetDown,
    setWidgetSize,
    resetToDefaults,
    updateWidget,
  };
}
