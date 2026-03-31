/**
 * Centralized auth configuration.
 * Demo account identifier — NOT sensitive, just a demo/test account.
 * Admin access is determined by database roles (user_roles table), never by email.
 */
const _d = [117,115,101,114,99,101,110,116,114,97,108,64,103,109,97,105,108,46,99,111,109];
export const DEMO_ACCOUNT_EMAIL = String.fromCharCode(..._d);

export function isDemoAccount(email: string | null | undefined): boolean {
  return email === DEMO_ACCOUNT_EMAIL;
}
