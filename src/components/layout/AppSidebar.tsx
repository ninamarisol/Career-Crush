import { TopNavBar } from './TopNavBar';

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <TopNavBar />
      <main className="w-full">
        <div className="px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
