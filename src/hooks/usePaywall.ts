import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { useProjects } from './useProjects';

export type PaywallTrigger = 'revision_limit' | 'project_limit' | 'pro_send' | 'generic';

interface PaywallState {
  isOpen: boolean;
  trigger: PaywallTrigger;
}

const triggerMessages: Record<PaywallTrigger, { title: string; description: string }> = {
  revision_limit: {
    title: 'Você atingiu o limite de revisões',
    description: 'Evite retrabalho e organize melhor seus projetos com o plano Pro.',
  },
  project_limit: {
    title: 'Você atingiu o limite de projetos',
    description: 'Para continuar criando projetos ilimitados, faça upgrade.',
  },
  pro_send: {
    title: 'Envie de forma profissional',
    description: 'Controle de revisões, histórico de versões e experiência limpa para o cliente.',
  },
  generic: {
    title: 'Trabalhe como um profissional',
    description: 'Evite revisões infinitas, organize feedback e entregue projetos mais rápido.',
  },
};

export function usePaywall() {
  const { data: subscription } = useSubscription();
  const { data: projects = [] } = useProjects();
  const [paywallState, setPaywallState] = useState<PaywallState>({ isOpen: false, trigger: 'generic' });

  const isPro = subscription?.plan === 'pro' || subscription?.plan === 'business';
  const isFree = !isPro;

  const FREE_PROJECT_LIMIT = 2;
  const FREE_REVISION_LIMIT = 3;

  const projectCount = projects.length;
  const canCreateProject = isPro || projectCount < FREE_PROJECT_LIMIT;

  const openPaywall = useCallback((trigger: PaywallTrigger) => {
    setPaywallState({ isOpen: true, trigger });
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallState({ isOpen: false, trigger: 'generic' });
  }, []);

  // Check if user can add revision to a project
  const canAddRevision = useCallback((currentRevisions: number) => {
    if (isPro) return true;
    return currentRevisions < FREE_REVISION_LIMIT;
  }, [isPro]);

  // Check and trigger paywall for project creation
  const checkProjectLimit = useCallback(() => {
    if (!canCreateProject) {
      openPaywall('project_limit');
      return false;
    }
    return true;
  }, [canCreateProject, openPaywall]);

  // Check and trigger paywall for revision limit
  const checkRevisionLimit = useCallback((currentRevisions: number) => {
    if (!canAddRevision(currentRevisions)) {
      openPaywall('revision_limit');
      return false;
    }
    return true;
  }, [canAddRevision, openPaywall]);

  // Check paywall for pro send feature
  const checkProSend = useCallback(() => {
    if (isFree) {
      openPaywall('pro_send');
      return false;
    }
    return true;
  }, [isFree, openPaywall]);

  const triggerMessage = triggerMessages[paywallState.trigger];

  return {
    isPro,
    isFree,
    canCreateProject,
    canAddRevision,
    checkProjectLimit,
    checkRevisionLimit,
    checkProSend,
    paywallOpen: paywallState.isOpen,
    paywallTrigger: paywallState.trigger,
    triggerMessage,
    openPaywall,
    closePaywall,
    FREE_PROJECT_LIMIT,
    FREE_REVISION_LIMIT,
  };
}
