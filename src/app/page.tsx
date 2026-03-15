import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Trust Calibration Experiment
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A research platform for studying how interface design cues affect
          trust and reliance in AI-assisted decision making.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/experiment"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Begin Experiment
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
