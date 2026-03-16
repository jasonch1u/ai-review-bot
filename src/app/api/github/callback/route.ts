import { NextRequest, NextResponse } from 'next/server';

/**
 * GitHub App post-install callback.
 *
 * GitHub redirects here after a user installs or updates the App:
 *   GET /api/github/callback?installation_id=<id>&setup_action=install|update
 *
 * We forward the installation_id to the onboarding page so the user can see
 * which repositories were connected.
 */
export function GET(request: NextRequest): NextResponse {
  const { searchParams } = request.nextUrl;
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');

  if (!installationId) {
    return NextResponse.redirect(new URL('/?error=missing_installation_id', request.url));
  }

  const onboardingUrl = new URL('/onboarding', request.url);
  onboardingUrl.searchParams.set('installation_id', installationId);
  if (setupAction) {
    onboardingUrl.searchParams.set('setup_action', setupAction);
  }

  return NextResponse.redirect(onboardingUrl);
}
