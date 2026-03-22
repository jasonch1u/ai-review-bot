import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @octokit/auth-app before importing the module under test
vi.mock('@octokit/auth-app', () => ({
  createAppAuth: vi.fn(),
}));

vi.mock('@octokit/rest', () => {
  const MockOctokit = vi.fn(function (this: object) {
    Object.assign(this, { _mocked: true });
  });
  return { Octokit: MockOctokit };
});

import { createInstallationClient } from './app-auth';
import { createAppAuth } from '@octokit/auth-app';

const VALID_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nfake\n-----END RSA PRIVATE KEY-----';

describe('createInstallationClient', () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  it('throws if GITHUB_APP_ID is missing', async () => {
    delete process.env.GITHUB_APP_ID;
    process.env.GITHUB_APP_PRIVATE_KEY = VALID_PRIVATE_KEY;

    await expect(createInstallationClient(1)).rejects.toThrow('GITHUB_APP_ID is not configured');
  });

  it('throws if GITHUB_APP_PRIVATE_KEY is missing', async () => {
    process.env.GITHUB_APP_ID = '42';
    delete process.env.GITHUB_APP_PRIVATE_KEY;

    await expect(createInstallationClient(1)).rejects.toThrow(
      'GITHUB_APP_PRIVATE_KEY is not configured'
    );
  });

  it('throws if GITHUB_APP_ID is not a number', async () => {
    process.env.GITHUB_APP_ID = 'not-a-number';
    process.env.GITHUB_APP_PRIVATE_KEY = VALID_PRIVATE_KEY;

    await expect(createInstallationClient(1)).rejects.toThrow(
      'GITHUB_APP_ID must be a positive integer'
    );
  });

  it('calls createAppAuth with correct credentials and returns an Octokit client', async () => {
    process.env.GITHUB_APP_ID = '42';
    process.env.GITHUB_APP_PRIVATE_KEY = VALID_PRIVATE_KEY;

    const mockAuth = vi.fn().mockResolvedValue({ token: 'ghs_testtoken123' });
    vi.mocked(createAppAuth).mockReturnValue(mockAuth as unknown as ReturnType<typeof createAppAuth>);

    const client = await createInstallationClient(99);

    expect(createAppAuth).toHaveBeenCalledWith({ appId: 42, privateKey: VALID_PRIVATE_KEY });
    expect(mockAuth).toHaveBeenCalledWith({ type: 'installation', installationId: 99 });
    expect(client).toBeDefined();
  });

  it('normalises \\\\n in private key env var to real newlines', async () => {
    process.env.GITHUB_APP_ID = '42';
    // env vars often store newlines as literal \n
    process.env.GITHUB_APP_PRIVATE_KEY =
      '-----BEGIN RSA PRIVATE KEY-----\\nfake\\n-----END RSA PRIVATE KEY-----';

    const mockAuth = vi.fn().mockResolvedValue({ token: 'ghs_testtoken456' });
    vi.mocked(createAppAuth).mockReturnValue(mockAuth as unknown as ReturnType<typeof createAppAuth>);

    await createInstallationClient(1);

    const callArgs = vi.mocked(createAppAuth).mock.calls[0][0];
    expect(callArgs.privateKey).toContain('\n');
    expect(callArgs.privateKey).not.toContain('\\n');
  });
});
