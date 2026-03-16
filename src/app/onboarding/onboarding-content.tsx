'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OnboardingContent() {
  const searchParams = useSearchParams();
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action') ?? 'install';
  const isUpdate = setupAction === 'update';

  if (!installationId) {
    return <ErrorState message="No installation ID found. Please try installing again." />;
  }

  return (
    <div className="space-y-10">
      {/* Success banner */}
      <div className="rounded-2xl bg-green-50 p-8 text-center ring-1 ring-green-200">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          {isUpdate ? 'Installation updated!' : "You're all set!"}
        </h1>
        <p className="mt-2 text-gray-600">
          ReviewBot is now {isUpdate ? 'updated for' : 'installed on'} your GitHub account.
          <br />
          AI code reviews will start appearing on your next pull request.
        </p>
        <p className="mt-3 text-sm text-gray-400">Installation ID: {installationId}</p>
      </div>

      {/* What happens next */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">What happens next</h2>
        <ol className="mt-4 space-y-4">
          {[
            {
              title: 'Open or update a PR',
              body: 'ReviewBot is triggered automatically on every pull_request event in your selected repos.',
            },
            {
              title: 'AI review appears',
              body: 'Within seconds, structured review comments are posted — with file paths, line numbers, and suggested fixes.',
            },
            {
              title: 'Customize (optional)',
              body: 'Add a .reviewbot.yml file to your repo root to control review strictness, ignored paths, and categories.',
            },
          ].map(({ title, body }, i) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900">{title}</p>
                <p className="mt-0.5 text-sm text-gray-600">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Sample .reviewbot.yml */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900">Sample .reviewbot.yml</h2>
        <p className="mt-1 text-sm text-gray-600">
          Drop this file in your repo root to configure ReviewBot:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-gray-900 p-5 text-sm leading-6 text-gray-100">
          {`# .reviewbot.yml
version: 1

# Categories to enable
categories:
  bugs: true
  security: true
  performance: true
  style: false        # set to true if you want style suggestions
  suggestions: true

# Severity threshold — only post comments at this level or above
# Options: critical | warning | suggestion
min_severity: warning

# Paths to ignore (supports globs)
ignore:
  - "**/*.lock"
  - "node_modules/**"
  - "dist/**"
  - "coverage/**"`}
        </pre>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME ?? 'ai-review-bot'}/installations/${installationId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-gray-200 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Manage installation on GitHub ↗
        </a>
        <Link
          href="/"
          className="flex-1 rounded-full bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorState({ message }: { readonly message: string }) {
  return (
    <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-200">
      <div className="text-4xl">⚠️</div>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-600">{message}</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
