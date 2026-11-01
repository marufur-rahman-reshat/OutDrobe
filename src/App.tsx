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
import { getSavedToken, outdrobeApi } from './services/api';
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
  const [publicBlueprintOpen, setPublicBlueprintOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');
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
    const existingToken = getSavedToken();
    if (!existingToken) {
      setBootstrapping(false);
      return;
    }

    (async () => {
      try {
        const { user: currentUser } = await outdrobeApi.getCurrentUser();
        setUser(currentUser);
        await hydrateWorkspace();
      } catch {
        await outdrobeApi.logout();
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [hydrateWorkspace]);

  const handleAuthenticated = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setAuthModalMode(null);
    setPublicBlueprintOpen(false);
    await hydrateWorkspace();
  };

  const handleEnterDemo = async () => {
    const res = await outdrobeApi.loginDemo();
    await handleAuthenticated(res.user);
  };

  const handleLogout = async () => {
    await outdrobeApi.logout();
    setUser(null);
    setWardrobe([]);
    setOutfits([]);
    setCalendar([]);
    setWearLogs([]);
    setActiveSection('dashboard');
  };

  // --- MUTATION HANDLERS ---
  const handleCreateGarment = async (payload: Partial<ClothingItem>) => {
    const { item } = await outdrobeApi.createGarment(payload);
    setWardrobe((prev) => [item, ...prev]);
  };

  const handleUpdateGarment = async (id: string, payload: Partial<ClothingItem>) => {
    const { item } = await outdrobeApi.updateGarment(id, payload);
    setWardrobe((prev) => prev.map((g) => (g.id === id ? item : g)));
  };

  const handleDeleteGarment = async (item: ClothingItem) => {
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
    const { outfit } = await outdrobeApi.createOutfit(payload);
    setOutfits((prev) => [outfit, ...prev]);
  };

  const handleStartEditOutfit = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setActiveSection('builder');
  };

  const handleUpdateOutfit = async (id: string, payload: Partial<Outfit>) => {
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
  };

  const handleCancelEdit = () => {
    setEditingOutfit(null);
    setActiveSection('outfits');
  };

  const handleToggleOutfitFavorite = async (outfit: Outfit) => {
    const { outfit: updated } = await outdrobeApi.updateOutfit(outfit.id, {
      isFavorite: !outfit.isFavorite,
    });
    setOutfits((prev) => prev.map((o) => (o.id === outfit.id ? updated : o)));
  };

  const handleDeleteOutfit = async (outfit: Outfit) => {
    await outdrobeApi.deleteOutfit(outfit.id);
    if (editingOutfit?.id === outfit.id) {
      setEditingOutfit(null);
    }
    setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
    setCalendar((prev) => prev.filter((c) => c.outfitId !== outfit.id));
  };

  const handleScheduleOutfit = async (date: string, outfitId: string, occasionNote: string) => {
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
  if (!user) {
    return (
      <>
        {publicBlueprintOpen ? (
          <div className="min-h-screen bg-[#FAF8F5]">
            <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E5E0D8]">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setPublicBlueprintOpen(false)}
                  className="font-editorial text-2xl font-semibold tracking-tight text-[#1C1D1A] whitespace-nowrap shrink-0"
                >
                  OutDrobe
                </button>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-sm font-medium text-[#5C5E58] hover:text-[#1C1D1A]"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={handleEnterDemo}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#526B56] rounded-lg hover:bg-[#435947] whitespace-nowrap shrink-0"
                  >
                    Open Wardrobe
                  </button>
                </div>
              </div>
            </header>
            <BlueprintView
              isPublicPreview
              onBack={() => setPublicBlueprintOpen(false)}
            />
          </div>
        ) : (
          <LandingPage
            onOpenAuth={(mode) => setAuthModalMode(mode)}
            onEnterDemo={handleEnterDemo}
            onOpenBlueprint={() => setPublicBlueprintOpen(true)}
          />
        )}

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

  // --- AUTHENTICATED WORKSPACE SHELL ---
  const activeNavConfig = PRIMARY_NAV.find((n) => n.id === activeSection) || PRIMARY_NAV[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1D1A] flex">
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
            <p className="text-xs font-semibold text-[#1C1D1A] truncate">{user.displayName}</p>
            <p className="text-[11px] text-[#73766E] truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
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
            <div className="p-4 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#5C5E58] hover:bg-white"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
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
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
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
              user={user}
              wardrobe={wardrobe}
              outfits={outfits}
              calendar={calendar}
              wearLogs={wearLogs}
              onNavigate={handleNavigate}
              onLogPlannedOutfit={handleLogPlannedOutfit}
            />
          )}

          {activeSection === 'wardrobe' && (
            <WardrobeView
              wardrobe={wardrobe}
              onCreateGarment={handleCreateGarment}
              onUpdateGarment={handleUpdateGarment}
              onDeleteGarment={handleDeleteGarment}
            />
          )}

          {activeSection === 'builder' && (
            <OutfitBuilderView
              wardrobe={wardrobe}
              editingOutfit={editingOutfit}
              onSaveOutfit={handleCreateOutfit}
              onUpdateOutfit={handleUpdateOutfit}
              onCancelEdit={handleCancelEdit}
            />
          )}

          {activeSection === 'outfits' && (
            <OutfitsView
              outfits={outfits}
              wardrobe={wardrobe}
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
              outfits={outfits}
              wardrobe={wardrobe}
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
              calendar={calendar}
              outfits={outfits}
              wardrobe={wardrobe}
              onScheduleOutfit={handleScheduleOutfit}
              onRemovePlan={handleRemoveCalendarPlan}
              onLogPlannedOutfit={handleLogPlannedOutfit}
            />
          )}

          {activeSection === 'history' && (
            <WearHistoryView
              wearLogs={wearLogs}
              outfits={outfits}
              wardrobe={wardrobe}
              onLogWear={handleLogWear}
            />
          )}

          {activeSection === 'suggestions' && (
            <SuggestionsView
              wardrobe={wardrobe}
              onSaveOutfit={handleCreateOutfit}
            />
          )}

          {activeSection === 'statistics' && (
            <StatisticsView
              wardrobe={wardrobe}
              outfits={outfits}
              wearLogs={wearLogs}
            />
          )}

          {activeSection === 'blueprint' && <BlueprintView />}
        </main>
      </div>
    </div>
  );
}
