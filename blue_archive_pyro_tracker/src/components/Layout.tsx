import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Plus, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';
import { useDashboardData } from '@/hooks/useDashboardData';
import { AddLogDialog } from '@/components/AddLogDialog';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useDashboardData();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { path: ROUTE_PATHS.DASHBOARD, label: '대시보드' },
    { path: ROUTE_PATHS.LOGS, label: '사용 내역' },
    { path: ROUTE_PATHS.EVENTS, label: '이벤트' },
    { path: ROUTE_PATHS.BUDGET, label: '예산 관리' },
    { path: ROUTE_PATHS.SETTINGS, label: '설정' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <NavLink to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BA</span>
                </div>
                <span className="font-semibold text-lg text-foreground hidden sm:block">
                  Pyro Tracker
                </span>
              </NavLink>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-lg bg-muted/50">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">선생님 Lv.{user.level}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Intl.NumberFormat('ko-KR').format(user.pyroxene_balance)}
                    <span className="text-xs text-muted-foreground ml-1">청휘석</span>
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-lg"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border bg-card"
            >
              <nav className="px-4 py-4 space-y-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">선생님 Lv.{user.level}</p>
                    <p className="text-sm font-semibold text-foreground">
                      {new Intl.NumberFormat('ko-KR').format(user.pyroxene_balance)}
                      <span className="text-xs text-muted-foreground ml-1">청휘석</span>
                    </p>
                  </div>
                </div>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-16 min-h-screen">
        {children}
      </main>

      <motion.button
        onClick={() => setIsAddLogOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      <AddLogDialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen} />
    </div>
  );
}
