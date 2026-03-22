import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

/**
 * Reads and validates required GitHub App credentials from environment variables.
 * Throws early with a clear message if any are missing.
 */
function getAppCredentials(): { appId: number; privateKey: string } {
  const appIdRaw = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appIdRaw) throw new Error('GITHUB_APP_ID is not configured');
  if (!privateKey) throw new Error('GITHUB_APP_PRIVATE_KEY is not configured');

  const appId = parseInt(appIdRaw, 10);
  if (isNaN(appId) || appId <= 0) {
    throw new Error(`GITHUB_APP_ID must be a positive integer, got: ${appIdRaw}`);
  }

  // GitHub private keys in env vars may use literal \n instead of newlines
  const normalizedKey = privateKey.replace(/\\n/g, '\n');

  return { appId, privateKey: normalizedKey };
}

/**
 * Creates an Octokit client authenticated as a GitHub App installation.
 * Uses JWT-based auth to exchange installationId for a short-lived token.
 */
export async function createInstallationClient(installationId: number): Promise<Octokit> {
  const { appId, privateKey } = getAppCredentials();

  const auth = createAppAuth({ appId, privateKey });

  const { token } = await auth({
    type: 'installation',
    installationId,
  });

  return new Octokit({ auth: token });
}
