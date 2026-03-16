import { Octokit } from '@octokit/rest';

/**
 * Creates an Octokit client authenticated with a GitHub installation token.
 */
export function createOctokitClient(installationToken: string): Octokit {
  return new Octokit({ auth: installationToken });
}

/**
 * Creates an unauthenticated Octokit client (for public repos or testing).
 */
export function createUnauthenticatedClient(): Octokit {
  return new Octokit();
}
