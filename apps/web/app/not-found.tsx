import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-extralight text-[#a1a1aa] mb-4">404</h1>
        <p className="text-[#71717a] mb-8">This page doesn&apos;t exist.</p>
        <Link href="/" className="text-sm text-[#a1a1aa] hover:text-white transition-colors duration-200 border border-white/10 px-6 py-3 rounded-xl hover:border-white/20">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
