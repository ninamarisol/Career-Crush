import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Application, Event, UserProfile, mockApplications, mockEvents } from '@/lib/data';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  addApplication: (app: Omit<Application, 'id'>) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('careercrush-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('careercrush-applications');
    return saved ? JSON.parse(saved) : mockApplications;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('careercrush-events');
    return saved ? JSON.parse(saved) : mockEvents;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('careercrush-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('careercrush-user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('careercrush-applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('careercrush-events', JSON.stringify(events));
  }, [events]);

  const addApplication = (app: Omit<Application, 'id'>) => {
    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const updateApplication = (id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        applications,
        setApplications,
        events,
        setEvents,
        addApplication,
        updateApplication,
        deleteApplication,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
