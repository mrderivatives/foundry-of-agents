import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-extralight text-muted-foreground mb-4">404</h1>
        <p className="text-muted-foreground mb-8">This page doesn&apos;t exist.</p>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 border border-border px-6 py-3 rounded-xl hover:border-muted-foreground">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
