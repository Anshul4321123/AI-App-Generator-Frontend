import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          AI App Generator
        </h1>

        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="border px-4 py-2 rounded"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}