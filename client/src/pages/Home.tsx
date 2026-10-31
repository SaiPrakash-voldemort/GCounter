import {
  useGoonCounter,
  type DashboardData,
  type FriendSummary,
  type LeaderboardEntry,
} from "@/lib/useGoonCounter";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  History as HistoryIcon,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Trophy,
  UserRoundPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type View = "dashboard" | "leaderboard" | "friends" | "history";
type LeaderboardTab = "Monthly" | "Weekly" | "All Time";
type Timestamp = Date | string;

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "friends", label: "Friends", icon: Users },
  { id: "history", label: "History", icon: HistoryIcon },
];

function formatDate(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

function formatTime(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function getInitials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return (
    parts
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase() || "G"
  );
}

function monthLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function Avatar({
  initials,
  tone = "from-lime-200 to-lime-500",
  size = "md",
}: {
  initials: string;
  tone?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-lg",
  };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone} font-bold text-[#20221c] shadow-[inset_0_1px_0_rgba(255,255,255,.42)] ${sizes[size]}`}
    >
      {initials}
    </div>
  );
}

function avatarTone(index: number) {
  return [
    "from-lime-200 to-lime-500",
    "from-sky-300 to-indigo-400",
    "from-orange-300 to-rose-400",
    "from-emerald-300 to-teal-500",
    "from-violet-300 to-purple-500",
  ][index % 5];
}

function SectionLabel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/43">
        {children}
      </h2>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  accent = "text-lime-300",
  delay = "",
}: {
  label: string;
  value: string;
  meta: string;
  icon: typeof Activity;
  accent?: string;
  delay?: string;
}) {
  return (
    <div
      className={`surface surface-hover rise-in rounded-2xl p-4 sm:p-5 ${delay}`}
    >
      <div className="mb-6 flex items-start justify-between">
        <p className="text-xs font-medium text-white/48">{label}</p>
        <Icon className={`h-4 w-4 ${accent}`} strokeWidth={1.8} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="display-font text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {value}
        </span>
        <span className="mb-1 text-right text-[10px] leading-tight text-white/35">
          {meta}
        </span>
      </div>
    </div>
  );
}

function TinyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#232327] px-3 py-2 shadow-xl">
      <p className="mb-1 text-[10px] text-white/45">{label}</p>
      <p className="mono-font text-sm font-medium text-lime-300">
        {payload[0]?.value ?? 0} logs
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#151518] text-white">
      <div className="flex items-center gap-3 text-sm text-white/55">
        <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" />{" "}
        Checking your session…
      </div>
    </div>
  );
}

function LoginScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="noise flex min-h-screen items-center justify-center overflow-hidden bg-[#151518] px-4 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(211,255,80,.12),transparent_38%),radial-gradient(circle_at_5%_90%,rgba(88,77,188,.1),transparent_30%)]" />
      <div className="surface relative w-full max-w-md rounded-3xl p-7 text-center shadow-2xl sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-300 text-3xl shadow-[0_0_40px_rgba(211,255,80,.2)]">
          🍆
        </div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300">
          Goon Counter
        </p>
        <h1 className="display-font text-4xl font-semibold tracking-[-0.06em]">
          Your stats are waiting<span className="text-white/35">.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/45">
          Sign in to log your events, keep your streak, and see where you rank
          against everyone else.
        </p>
        <button
          onClick={onSignIn}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 py-3.5 text-sm font-bold text-[#1b1e18] transition-transform active:scale-[.98] hover:bg-lime-200"
        >
          <span>Continue with Google</span>
          <ChevronRight className="h-4 w-4" />
        </button>
        <p className="mt-5 text-[10px] text-white/25">
          Your dashboard is private. Leaderboards are shared.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    user,
    profile,
    loading,
    data,
    dataLoading,
    error,
    isAuthenticated,
    signIn,
    signOut,
    logEvent,
    addFriend,
    refresh,
  } = useGoonCounter();
  const [view, setView] = useState<View>("dashboard");
  const [leaderboardTab, setLeaderboardTab] =
    useState<LeaderboardTab>("Monthly");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [justLogged, setJustLogged] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated || !user) {
    if (error)
      return (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      );
    return (
      <LoginScreen
        onSignIn={() =>
          void signIn().catch(loginError => toast.error(loginError.message))
        }
      />
    );
  }
  if (error && !data)
    return <ErrorState message={error} onRetry={() => void refresh()} />;
  if (!data) return <LoadingScreen />;
  const goTo = (next: View) => {
    setView(next);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // const handleLog = () => {
  //   if (!dataLoading)
  //     void logEvent()
  //       .then(() => {
  //         setJustLogged(true);
  //         window.setTimeout(() => setJustLogged(false), 900);
  //         toast.success("Logged. Stay strong soldier 🫡", {
  //           description: "Another one for the statistics.",
  //         });
  //       })
  //       .catch(logError => toast.error(logError.message));
  // };

  const handleLog = () => {
    if (isLogging) return;

    setIsLogging(true);

    void logEvent()
      .then(() => {
        setJustLogged(true);

        window.setTimeout(() => {
          setJustLogged(false);
        }, 900);

        toast.success("Logged. Stay strong soldier 🫡", {
          description: "Another one for the statistics.",
        });
      })
      .catch(logError => {
        toast.error(logError.message);
      })
      .finally(() => {
        setIsLogging(false);
      });
  };
  const handleAddFriend = () => {
    const trimmed = friendName.trim();
    if (trimmed)
      void addFriend(trimmed)
        .then(() => {
          toast.success(`${trimmed} added to your circle`);
          setFriendName("");
          setAddFriendOpen(false);
        })
        .catch(friendError => toast.error(friendError.message));
  };
  const userLabel =
    profile?.username ||
    profile?.display_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Gooner";

  return (
    <div className="noise min-h-screen overflow-x-hidden bg-[#151518] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_0%,rgba(211,255,80,.075),transparent_30%),radial-gradient(circle_at_5%_40%,rgba(88,77,188,.09),transparent_26%)]" />
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#151518]/88 backdrop-blur-xl">
        <div className="container flex h-[72px] items-center justify-between gap-5">
          <button
            className="group flex items-center gap-3 text-left"
            onClick={() => goTo("dashboard")}
            aria-label="Go to dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-300 text-lg shadow-[0_0_28px_rgba(211,255,80,.15)] transition-transform group-hover:rotate-[-8deg]">
              🍆
            </span>
            <span className="display-font text-[17px] font-bold tracking-tight">
              Goon <span className="text-white/45">Counter</span>
            </span>
          </button>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${view === id ? "bg-white/[0.08] text-white" : "text-white/43 hover:bg-white/[0.045] hover:text-white/80"}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="hidden rounded-lg p-2 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white sm:block"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              className="hidden rounded-lg p-2 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white sm:block"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileNavOpen(open => !open)}
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/[0.06] lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => void signOut()}
              className="group flex items-center gap-3 border-l border-white/10 pl-3 text-left"
              aria-label="Sign out"
            >
              <Avatar initials={getInitials(userLabel)} size="sm" />
              <span className="hidden xl:block">
                <span className="block text-xs font-medium">
                  {userLabel.split(" ")[0] ?? "Gooner"}
                </span>
                <span className="block text-[10px] text-white/35">
                  Signed in
                </span>
              </span>
              <LogOut className="hidden h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-white/75 xl:block" />
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="container border-t border-white/[0.07] py-3 lg:hidden">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`mr-1 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${view === id ? "bg-white/[0.08] text-white" : "text-white/45"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}
      </header>
      <main className="container py-8 sm:py-10 lg:py-12">
        {view === "dashboard" && (
          // <Dashboard
          //   data={data}
          //   justLogged={justLogged}
          //   isLogging={dataLoading}
          //   logEvent={handleLog}
          //   goTo={goTo}
          // />
          <Dashboard
            data={data}
            justLogged={justLogged}
            isLogging={isLogging}
            logEvent={handleLog}
            goTo={goTo}
          />
        )}
        {view === "leaderboard" && (
          <Leaderboard
            entries={
              leaderboardTab === "Monthly"
                ? data.leaderboards.monthly
                : leaderboardTab === "Weekly"
                  ? data.leaderboards.weekly
                  : data.leaderboards.allTime
            }
            tab={leaderboardTab}
            setTab={setLeaderboardTab}
            currentCount={data.stats.monthCount}
          />
        )}{" "}
        {view === "friends" && (
          <Friends
            friends={data.friends}
            openModal={() => setAddFriendOpen(true)}
          />
        )}
        {view === "history" && <HistoryPage history={data.history} />}
      </main>
      {addFriendOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setAddFriendOpen(false);
          }}
        >
          <div className="surface w-full max-w-md rounded-2xl p-6 shadow-2xl rise-in">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-lime-300">
                  Expand the circle
                </p>
                <h2 className="display-font text-2xl font-semibold">
                  Add a friend
                </h2>
              </div>
              <button
                onClick={() => setAddFriendOpen(false)}
                className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <label
              className="mb-2 block text-xs text-white/55"
              htmlFor="friend-name"
            >
              Exact username
            </label>
            <input
              id="friend-name"
              autoFocus
              value={friendName}
              onChange={event => setFriendName(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") handleAddFriend();
              }}
              placeholder="e.g. Alex"
              className="mb-5 w-full rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/25 focus:border-lime-300/50"
            />
            <p className="mb-5 text-[10px] leading-4 text-white/30">
              Friends must have signed in once so they can appear on the shared
              leaderboard.
            </p>
            <button
              disabled={dataLoading}
              onClick={handleAddFriend}
              className="w-full rounded-xl bg-lime-300 py-3 text-sm font-bold text-[#1b1e18] transition-transform active:scale-[.98] hover:bg-lime-200 disabled:cursor-wait disabled:opacity-60"
            >
              {dataLoading ? "Adding…" : "Add friend"}
            </button>
          </div>
        </div>
      )}
      <footer className="container flex flex-col justify-between gap-2 border-t border-white/[0.07] py-7 text-[10px] text-white/25 sm:flex-row">
        <span>GOON COUNTER / SHARED ANALYTICS</span>
        <span className="mono-font">SUPABASE • REALTIME SYNC</span>
      </footer>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#151518] p-4 text-white">
      <div className="surface max-w-md rounded-2xl p-7 text-center">
        <p className="text-[10px] uppercase tracking-[0.18em] text-rose-300">
          Connection issue
        </p>
        <h1 className="display-font mt-3 text-2xl font-semibold">
          The dashboard is taking a breather.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/45">{message}</p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#1b1e18]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function formatElapsedTime(timestamp: string, now: number) {
  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(timestamp).getTime()) / 1000)
  );

  const days = Math.floor(elapsed / 86400);
  const hours = Math.floor((elapsed % 86400) / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function LastEventTimer({ timestamp }: { timestamp?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!timestamp) return;

    setNow(Date.now());

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timestamp]);

  if (!timestamp) {
    return (
      <p className="text-center text-[11px] text-white/35">
        No logs yet. Start your record. 💀
      </p>
    );
  }

  const timestampMs = new Date(timestamp).getTime();

  if (!Number.isFinite(timestampMs)) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
        <Clock3 className="h-3.5 w-3.5" />
        Time since last goon
      </p>

      <p className="mono-font text-lg font-semibold tabular-nums text-lime-300">
        {formatElapsedTime(timestamp, now)}
      </p>

      <p className="text-[10px] text-white/30">The clock doesn't lie. 💀</p>
    </div>
  );
}

function Dashboard({
  data,
  justLogged,
  isLogging,
  logEvent,
  goTo,
}: {
  data: DashboardData;
  justLogged: boolean;
  isLogging: boolean;
  logEvent: () => void;
  goTo: (view: View) => void;
}) {
  const { stats, daily, weekday, leaderboard } = data;
  return (
    <div className="space-y-8">
      <section className="grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
        <div className="rise-in">
          <div className="mb-5 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-lime-300">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(215,255,87,.9)]" />{" "}
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              month: "long",
              day: "2-digit",
              year: "numeric",
            }).format(new Date())}
          </div>
          <h1 className="display-font max-w-2xl text-4xl font-semibold leading-[.98] tracking-[-0.065em] text-white sm:text-6xl lg:text-[5.5rem]">
            Track your streak.
            <br />
            <span className="text-white/35">Beat your friends.</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/45">
            Your shared goon analytics dashboard. Serious data for an unserious
            habit.
          </p>
        </div>
        {/* <div className="flex flex-col items-start gap-4 lg:items-end">
          <button
            disabled={isLogging}
            onClick={logEvent}
            className={`cta-shadow pulse-soft group relative flex min-h-[116px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-lime-300 px-8 text-lg font-bold text-[#1b1e18] transition-all duration-200 hover:bg-lime-200 active:scale-[.975] disabled:cursor-wait disabled:opacity-70 sm:min-h-[130px] lg:max-w-[350px] ${justLogged ? "scale-[.98]" : ""}`}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            <Zap
              className={`relative h-5 w-5 fill-current ${justLogged ? "animate-bounce" : ""}`}
            />
            <span className="relative">
              {isLogging ? "LOGGING…" : "I GOONED"}
            </span>
            <span className="relative text-xl">💀</span>
          </button>
          <p className="flex items-center gap-2 text-[11px] text-white/35 lg:mr-2">
            <Clock3 className="h-3.5 w-3.5" /> Synced with the shared database{" "}
            <span className="text-lime-300">↗</span>
          </p>
        </div> */}
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <button
            disabled={isLogging}
            onClick={logEvent}
            className={`cta-shadow pulse-soft group relative flex min-h-[116px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-lime-300 px-8 text-lg font-bold text-[#1b1e18] transition-all duration-200 hover:bg-lime-200 active:scale-[.975] disabled:cursor-wait disabled:opacity-70 sm:min-h-[130px] lg:max-w-[350px] ${justLogged ? "scale-[.98]" : ""}`}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

            <Zap
              className={`relative h-5 w-5 fill-current ${justLogged ? "animate-bounce" : ""}`}
            />

            <span className="relative">
              {isLogging ? "LOGGING…" : "I GOONED"}
            </span>

            <span className="relative text-xl">💀</span>
          </button>

          {/* Honor policy */}
          <p className="text-center text-[11px] font-medium text-rose-300/70 lg:max-w-[350px]">
            ⚠️ If you didn't goon but you're trying to click "I GOONED", then
            you're gay. Be honest. 💀
          </p>

          <p className="flex items-center gap-2 text-[11px] text-white/35 lg:mr-2">
            <Clock3 className="h-3.5 w-3.5" />
            Synced with the shared database{" "}
            <span className="text-lime-300">↗</span>
          </p>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Today's count"
          value={String(stats.todayCount)}
          meta="events today"
          icon={Activity}
        />
        <StatCard
          label="This week"
          value={String(stats.weekCount)}
          meta="shared with your circle"
          icon={CalendarDays}
          accent="text-sky-300"
          delay="[animation-delay:40ms]"
        />
        <StatCard
          label="This month"
          value={String(stats.monthCount)}
          meta={monthLabel()}
          icon={BarChart3}
          accent="text-violet-300"
          delay="[animation-delay:80ms]"
        />
        <StatCard
          label="Current streak"
          value={`${stats.streak}d`}
          meta="keep it alive"
          icon={Flame}
          accent="text-orange-300"
          delay="[animation-delay:120ms]"
        />
        <StatCard
          label="Total count"
          value={String(stats.total)}
          meta="since day one"
          icon={Trophy}
          accent="text-amber-300"
          delay="[animation-delay:160ms]"
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.5fr_.85fr]">
        <div className="surface rounded-2xl p-5 sm:p-6">
          <SectionLabel
            action={
              <span className="mono-font text-[10px] text-white/30">
                LAST 14 DAYS
              </span>
            }
          >
            Daily activity
          </SectionLabel>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={daily}
                margin={{ top: 8, right: 8, bottom: 0, left: -22 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,.34)", fontSize: 10 }}
                  dy={10}
                  interval={1}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,.24)", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<TinyTooltip />}
                  cursor={{ stroke: "rgba(215,255,87,.18)" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#d7ff57"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: "#d7ff57",
                    stroke: "#151518",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "#d7ff57",
                    stroke: "#151518",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-white/35">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Personal
            activity <span className="text-lime-300">updates live</span>
          </div>
        </div>
        <div className="surface rounded-2xl p-5 sm:p-6">
          <SectionLabel
            action={
              <span className="mono-font text-[10px] text-white/30">
                BY WEEKDAY
              </span>
            }
          >
            Day of week
          </SectionLabel>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekday}
                margin={{ top: 8, right: 0, bottom: 0, left: -22 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,.34)", fontSize: 10 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,.24)", fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<TinyTooltip />}
                  cursor={{ fill: "rgba(255,255,255,.03)" }}
                />
                <Bar dataKey="count" fill="#829c38" radius={[5, 5, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-white/35">
            Your habits, measured honestly.
          </p>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="surface rounded-2xl p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <SectionLabel>Monthly leaderboard</SectionLabel>
              <h2 className="display-font -mt-2 text-xl font-semibold">
                {monthLabel()} <span className="text-white/30">/ top five</span>
              </h2>
            </div>
            <button
              onClick={() => goTo("leaderboard")}
              className="flex items-center gap-1 text-[11px] text-lime-300 transition-colors hover:text-lime-200"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <LeaderboardRows entries={leaderboard.slice(0, 5)} />
        </div>
        <ProfileCard data={data} />
      </section>
    </div>
  );
}

function LeaderboardRows({ entries }: { entries: LeaderboardEntry[] }) {
  if (!entries.length)
    return (
      <EmptyState title="No logs yet" body="Be the first one on the board." />
    );
  return (
    <div className="space-y-1">
      {entries.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${entry.isCurrentUser ? "bg-lime-300/[0.08]" : "hover:bg-white/[0.035]"}`}
        >
          <span
            className={`w-5 text-center text-xs font-semibold ${entry.rank === 1 ? "text-lime-300" : "text-white/35"}`}
          >
            {String(entry.rank).padStart(2, "0")}
          </span>
          <Avatar
            initials={entry.initials}
            tone={avatarTone(index)}
            size="sm"
          />
          <span
            className={`flex-1 text-sm ${entry.isCurrentUser ? "font-semibold text-white" : "text-white/70"}`}
          >
            {entry.username}
            {entry.isCurrentUser && (
              <span className="ml-2 rounded bg-lime-300/15 px-1.5 py-0.5 text-[9px] font-medium text-lime-300">
                YOU
              </span>
            )}
          </span>
          <span className="mono-font text-sm text-white/75">{entry.count}</span>
        </div>
      ))}
    </div>
  );
}

function ProfileCard({ data }: { data: DashboardData }) {
  return (
    <div className="surface rounded-2xl p-5 sm:p-6">
      <SectionLabel
        action={
          <button
            className="text-white/30 transition-colors hover:text-white/70"
            aria-label="Profile help"
          >
            <CircleHelp className="h-4 w-4" />
          </button>
        }
      >
        Your profile
      </SectionLabel>
      <div className="flex items-center gap-4">
        <Avatar initials={data.user.initials} size="lg" />
        <div>
          <h2 className="display-font text-xl font-semibold">
            {data.user.username}
          </h2>
          <p className="mt-1 text-xs text-lime-300">
            Gooner Level {Math.max(1, Math.floor(data.stats.total / 10))}{" "}
            <span className="text-white/30">•</span> authenticated
          </p>
        </div>
      </div>
      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full w-[72%] rounded-full bg-lime-300" />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-white/30">
        <span>Progress</span>
        <span>database synced</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-y-4 border-t border-white/[0.08] pt-5">
        <div>
          <p className="text-[10px] text-white/35">Total</p>
          <p className="mono-font mt-1 text-sm text-white">
            {data.stats.total}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/35">Current streak</p>
          <p className="mono-font mt-1 text-sm text-white">
            {data.stats.streak} days
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/35">Monthly rank</p>
          <p className="mono-font mt-1 text-sm text-white">
            #{data.leaderboard.find(entry => entry.isCurrentUser)?.rank ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/35">Friends</p>
          <p className="mono-font mt-1 text-sm text-white">
            {data.stats.friendsCount}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <span
          className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${data.stats.total > 0 ? "border-lime-300/20 bg-lime-300/10 text-lime-200" : "border-white/10 bg-white/[0.04] text-white/35"}`}
        >
          🏅 First Log
        </span>
        <span
          className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${data.stats.streak >= 7 ? "border-orange-300/20 bg-orange-300/10 text-orange-200" : "border-white/10 bg-white/[0.04] text-white/35"}`}
        >
          🔥 7 Day Streak
        </span>
        <span
          className={`rounded-lg border px-2.5 py-1.5 text-[10px] ${data.stats.total >= 100 ? "border-white/10 bg-white/[0.04] text-white/65" : "border-white/10 bg-white/[0.04] text-white/35"}`}
        >
          💯 Century Club
        </span>
      </div>
    </div>
  );
}

function Leaderboard({
  entries,
  tab,
  setTab,
  currentCount,
}: {
  entries: LeaderboardEntry[];
  tab: LeaderboardTab;
  setTab: (tab: LeaderboardTab) => void;
  currentCount: number;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rise-in">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-300">
          <Trophy className="h-4 w-4" /> The scoreboard
        </p>
        <h1 className="display-font text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
          Leaderboard<span className="text-white/30">.</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/45">
          Shared counts from everyone who has joined. The data doesn't lie.
        </p>
      </div>
      <div className="surface overflow-hidden rounded-2xl">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.17em] text-white/35">
              Live leaderboard
            </p>
            <h2 className="display-font mt-1 text-xl font-semibold">
              {tab === "Monthly" ? monthLabel() : tab}
            </h2>
          </div>
          <div className="flex rounded-lg bg-white/[0.05] p-1">
            {(["Monthly", "Weekly", "All Time"] as LeaderboardTab[]).map(
              item => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-md px-3 py-2 text-[10px] transition-colors ${tab === item ? "bg-lime-300 text-[#1b1e18] font-bold" : "text-white/40 hover:text-white"}`}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {entries.length ? (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-5 py-4 transition-colors sm:gap-5 sm:px-6 ${entry.isCurrentUser ? "bg-lime-300/[0.06]" : "hover:bg-white/[0.025]"}`}
              >
                <span
                  className={`w-6 text-center font-semibold ${entry.rank === 1 ? "text-lime-300" : "text-white/35"}`}
                >
                  {entry.rank}
                </span>
                <Avatar initials={entry.initials} tone={avatarTone(index)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {entry.username}
                    {entry.isCurrentUser && (
                      <span className="ml-2 rounded bg-lime-300/15 px-1.5 py-0.5 text-[9px] text-lime-300">
                        YOU
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-white/35">
                    Shared activity
                  </p>
                </div>
                <div className="text-right">
                  <p className="mono-font text-lg text-white">{entry.count}</p>
                  <p className="text-[9px] uppercase tracking-wider text-white/30">
                    logs
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10">
              <EmptyState
                title="No one has logged yet"
                body="Your first event will open the board."
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-4 text-[10px] text-white/30 sm:px-6">
          <span>Refreshes every 10 seconds</span>
          <span className="text-lime-300">
            {currentCount} of your logs this month
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/35">
            Your position
          </p>
          <p className="display-font mt-2 text-3xl text-lime-300">
            #{entries.find(entry => entry.isCurrentUser)?.rank ?? "—"}
          </p>
          <p className="mt-1 text-xs text-white/35">Keep showing up</p>
        </div>
        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/35">
            This month
          </p>
          <p className="display-font mt-2 text-3xl">{currentCount}</p>
          <p className="mt-1 text-xs text-white/35">personal logs</p>
        </div>
        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] uppercase tracking-widest text-white/35">
            Sync status
          </p>
          <p className="display-font mt-2 text-3xl text-lime-300">LIVE</p>
          <p className="mt-1 text-xs text-white/35">database connected</p>
        </div>
      </div>
    </div>
  );
}

function Friends({
  friends,
  openModal,
}: {
  friends: FriendSummary[];
  openModal: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="rise-in">
          <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-300">
            <Users className="h-4 w-4" /> Your circle
          </p>
          <h1 className="display-font text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
            Friends<span className="text-white/30">.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/45">
            Add other signed-in users and keep tabs on the people putting in the
            work.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-[#1b1e18] transition-transform active:scale-[.98] hover:bg-lime-200"
        >
          <UserRoundPlus className="h-4 w-4" /> Add friend
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend, index) => (
          <div
            key={friend.id}
            className="surface surface-hover rounded-2xl p-5"
          >
            <div className="flex items-start justify-between">
              <Avatar
                initials={friend.initials}
                tone={avatarTone(index + 1)}
                size="lg"
              />
              <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] text-white/40">
                #{friend.rank}
              </span>
            </div>
            <h2 className="display-font mt-5 text-xl font-semibold">
              {friend.username}
            </h2>
            <p className="mt-1 text-xs text-white/35">
              Shared leaderboard member
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-4">
              <div>
                <p className="text-[10px] text-white/35">Streak</p>
                <p className="mt-1 flex items-center gap-1 text-sm">
                  <Flame className="h-3.5 w-3.5 text-orange-300" />{" "}
                  {friend.streak} days
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/35">This month</p>
                <p className="mono-font mt-1 text-sm">{friend.monthlyCount}</p>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={openModal}
          className="surface surface-hover flex min-h-[230px] flex-col items-center justify-center rounded-2xl border-dashed text-white/30 transition-colors hover:text-lime-300"
        >
          <Plus className="mb-3 h-6 w-6" />
          <span className="text-sm">Add another friend</span>
          <span className="mt-1 text-[10px]">Search by exact username</span>
        </button>
      </div>
      <div className="surface flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Shared by design</h3>
            <p className="mt-1 text-xs text-white/35">
              Everyone who signs in and logs an event can appear on the board.
            </p>
          </div>
        </div>
        <span className="rounded-lg border border-lime-300/20 px-3 py-2 text-[10px] text-lime-300">
          REALTIME SYNC
        </span>
      </div>
    </div>
  );
}

function HistoryPage({ history }: { history: DashboardData["history"] }) {
  return (
    <div className="space-y-8">
      <div className="rise-in">
        <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime-300">
          <HistoryIcon className="h-4 w-4" /> The receipts
        </p>
        <h1 className="display-font text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
          History<span className="text-white/30">.</span>
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/45">
          Every log, exactly when it happened. Consistency is key.
        </p>
      </div>
      <div className="surface overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5 sm:p-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.17em] text-white/35">
              Activity log
            </p>
            <h2 className="display-font mt-1 text-xl font-semibold">
              Recent events
            </h2>
          </div>
          <span className="mono-font rounded-lg bg-white/[0.05] px-3 py-2 text-[10px] text-white/35">
            {history.length} ENTRIES
          </span>
        </div>
        <div className="hidden grid-cols-[1.35fr_1fr_1fr_80px] gap-4 border-b border-white/[0.06] px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-white/30 sm:grid sm:px-6">
          <span>Date</span>
          <span>Time</span>
          <span>Day</span>
          <span className="text-right">Count</span>
        </div>
        <div className="divide-y divide-white/[0.055]">
          {history.length ? (
            history.map(event => {
              const date = new Date(event.timestamp);
              return (
                <div
                  key={event.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.025] sm:grid-cols-[1.35fr_1fr_1fr_80px] sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-300/10 text-lime-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm text-white/75">
                      {formatDate(event.timestamp)}
                    </span>
                  </div>
                  <span className="mono-font text-xs text-white/45">
                    {formatTime(event.timestamp)}
                  </span>
                  <span className="hidden text-xs text-white/45 sm:block">
                    {new Intl.DateTimeFormat("en-US", {
                      weekday: "long",
                    }).format(date)}
                  </span>
                  <span className="mono-font text-right text-sm text-white/70">
                    1
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-10">
              <EmptyState
                title="No history yet"
                body="Press the button when you are ready to start your record."
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-white/30">
        <LockKeyhole className="h-3.5 w-3.5" /> Your history is stored in the
        shared database and only visible to you.
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-medium text-white/65">{title}</p>
      <p className="mt-1 text-xs text-white/35">{body}</p>
    </div>
  );
}
