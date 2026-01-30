import { useState, useEffect, useCallback } from 'react';

export interface ProjectKeys {
  supabase_url?: string;
  anon_key?: string;
  service_role_key?: string;
  openai_key?: string;
  stripe_key?: string;
  resend_key?: string;
  notes?: string;
  custom_keys?: { name: string; value: string }[];
}

const PROJECT_KEYS_STORAGE_KEY = 'lovable_project_keys';

// Funções para gerenciar keys de projetos localmente no navegador
export function getProjectKeys(): Record<string, ProjectKeys> {
  try {
    const stored = localStorage.getItem(PROJECT_KEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getProjectLocalKeys(projectId: string): ProjectKeys {
  const allKeys = getProjectKeys();
  return allKeys[projectId] || {};
}

export function saveProjectLocalKeys(projectId: string, keys: ProjectKeys): void {
  const allKeys = getProjectKeys();
  allKeys[projectId] = keys;
  localStorage.setItem(PROJECT_KEYS_STORAGE_KEY, JSON.stringify(allKeys));
}

export function deleteProjectLocalKeys(projectId: string): void {
  const allKeys = getProjectKeys();
  delete allKeys[projectId];
  localStorage.setItem(PROJECT_KEYS_STORAGE_KEY, JSON.stringify(allKeys));
}

export function clearAllProjectKeys(): void {
  localStorage.removeItem(PROJECT_KEYS_STORAGE_KEY);
}

// Exportar todas as keys como JSON
export function exportProjectKeys(): string {
  const allKeys = getProjectKeys();
  return JSON.stringify(allKeys, null, 2);
}

// Importar keys de um JSON
export function importProjectKeys(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, count: 0, error: 'Formato inválido' };
    }
    
    const existingKeys = getProjectKeys();
    const mergedKeys = { ...existingKeys, ...parsed };
    localStorage.setItem(PROJECT_KEYS_STORAGE_KEY, JSON.stringify(mergedKeys));
    
    return { success: true, count: Object.keys(parsed).length };
  } catch (e) {
    return { success: false, count: 0, error: 'JSON inválido' };
  }
}

// Hook para usar keys locais de um projeto específico
export function useProjectKeys(projectId: string | null) {
  const [keys, setKeys] = useState<ProjectKeys>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (projectId) {
      setKeys(getProjectLocalKeys(projectId));
    } else {
      setKeys({});
    }
    setIsLoaded(true);
  }, [projectId]);

  const saveKeys = useCallback((newKeys: ProjectKeys) => {
    if (!projectId) return;
    saveProjectLocalKeys(projectId, newKeys);
    setKeys(newKeys);
  }, [projectId]);

  const deleteKeys = useCallback(() => {
    if (!projectId) return;
    deleteProjectLocalKeys(projectId);
    setKeys({});
  }, [projectId]);

  const hasKeys = useCallback(() => {
    return !!(
      keys.supabase_url || 
      keys.anon_key || 
      keys.service_role_key || 
      keys.openai_key ||
      keys.stripe_key ||
      keys.resend_key ||
      (keys.custom_keys && keys.custom_keys.length > 0)
    );
  }, [keys]);

  return {
    keys,
    isLoaded,
    saveKeys,
    deleteKeys,
    hasKeys,
  };
}
