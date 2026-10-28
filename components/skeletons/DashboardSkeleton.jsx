import ModernDashboardSidebar from "@/components/dashboard/ModernDashboardSidebar";
import { Skeleton } from "@/components/ui/skeleton";
function TopbarSkeleton() {
    return (<header className="surface-glass sticky top-0 z-50 w-full border-b border-border/60 relative overflow-hidden backdrop-blur-2xl bg-card/50">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="md:hidden inline-flex items-center justify-center p-2 rounded-xl border border-border/40 shadow-xs">
              <Skeleton className="h-5 w-5 rounded"/>
            </span>
            <span className="h-7 w-7 rounded-md bg-muted/70 animate-pulse"/>
            <span className="font-heading text-sm font-semibold tracking-tight sm:text-base">
              CILAAA COMMUNITY
            </span>
            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground sm:inline-flex">
              <span className="motion-safe:animate-pulse h-1.5 w-1.5 rounded-full bg-success"/>
              CONSOLE
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-full bg-secondary/60 p-0.5 border border-border/60">
              <span className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
                ID
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-medium bg-background text-foreground border border-border">
                EN
              </span>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 overflow-hidden">
              <Skeleton className="h-full w-full rounded-full"/>
            </span>
          </div>
        </div>
      </div>
    </header>);
}
function PageHeaderSkeleton() {
    return (<div>
      <Skeleton className="h-3 w-32"/>
      <Skeleton className="mt-2 h-7 w-72 max-w-full"/>
      <Skeleton className="mt-2 h-4 w-96 max-w-full"/>
    </div>);
}
function ConvertSkeleton() {
    return (<div className="space-y-8">
      <PageHeaderSkeleton />
      <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full overflow-hidden border-border/60 py-0 gap-0">
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full"/>
          <Skeleton className="h-2.5 w-2.5 rounded-full"/>
          <Skeleton className="h-2.5 w-2.5 rounded-full"/>
          <Skeleton className="ml-2 h-3 w-28"/>
          <Skeleton className="ml-auto h-5 w-16 rounded-full"/>
        </div>
        <div className="pt-6 pb-6 px-4 sm:px-6 space-y-6">
          <Skeleton className="h-28 w-full rounded-lg"/>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-8 w-20 rounded-full"/>))}
          </div>
          <Skeleton className="h-2 w-full rounded-full"/>
          <Skeleton className="h-10 w-44 rounded-full"/>
        </div>
      </div>
    </div>);
}
function HistorySkeleton() {
    return (<div className="space-y-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (<div key={i} data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm overflow-hidden border-border/60">
            <Skeleton className="aspect-square w-full rounded-none"/>
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4"/>
              <Skeleton className="h-3 w-1/2"/>
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-20 rounded"/>
                <Skeleton className="h-8 w-20 rounded"/>
              </div>
            </div>
          </div>))}
      </div>
    </div>);
}
function StudioSkeleton() {
    const bars = [
        0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.95, 0.7, 0.55, 0.85, 0.4, 0.75, 0.9, 0.6,
        0.8, 0.5, 0.7, 0.95, 0.65, 0.85, 0.45, 0.7, 0.9, 0.6, 0.8, 0.5, 0.75,
        0.95, 0.6, 0.85, 0.4, 0.7, 0.9, 0.55, 0.8, 0.5, 0.75, 0.95, 0.65, 0.85,
        0.45, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7, 0.95,
    ];
    return (<div className="space-y-8">
      <PageHeaderSkeleton />
      <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full overflow-hidden border-border/60">
        <div className="p-4 border-b border-border bg-muted/20">
          <Skeleton className="h-3 w-32"/>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex h-32 items-center gap-[3px] overflow-hidden rounded-lg bg-muted/20 px-3">
            {bars.map((h, i) => (<Skeleton key={i} className="w-full rounded-sm" style={{ height: `${Math.round(h * 100)}%` }}/>))}
          </div>
          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-10 w-10 rounded-full"/>))}
          </div>
          <div className="space-y-4 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24"/>
                <Skeleton className="h-2 w-full rounded-full"/>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
function SpooferSkeleton() {
    return (<div className="space-y-8">
      <PageHeaderSkeleton />
      <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full overflow-hidden border-border/60">
        <div className="p-4 border-b border-border bg-muted/20">
          <Skeleton className="h-3 w-32"/>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-lg"/>
            <Skeleton className="h-12 w-32 rounded-lg"/>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (<div key={i} className="rounded-xl border border-border/60 p-4 space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg"/>
                <Skeleton className="h-4 w-2/3"/>
                <Skeleton className="h-3 w-1/2"/>
                <Skeleton className="h-8 w-full rounded"/>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}
function AccountSkeleton() {
    return (<div className="space-y-8">
      <PageHeaderSkeleton />
      <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full overflow-hidden border-border/60 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full"/>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48"/>
            <Skeleton className="h-3 w-28"/>
            <Skeleton className="h-6 w-24 rounded-full"/>
          </div>
        </div>
        <Skeleton className="mt-4 h-4 w-full"/>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-9 w-28 rounded-full"/>))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (<div key={i} data-slot="card" className="bg-card text-card-foreground rounded-xl border shadow-sm border-border/60 p-5 space-y-3">
            <Skeleton className="h-4 w-32"/>
            <Skeleton className="h-3 w-full"/>
            <Skeleton className="h-3 w-5/6"/>
            <Skeleton className="h-3 w-2/3"/>
          </div>))}
      </div>
    </div>);
}
function BillingSkeleton() {
    return (<div className="space-y-8">
      <PageHeaderSkeleton />
      <div data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm w-full overflow-hidden border-border/60">
        <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full"/>
          <Skeleton className="h-2.5 w-2.5 rounded-full"/>
          <Skeleton className="h-2.5 w-2.5 rounded-full"/>
          <Skeleton className="ml-2 h-3 w-28"/>
        </div>
        <div className="flex items-center gap-4 p-6">
          <Skeleton className="h-12 w-12 rounded-xl"/>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40"/>
            <Skeleton className="h-3 w-56"/>
          </div>
          <Skeleton className="h-9 w-32 rounded-lg"/>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (<div key={i} data-slot="card" className="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm border-border/60 p-6 space-y-4">
            <Skeleton className="h-5 w-24"/>
            <Skeleton className="h-8 w-28"/>
            <div className="space-y-2 border-t border-border pt-4">
              {Array.from({ length: 4 }).map((_, j) => (<Skeleton key={j} className="h-3 w-full"/>))}
            </div>
            <Skeleton className="h-9 w-full rounded-lg"/>
          </div>))}
      </div>

      <div data-slot="card" className="bg-card text-card-foreground rounded-xl border shadow-sm border-border/60 overflow-hidden">
        <div className="border-b border-border bg-muted/20 p-4">
          <Skeleton className="h-3 w-32"/>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (<div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-32"/>
              <Skeleton className="h-4 w-24"/>
              <Skeleton className="h-4 w-20"/>
            </div>))}
        </div>
      </div>
    </div>);
}
function MenuContentSkeleton({ pageKind }) {
    switch (pageKind) {
        case "history":
            return <HistorySkeleton />;
        case "studio":
            return <StudioSkeleton />;
        case "spoofer":
            return <SpooferSkeleton />;
        case "account":
            return <AccountSkeleton />;
        case "billing":
            return <BillingSkeleton />;
        case "convert":
        default:
            return <ConvertSkeleton />;
    }
}
export default function DashboardSkeleton({ pageKind }) {
    return (<div className="min-h-screen bg-background text-foreground antialiased exported-root" data-page-kind={pageKind} suppressHydrationWarning>
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <TopbarSkeleton />
        <div className="flex w-full min-h-[calc(100vh-3.5rem)]">
          <ModernDashboardSidebar currentRoute={pageKind}/>
          <div className="min-w-0 flex-1">
            <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
              <MenuContentSkeleton pageKind={pageKind}/>
            </main>
          </div>
        </div>
      </div>
    </div>);
}
