import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-chamber-950 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chamber-800">
        <svg
          className="h-10 w-10 text-chamber-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
          />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-6xl font-bold text-gold-400">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 max-w-md text-chamber-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-medium text-chamber-950 transition-colors hover:bg-gold-500"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
