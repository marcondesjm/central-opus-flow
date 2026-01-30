import { useState, useEffect, useCallback } from 'react';

export interface AccountLocalKeys {
  supabase_url?: string;
  anon_key?: string;
  service_role_key?: string;
  openai_key?: string;
  notes?: string;
  custom_keys?: { name: string; value: string }[];
}

const STORAGE_KEY = 'lovable_account_keys';

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

// Exportar todas as keys como JSON
export function exportLocalKeys(): string {
  const allKeys = getLocalKeys();
  return JSON.stringify(allKeys, null, 2);
}

// Importar keys de um JSON
export function importLocalKeys(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, count: 0, error: 'Formato inválido' };
    }
    
    const existingKeys = getLocalKeys();
    const mergedKeys = { ...existingKeys, ...parsed };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedKeys));
    
    return { success: true, count: Object.keys(parsed).length };
  } catch (e) {
    return { success: false, count: 0, error: 'JSON inválido' };
  }
}

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
