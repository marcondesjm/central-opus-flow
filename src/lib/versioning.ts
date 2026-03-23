export function normalizeVersion(version?: string | null): string | null {
  if (!version) return null;
  const normalized = version.trim().replace(/^v/i, '');
  return normalized || null;
}

export function compareVersions(a?: string | null, b?: string | null): number {
  const versionA = normalizeVersion(a);
  const versionB = normalizeVersion(b);

  if (!versionA && !versionB) return 0;
  if (!versionA) return -1;
  if (!versionB) return 1;

  const partsA = versionA.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const partsB = versionB.split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(partsA.length, partsB.length, 3);

  for (let index = 0; index < length; index += 1) {
    const diff = (partsA[index] || 0) - (partsB[index] || 0);
    if (diff !== 0) return diff;
  }

  return 0;
}

export function getHighestVersion(...versions: Array<string | null | undefined>): string | null {
  return versions.reduce<string | null>((highest, current) => {
    const normalizedCurrent = normalizeVersion(current);
    if (!normalizedCurrent) return highest;
    if (!highest || compareVersions(normalizedCurrent, highest) > 0) return normalizedCurrent;
    return highest;
  }, null);
}

export function isVersionBehind(current?: string | null, target?: string | null): boolean {
  return compareVersions(current, target) < 0;
}