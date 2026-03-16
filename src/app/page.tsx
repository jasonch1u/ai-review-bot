import Link from 'next/link';

const GITHUB_APP_NAME = process.env.GITHUB_APP_NAME ?? 'ai-review-bot';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Review',
    description:
      'Claude analyzes every PR diff and spots bugs, security issues, and performance problems before they hit production.',
  },
  {
    icon: '⚡',
    title: 'Instant Feedback',
    description:
      'Reviews posted automatically within seconds of opening or updating a pull request — no waiting for teammates.',
  },
  {
    icon: '🎯',
    title: 'Actionable Comments',
    description:
      'Each comment includes the exact file, line number, severity level, and a suggested fix — not just vague warnings.',
  },
  {
    icon: '⚙️',
    title: 'Configurable Rules',
    description:
      'Drop a .reviewbot.yml in your repo to customize what gets reviewed and how strict the bot should be.',
  },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for side projects',
    features: ['Up to 3 repositories', 'Unlimited PRs', 'All review categories', 'Community support'],
    cta: 'Install for Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For serious teams',
    features: [
      'Unlimited repositories',
      'Unlimited PRs',
      'All review categories',
      'Custom .reviewbot.yml rules',
      'Priority support',
    ],
    cta: 'Start Pro',
    highlighted: true,
  },
];

export default function HomePage() {
  const installUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-gray-900">
            🔍 ReviewBot
          </span>
          <div className="flex items-center gap-4">
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <a
              href={installUrl}
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              Install on GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 ring-1 ring-green-200">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Free for up to 3 repos
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI code reviews on{' '}
            <span className="text-indigo-600">every PR</span>
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            ReviewBot automatically analyzes your pull requests with Claude AI, catching bugs, security issues, and
            performance problems — so your team can ship with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={installUrl}
              className="flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              Install on GitHub — it&apos;s free
            </a>
            <a href="#how-it-works" className="text-base font-medium text-gray-600 hover:text-gray-900">
              See how it works →
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: '1', title: 'Install the GitHub App', body: 'Click "Install on GitHub" and grant access to the repos you want reviewed.' },
              { step: '2', title: 'Open a pull request', body: 'ReviewBot is triggered automatically on every new or updated PR in your chosen repos.' },
              { step: '3', title: 'Get instant AI reviews', body: 'Structured comments appear on the PR with exact file locations, severity, and fix suggestions.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                  {step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-6">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Everything you need</h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            ReviewBot handles the tedious parts of code review so your team can focus on what matters.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-600 leading-6">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-4 text-center text-lg text-gray-600">
            Start free. Upgrade when you&apos;re ready.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.highlighted
                    ? 'bg-indigo-600 text-white shadow-xl'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <h3 className={`text-sm font-semibold uppercase tracking-widest ${tier.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className={`text-sm ${tier.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {tier.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${tier.highlighted ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlighted ? 'text-indigo-200' : 'text-green-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={installUrl}
                  className={`mt-8 flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">Ready to ship better code?</h2>
          <p className="mt-4 text-lg text-gray-600">
            Install ReviewBot in 30 seconds. No credit card required.
          </p>
          <a
            href={installUrl}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            Install on GitHub — free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} ReviewBot. Built with Claude AI.</p>
      </footer>
    </div>
  );
}
