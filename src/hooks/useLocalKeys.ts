import { useState, useEffect, useCallback } from 'react';

export interface AccountLocalKeys {
  supabase_url?: string;
  anon_key?: string;
  service_role_key?: string;
  openai_key?: string;
  notes?: string;
  avatar_url?: string;
  custom_keys?: { name: string; value: string }[];
}

const STORAGE_KEY = 'lovable_account_keys';
const PROJECT_STORAGE_KEY = 'lovable_project_keys';

// ============ ACCOUNT KEYS ============

// Funções para gerenciar keys localmente no navegador
export function getLocalKeys(): Record<string, AccountLocalKeys> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getAccountLocalKeys(accountId: string): AccountLocalKeys {
  const allKeys = getLocalKeys();
  return allKeys[accountId] || {};
}

export function saveAccountLocalKeys(accountId: string, keys: AccountLocalKeys): void {
  const allKeys = getLocalKeys();
  allKeys[accountId] = keys;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
}

export function deleteAccountLocalKeys(accountId: string): void {
  const allKeys = getLocalKeys();
  delete allKeys[accountId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allKeys));
}

export function clearAllLocalKeys(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============ PROJECT KEYS ============

export function getProjectLocalKeys(): Record<string, AccountLocalKeys> {
  try {
    const stored = localStorage.getItem(PROJECT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getProjectKeys(projectId: string): AccountLocalKeys {
  const allKeys = getProjectLocalKeys();
  return allKeys[projectId] || {};
}

export function saveProjectLocalKeys(projectId: string, keys: AccountLocalKeys): void {
  const allKeys = getProjectLocalKeys();
  allKeys[projectId] = keys;
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(allKeys));
}

export function deleteProjectLocalKeys(projectId: string): void {
  const allKeys = getProjectLocalKeys();
  delete allKeys[projectId];
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(allKeys));
}

// ============ EXPORT/IMPORT ============

// Exportar todas as keys como JSON
export function exportLocalKeys(): string {
  const accountKeys = getLocalKeys();
  const projectKeys = getProjectLocalKeys();
  return JSON.stringify({ accounts: accountKeys, projects: projectKeys }, null, 2);
}

// Importar keys de um JSON
export function importLocalKeys(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Handle both old format (flat) and new format (accounts/projects)
    if (parsed.accounts || parsed.projects) {
      // New format
      if (parsed.accounts) {
        const existingKeys = getLocalKeys();
        const mergedKeys = { ...existingKeys, ...parsed.accounts };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedKeys));
      }
      if (parsed.projects) {
        const existingKeys = getProjectLocalKeys();
        const mergedKeys = { ...existingKeys, ...parsed.projects };
        localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(mergedKeys));
      }
      return { 
        success: true, 
        count: Object.keys(parsed.accounts || {}).length + Object.keys(parsed.projects || {}).length 
      };
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Old format (flat account keys)
      const existingKeys = getLocalKeys();
      const mergedKeys = { ...existingKeys, ...parsed };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedKeys));
      return { success: true, count: Object.keys(parsed).length };
    }
    
    return { success: false, count: 0, error: 'Formato inválido' };
  } catch (e) {
    return { success: false, count: 0, error: 'JSON inválido' };
  }
}

// ============ HOOKS ============

// Hook para usar keys locais de uma conta específica
export function useLocalKeys(accountId: string | null) {
  const [keys, setKeys] = useState<AccountLocalKeys>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (accountId) {
      setKeys(getAccountLocalKeys(accountId));
    } else {
      setKeys({});
    }
    setIsLoaded(true);
  }, [accountId]);

  const saveKeys = useCallback((newKeys: AccountLocalKeys) => {
    if (!accountId) return;
    saveAccountLocalKeys(accountId, newKeys);
    setKeys(newKeys);
  }, [accountId]);

  const deleteKeys = useCallback(() => {
    if (!accountId) return;
    deleteAccountLocalKeys(accountId);
    setKeys({});
  }, [accountId]);

  return {
    keys,
    isLoaded,
    saveKeys,
    deleteKeys,
  };
}

// Hook para usar keys locais de um projeto específico
export function useProjectLocalKeys(projectId: string | null) {
  const [keys, setKeys] = useState<AccountLocalKeys>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (projectId) {
      setKeys(getProjectKeys(projectId));
    } else {
      setKeys({});
    }
    setIsLoaded(true);
  }, [projectId]);

  const saveKeys = useCallback((newKeys: AccountLocalKeys) => {
    if (!projectId) return;
    saveProjectLocalKeys(projectId, newKeys);
    setKeys(newKeys);
  }, [projectId]);

  const deleteKeys = useCallback(() => {
    if (!projectId) return;
    deleteProjectLocalKeys(projectId);
    setKeys({});
  }, [projectId]);

  return {
    keys,
    isLoaded,
    saveKeys,
    deleteKeys,
  };
}

// Hook para gerenciar keys de uma nova conta (antes de ter ID)
export function useNewAccountKeys() {
  const [tempKeys, setTempKeys] = useState<AccountLocalKeys>({});

  const saveToAccount = useCallback((accountId: string) => {
    if (tempKeys.anon_key || tempKeys.service_role_key || tempKeys.openai_key || tempKeys.supabase_url || (tempKeys.custom_keys && tempKeys.custom_keys.length > 0)) {
      saveAccountLocalKeys(accountId, tempKeys);
    }
    setTempKeys({});
  }, [tempKeys]);

  const clearTemp = useCallback(() => {
    setTempKeys({});
  }, []);

  return {
    tempKeys,
    setTempKeys,
    saveToAccount,
    clearTemp,
  };
}
