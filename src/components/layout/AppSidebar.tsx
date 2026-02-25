import { StampTabBar } from './StampTabBar';

export function AppSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full">
      <main className="w-full pb-24">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <StampTabBar />
    </div>
  );
}
