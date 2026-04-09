export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center rounded-full border border-border/40 bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
          v0.1.0 — Phase 1
        </div>
        <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-400 to-violet-400 bg-clip-text text-transparent">
          Foundry of Agents
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The crypto-native AI agent operating system.
          <br />
          Orchestrate. Collaborate. Execute.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Coming Soon</span>
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>
    </main>
  );
}
