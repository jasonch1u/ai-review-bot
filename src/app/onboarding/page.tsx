import { Suspense } from 'react';
import OnboardingContent from './onboarding-content';

export const metadata = {
  title: 'Welcome to ReviewBot',
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center">
          <span className="text-lg font-bold tracking-tight text-gray-900">🔍 ReviewBot</span>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Suspense fallback={<LoadingState />}>
          <OnboardingContent />
        </Suspense>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="mt-4 text-gray-600">Loading your installation…</p>
    </div>
  );
}
