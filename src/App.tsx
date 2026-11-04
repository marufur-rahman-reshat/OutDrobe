import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Compass,
  Heart,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Shirt,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  AppSection,
  CalendarPlan,
  ClothingItem,
  Outfit,
  UserProfile,
  WearLogEntry,
} from './types/outdrobe';
import { getSavedToken, setSavedToken, outdrobeApi } from './services/api';
import { supabase } from './lib/supabaseClient';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardView } from './components/modules/DashboardView';
import { WardrobeView } from './components/modules/WardrobeView';
import { OutfitBuilderView } from './components/modules/OutfitBuilderView';
import { OutfitsView } from './components/modules/OutfitsView';
import { CalendarView } from './components/modules/CalendarView';
import { WearHistoryView } from './components/modules/WearHistoryView';
import { SuggestionsView } from './components/modules/SuggestionsView';
import { StatisticsView } from './components/modules/StatisticsView';
import { BlueprintView } from './components/modules/BlueprintView';

import {
  DEMO_USER_PROFILE,
  DEMO_CLOTHING_ITEMS,
  DEMO_OUTFITS,
  getDemoCalendarPlans,
  getDemoWearLogs,
} from './data/demoWardrobeData';
import { useDemoTour } from './hooks/useDemoTour';
import { DEMO_TOUR_STEPS } from './types/tour';
import { DemoWelcomeModal } from './components/demo/DemoWelcomeModal';
import { DemoTourControls } from './components/demo/DemoTourControls';

interface NavItemConfig {
  id: AppSection;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const PRIMARY_NAV: NavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wardrobe', label: 'Digital Wardrobe', icon: Shirt },
  { id: 'builder', label: 'Outfit Builder', icon: Layers },
  { id: 'outfits', label: 'Saved Outfits', icon: Compass },
  { id: 'favorites', label: 'Favorite Outfits', icon: Heart },
  { id: 'calendar', label: 'Outfit Calendar', icon: Calendar },
  { id: 'history', label: 'Wear History', icon: History },
  { id: 'suggestions', label: 'Suggestions', icon: Sparkles },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'blueprint', label: 'System Blueprint', icon: BookOpen },
];

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');
  const tour = useDemoTour(setActiveSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);

  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [calendar, setCalendar] = useState<CalendarPlan[]>([]);
  const [wearLogs, setWearLogs] = useState<WearLogEntry[]>([]);

  const hydrateWorkspace = useCallback(async () => {
    try {
      const snap = await outdrobeApi.getWorkspace();
      setWardrobe(Array.isArray(snap?.wardrobe) ? snap.wardrobe : []);
      setOutfits(Array.isArray(snap?.outfits) ? snap.outfits : []);
      setCalendar(Array.isArray(snap?.calendar) ? snap.calendar : []);
      setWearLogs(Array.isArray(snap?.wearLogs) ? snap.wearLogs : []);
    } catch (err) {
      console.warn('[Workspace] Unable to load workspace, defaulting to empty archive:', err);
      setWardrobe([]);
      setOutfits([]);
      setCalendar([]);
      setWearLogs([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          if (isMounted) {
            setUser(null);
            setBootstrapping(false);
          }
          return;
        }

        setSavedToken(session.access_token);
        const { user: currentUser } = await outdrobeApi.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          await hydrateWorkspace();
        }
      } catch (err) {
        console.warn('[Auth] Session restoration notice:', err);
        setSavedToken(null);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setBootstrapping(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setSavedToken(session.access_token);
        if (!user) {
          try {
            const { user: currentUser } = await outdrobeApi.getCurrentUser();
            if (isMounted) {
              setUser(currentUser);
              await hydrateWorkspace();
            }
          } catch {
            // Handled gracefully
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSavedToken(null);
        setUser(null);
        setWardrobe([]);
        setOutfits([]);
        setCalendar([]);
        setWearLogs([]);
        setActiveSection('dashboard');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateWorkspace]);

  const handleAuthenticated = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsDemoMode(false);
    tour.resetTour();
    setAuthModalMode(null);
    await hydrateWorkspace();
  };

  const handleOpenWardrobe = async () => {
    if (user) {
      setActiveSection('wardrobe');
      return;
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!error && session) {
        setSavedToken(session.access_token);
        const { user: currentUser } = await outdrobeApi.getCurrentUser();
        if (currentUser) {
          await handleAuthenticated(currentUser);
          setActiveSection('wardrobe');
          return;
        }
      }
    } catch {
      // Session absent, expired, or invalid
    }

    setAuthModalMode('login');
  };

  const handleExploreDemoCloset = () => {
    setIsDemoMode(true);
    setActiveSection('dashboard');
    setDemoNotice(null);
    tour.openWelcomeModal();
  };

  const handleExitDemo = () => {
    setIsDemoMode(false);
    setActiveSection('dashboard');
    setDemoNotice(null);
    tour.resetTour();
  };

  const handleLogout = async () => {
    setIsDemoMode(false);
    tour.resetTour();
    await outdrobeApi.logout();
    setUser(null);
    setWardrobe([]);
    setOutfits([]);
    setCalendar([]);
    setWearLogs([]);
    setActiveSection('dashboard');
  };

  // --- MUTATION HANDLERS (PROTECTED IN DEMO MODE) ---
  const handleCreateGarment = async (payload: Partial<ClothingItem>) => {
    if (isDemoMode) {
      setDemoNotice('Adding new garments is disabled in read-only Demo Mode. Sign up to catalog your physical wardrobe.');
      return;
    }
    const { item } = await outdrobeApi.createGarment(payload);
    setWardrobe((prev) => [item, ...prev]);
  };

  const handleUpdateGarment = async (id: string, payload: Partial<ClothingItem>) => {
    if (isDemoMode) {
      setDemoNotice('Editing garments is disabled in read-only Demo Mode. Sign up to customize your own pieces.');
      return;
    }
    const { item } = await outdrobeApi.updateGarment(id, payload);
    setWardrobe((prev) => prev.map((g) => (g.id === id ? item : g)));
  };

  const handleDeleteGarment = async (item: ClothingItem) => {
    if (isDemoMode) {
      setDemoNotice('Deleting garments is disabled in read-only Demo Mode.');
      return;
    }
    await outdrobeApi.deleteGarment(item.id);
    setWardrobe((prev) => prev.filter((g) => g.id !== item.id));
    setOutfits((prev) =>
      prev.map((o) => ({
        ...o,
        itemIds: o.itemIds.filter((gid) => gid !== item.id),
      }))
    );
  };

  const handleCreateOutfit = async (payload: Partial<Outfit>) => {
    if (isDemoMode) {
      setDemoNotice('Saving custom outfits is disabled in read-only Demo Mode. Sign up to save looks to your personal Lookbook.');
      return;
    }
    const { outfit } = await outdrobeApi.createOutfit(payload);
    setOutfits((prev) => [outfit, ...prev]);
  };

  const handleStartEditOutfit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setActiveSection('builder');
  };

  const handleUpdateOutfit = async (id: string, payload: Partial<Outfit>) => {
    if (isDemoMode) {
      setDemoNotice('Updating outfits is disabled in read-only Demo Mode. Sign up to create and edit your own ensembles.');
      return;
    }
    const { outfit: updated } = await outdrobeApi.updateOutfit(id, payload);
    setOutfits((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setEditingOutfit(null);
    setActiveSection('outfits');
  };

  const handleNavigate = (section: AppSection) => {
    if (section === 'builder') {
      setEditingOutfit(null);
    }
    setActiveSection(section);
    if (isDemoMode && tour.isTourActive) {
      const stepIdx = DEMO_TOUR_STEPS.findIndex((s) => s.targetSection === section);
      if (stepIdx !== -1) {
        tour.goToStep(stepIdx);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingOutfit(null);
    setActiveSection('outfits');
  };

  const handleToggleOutfitFavorite = async (outfit: Outfit) => {
    if (isDemoMode) {
      setDemoNotice('Favoriting outfits is disabled in read-only Demo Mode.');
      return;
    }
    const { outfit: updated } = await outdrobeApi.updateOutfit(outfit.id, {
      isFavorite: !outfit.isFavorite,
    });
    setOutfits((prev) => prev.map((o) => (o.id === outfit.id ? updated : o)));
  };

  const handleDeleteOutfit = async (outfit: Outfit) => {
    if (isDemoMode) {
      setDemoNotice('Deleting outfits is disabled in read-only Demo Mode.');
      return;
    }
    await outdrobeApi.deleteOutfit(outfit.id);
    if (editingOutfit?.id === outfit.id) {
      setEditingOutfit(null);
    }
    setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
    setCalendar((prev) => prev.filter((c) => c.outfitId !== outfit.id));
  };

  const handleScheduleOutfit = async (date: string, outfitId: string, occasionNote: string) => {
    if (isDemoMode) {
      setDemoNotice('Calendar scheduling is disabled in read-only Demo Mode. Sign up to plan your daily outfits.');
      return;
    }
    const { plan } = await outdrobeApi.scheduleOutfit({ date, outfitId, occasionNote });
    setCalendar((prev) => {
      const idx = prev.findIndex((c) => c.date === date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = plan;
        return next;
      }
      return [...prev, plan];
    });
  };

  const handleRemoveCalendarPlan = async (id: string) => {
    if (isDemoMode) {
      setDemoNotice('Removing calendar plans is disabled in read-only Demo Mode.');
      return;
    }
    await outdrobeApi.removeCalendarPlan(id);
    setCalendar((prev) => prev.filter((c) => c.id !== id));
  };

  const handleLogWear = async (payload: {
    date: string;
    outfitId: string | null;
    occasion: string;
    weatherNote: string;
    notes: string;
    calendarPlanId?: string;
  }) => {
    if (isDemoMode) {
      setDemoNotice('Wear logging is disabled in read-only Demo Mode. Sign up to track your own cost-per-wear.');
      return;
    }
    const res = await outdrobeApi.logWear(payload);
    setWearLogs((prev) => [res.entry, ...prev]);
    setWardrobe(res.wardrobe);
    setOutfits(res.outfits);
    setCalendar(res.calendar);
  };

  const handleLogOutfitToday = async (outfit: Outfit) => {
    const d = new Date();
    const todayIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    await handleLogWear({
      date: todayIso,
      outfitId: outfit.id,
      occasion: outfit.occasion,
      weatherNote: '17°C · Mild',
      notes: 'Logged from Lookbook',
    });
  };

  const handleLogPlannedOutfit = async (plan: CalendarPlan, outfit: Outfit) => {
    await handleLogWear({
      date: plan.date,
      outfitId: outfit.id,
      occasion: outfit.occasion,
      weatherNote: '17°C · Planned Day',
      notes: plan.occasionNote,
      calendarPlanId: plan.id,
    });
  };

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="font-editorial text-2xl text-[#5C5E58]">Opening OutDrobe...</p>
      </div>
    );
  }

  // --- UNAUTHENTICATED PUBLIC VIEWS ---
  if (!user && !isDemoMode) {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode) => setAuthModalMode(mode)}
          onOpenWardrobe={handleOpenWardrobe}
          onExploreDemoCloset={handleExploreDemoCloset}
        />

        {authModalMode && (
          <AuthModal
            initialMode={authModalMode}
            onClose={() => setAuthModalMode(null)}
            onAuthenticated={handleAuthenticated}
          />
        )}
      </>
    );
  }

  // --- WORKSPACE SHELL (AUTHENTICATED OR DEMO MODE) ---
  const activeNavConfig = PRIMARY_NAV.find((n) => n.id === activeSection) || PRIMARY_NAV[0];

  const currentProfile = isDemoMode ? DEMO_USER_PROFILE : user!;
  const currentWardrobe = isDemoMode ? DEMO_CLOTHING_ITEMS : wardrobe;
  const currentOutfits = isDemoMode ? DEMO_OUTFITS : outfits;
  const currentCalendar = isDemoMode ? getDemoCalendarPlans() : calendar;
  const currentWearLogs = isDemoMode ? getDemoWearLogs() : wearLogs;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1D1A] flex flex-col">
      {/* Demo Mode Top Indicator Banner */}
      {isDemoMode && (
        <aside
          role="region"
          aria-label="Demo Mode Notice"
          className="bg-[#1C1D1A] text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#31332E] z-40 sticky top-0"
        >
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded font-mono uppercase tracking-wider text-[10px] font-semibold bg-[#526B56] text-white">
              Demo Mode
            </span>
            {tour.isTourActive ? (
              <span className="text-[#D8D5CD] flex items-center gap-1.5 flex-wrap">
                <span className="text-[#88A88E] font-medium">Guided Tour:</span>
                <span className="font-semibold text-white">
                  Step {tour.currentStepIndex + 1} of {tour.totalSteps} — {tour.currentStep.title}
                </span>
              </span>
            ) : (
              <span className="text-[#D8D5CD]">
                Exploring pre-populated demo wardrobe · Read-only preview
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {!tour.isTourActive && (
              <button
                type="button"
                onClick={tour.hasCompleted ? tour.restartTour : tour.startTour}
                className="px-2.5 py-1 rounded bg-[#31332E] hover:bg-[#454741] text-[#E5E0D8] transition-colors font-medium cursor-pointer inline-flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3 text-[#7A8F7C]" />
                <span>{tour.hasCompleted ? 'Restart Tour' : 'Start Guided Tour'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setAuthModalMode('register')}
              className="font-medium text-[#FAF8F5] underline hover:text-[#88A88E] transition-colors cursor-pointer"
            >
              Create Your Own Wardrobe →
            </button>
            <button
              type="button"
              onClick={handleExitDemo}
              className="px-3 py-1 rounded bg-[#31332E] hover:bg-[#454741] text-[#E5E0D8] transition-colors font-medium cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#F2EFE9] border-r border-[#E5E0D8]">
          <div className="px-6 py-5 border-b border-[#E5E0D8]">
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className="font-editorial text-2xl font-semibold tracking-tight text-[#1C1D1A]"
            >
              OutDrobe
            </button>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#1C1D1A] border border-[#E5E0D8]'
                      : 'text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-[#FAF8F5]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#526B56]' : 'text-[#73766E]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#E5E0D8] space-y-3">
            <div className="px-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-[#1C1D1A] truncate">{currentProfile.displayName}</p>
                {isDemoMode && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold rounded bg-[#EBF0EC] text-[#354938] border border-[#CBD8CD]">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#73766E] truncate">{currentProfile.email}</p>
            </div>
            {isDemoMode ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors"
                >
                  Sign Up / Create Account
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={tour.restartTour}
                    className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                    title="Start or restart guided product tour"
                  >
                    <Sparkles className="w-3 h-3 text-[#526B56]" />
                    <span>{tour.isTourActive ? 'Restart' : 'Guided Tour'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExitDemo}
                    className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white border border-[#D8D3C8] text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Exit Demo</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-white transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-[#1C1D1A]/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative z-10 w-64 max-w-[80vw] bg-[#F2EFE9] border-r border-[#E5E0D8] flex flex-col">
              <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
                <span className="font-editorial text-2xl font-semibold text-[#1C1D1A]">OutDrobe</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-lg text-[#5C5E58] hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {PRIMARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleNavigate(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium ${
                        active
                          ? 'bg-white text-[#1C1D1A] border border-[#E5E0D8]'
                          : 'text-[#5C5E58] hover:text-[#1C1D1A]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-[#526B56]' : 'text-[#73766E]'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-[#E5E0D8] space-y-2">
                {isDemoMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('register');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947]"
                    >
                      Sign Up / Create Account
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          tour.restartTour();
                          setMobileMenuOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#526B56]" />
                        <span>Guided Tour</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleExitDemo();
                          setMobileMenuOpen(false);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#5C5E58] hover:bg-[#F2EFE9]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Exit Demo</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5C5E58] hover:bg-white"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Contextual Workspace Header */}
          <header className="sticky top-0 z-20 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E5E0D8] px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 -ml-2 rounded-lg text-[#1C1D1A] hover:bg-[#F2EFE9]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-[#73766E] truncate">
                <span className="hidden sm:inline">OutDrobe</span>
                <span className="hidden sm:inline" aria-hidden="true">
                  /
                </span>
                <span className="font-medium text-[#1C1D1A] truncate">{activeNavConfig.label}</span>
                {isDemoMode && (
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#EBF0EC] text-[#354938] border border-[#CBD8CD]">
                    Read-Only Demo
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isDemoMode && (
                <button
                  type="button"
                  onClick={() => setAuthModalMode('register')}
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0"
                >
                  Sign Up / Create Account
                </button>
              )}
              {activeSection !== 'builder' && (
                <button
                  type="button"
                  onClick={() => handleNavigate('builder')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0"
                >
                  Outfit Builder
                </button>
              )}
            </div>
          </header>

          <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 sm:py-10">
            {activeSection === 'dashboard' && (
              <DashboardView
                user={currentProfile}
                wardrobe={currentWardrobe}
                outfits={currentOutfits}
                calendar={currentCalendar}
                wearLogs={currentWearLogs}
                onNavigate={handleNavigate}
                onLogPlannedOutfit={handleLogPlannedOutfit}
              />
            )}

            {activeSection === 'wardrobe' && (
              <WardrobeView
                wardrobe={currentWardrobe}
                onCreateGarment={handleCreateGarment}
                onUpdateGarment={handleUpdateGarment}
                onDeleteGarment={handleDeleteGarment}
                isTourActive={isDemoMode && tour.isTourActive && tour.currentStep.targetSection === 'wardrobe'}
                onNextTourStep={tour.nextStep}
              />
            )}

            {activeSection === 'builder' && (
              <OutfitBuilderView
                wardrobe={currentWardrobe}
                editingOutfit={editingOutfit}
                onSaveOutfit={handleCreateOutfit}
                onUpdateOutfit={handleUpdateOutfit}
                onCancelEdit={handleCancelEdit}
                isTourActive={isDemoMode && tour.isTourActive && tour.currentStep.targetSection === 'builder'}
                onNextTourStep={tour.nextStep}
              />
            )}

            {activeSection === 'outfits' && (
              <OutfitsView
                outfits={currentOutfits}
                wardrobe={currentWardrobe}
                favoritesOnly={false}
                onNavigate={handleNavigate}
                onToggleFavorite={handleToggleOutfitFavorite}
                onEditOutfit={handleStartEditOutfit}
                onDeleteOutfit={handleDeleteOutfit}
                onLogWearToday={handleLogOutfitToday}
                onScheduleOutfit={handleScheduleOutfit}
              />
            )}

            {activeSection === 'favorites' && (
              <OutfitsView
                outfits={currentOutfits}
                wardrobe={currentWardrobe}
                favoritesOnly
                onNavigate={handleNavigate}
                onToggleFavorite={handleToggleOutfitFavorite}
                onEditOutfit={handleStartEditOutfit}
                onDeleteOutfit={handleDeleteOutfit}
                onLogWearToday={handleLogOutfitToday}
                onScheduleOutfit={handleScheduleOutfit}
              />
            )}

            {activeSection === 'calendar' && (
              <CalendarView
                calendar={currentCalendar}
                outfits={currentOutfits}
                wardrobe={currentWardrobe}
                onScheduleOutfit={handleScheduleOutfit}
                onRemovePlan={handleRemoveCalendarPlan}
                onLogPlannedOutfit={handleLogPlannedOutfit}
                isTourActive={isDemoMode && tour.isTourActive && tour.currentStep.targetSection === 'calendar'}
                onNextTourStep={tour.nextStep}
              />
            )}

            {activeSection === 'history' && (
              <WearHistoryView
                wearLogs={currentWearLogs}
                outfits={currentOutfits}
                wardrobe={currentWardrobe}
                onLogWear={handleLogWear}
              />
            )}

            {activeSection === 'suggestions' && (
              <SuggestionsView
                wardrobe={currentWardrobe}
                onSaveOutfit={handleCreateOutfit}
              />
            )}

            {activeSection === 'statistics' && (
              <StatisticsView
                wardrobe={currentWardrobe}
                outfits={currentOutfits}
                wearLogs={currentWearLogs}
              />
            )}

            {activeSection === 'blueprint' && <BlueprintView />}
          </main>
        </div>
      </div>

      {/* Demo Mode Action Notice Toast */}
      {demoNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-[#1C1D1A] text-white shadow-xl border border-[#31332E] flex items-start justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div>
            <p className="font-semibold text-[#E5E0D8] mb-0.5">Demo Mode</p>
            <p className="text-[#A3A69D] leading-relaxed">{demoNotice}</p>
            <button
              type="button"
              onClick={() => {
                setDemoNotice(null);
                setAuthModalMode('register');
              }}
              className="mt-2.5 inline-block text-xs font-medium text-[#88A88E] hover:underline cursor-pointer"
            >
              Create a free account to customize your wardrobe →
            </button>
          </div>
          <button
            type="button"
            onClick={() => setDemoNotice(null)}
            className="p-1 rounded text-[#73766E] hover:text-white cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Demo Tour Navigation Controls (Phase 1 Foundation) */}
      {isDemoMode && tour.isTourActive && (
        <DemoTourControls
          currentStep={tour.currentStep}
          currentStepIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          isFirstStep={tour.isFirstStep}
          isLastStep={tour.isLastStep}
          onPrev={tour.prevStep}
          onNext={tour.nextStep}
          onSkip={tour.skipTour}
          onFinish={tour.finishTour}
          onRestart={tour.restartTour}
          onGoToStep={tour.goToStep}
        />
      )}

      {/* Demo Welcome Modal */}
      {isDemoMode && (
        <DemoWelcomeModal
          isOpen={tour.showWelcomeModal}
          onStartTour={tour.startTour}
          onExploreOnOwn={tour.exploreOnOwn}
          onExitDemo={handleExitDemo}
        />
      )}

      {/* Auth Modal (accessible from landing page or in demo mode) */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}

