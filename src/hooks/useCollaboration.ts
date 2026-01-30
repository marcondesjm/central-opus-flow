import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export type CollaborationRole = 'viewer' | 'editor' | 'admin';

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  invited_by: string;
  role: CollaborationRole;
  invited_email: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

export interface AccountCollaborator {
  id: string;
  account_id: string;
  user_id: string;
  invited_by: string;
  role: CollaborationRole;
  invited_email: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
}

export interface CollaborationNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string;
  entity_id: string;
  actor_id: string | null;
  actor_name: string | null;
  read_at: string | null;
  created_at: string;
}

export interface PresenceState {
  [key: string]: {
    user_id: string;
    user_name: string;
    avatar_url: string | null;
    online_at: string;
    viewing_project?: string;
  }[];
}

export function useCollaboration() {
  const { user } = useAuth();
  const [projectCollaborators, setProjectCollaborators] = useState<ProjectCollaborator[]>([]);
  const [accountCollaborators, setAccountCollaborators] = useState<AccountCollaborator[]>([]);
  const [notifications, setNotifications] = useState<CollaborationNotification[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<(ProjectCollaborator | AccountCollaborator)[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch project collaborators with profiles
  const fetchProjectCollaborators = useCallback(async (projectId: string) => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('project_collaborators')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching project collaborators:', error);
      return [];
    }

    // Fetch profiles for collaborators
    const collaboratorsWithProfiles = await Promise.all(
      (data || []).map(async (collab) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, email')
          .eq('email', collab.invited_email)
          .maybeSingle();
        
        return {
          ...collab,
          profile: profile || undefined
        } as ProjectCollaborator;
      })
    );
    
    return collaboratorsWithProfiles;
  }, [user]);

  // Fetch account collaborators
  const fetchAccountCollaborators = useCallback(async (accountId: string) => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('account_collaborators')
      .select('*')
      .eq('account_id', accountId);
    
    if (error) {
      console.error('Error fetching account collaborators:', error);
      return [];
    }
    
    return data as AccountCollaborator[];
  }, [user]);

  // Fetch pending invitations for current user
  const fetchPendingInvitations = useCallback(async () => {
    if (!user?.email) return;
    
    const [projectInvites, accountInvites] = await Promise.all([
      supabase
        .from('project_collaborators')
        .select('*')
        .eq('invited_email', user.email)
        .is('accepted_at', null),
      supabase
        .from('account_collaborators')
        .select('*')
        .eq('invited_email', user.email)
        .is('accepted_at', null)
    ]);

    const invitations: (ProjectCollaborator | AccountCollaborator)[] = [];
    
    if (projectInvites.data) {
      invitations.push(...(projectInvites.data as ProjectCollaborator[]));
    }
    if (accountInvites.data) {
      invitations.push(...(accountInvites.data as AccountCollaborator[]));
    }
    
    setPendingInvitations(invitations);
  }, [user?.email]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('collaboration_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    
    setNotifications(data as CollaborationNotification[]);
  }, [user]);

  // Invite to project
  const inviteToProject = async (projectId: string, email: string, role: CollaborationRole = 'viewer', projectName?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('email', email)
      .maybeSingle();

    const { error } = await supabase
      .from('project_collaborators')
      .insert({
        project_id: projectId,
        user_id: existingUser?.user_id || '00000000-0000-0000-0000-000000000000',
        invited_by: user.id,
        invited_email: email,
        role
      });
    
    if (error) {
      console.error('Error inviting to project:', error);
      if (error.code === '23505') {
        return { success: false, error: 'Este usuário já foi convidado' };
      }
      return { success: false, error: error.message };
    }

    // Create notification for invited user if they exist
    if (existingUser?.user_id) {
      await createNotification(
        existingUser.user_id,
        'project_invitation',
        'Convite para projeto',
        `Você foi convidado para colaborar no projeto "${projectName || 'Sem nome'}"`,
        'project',
        projectId
      );
    }
    
    toast.success('Convite enviado com sucesso!');
    return { success: true };
  };

  // Invite to account
  const inviteToAccount = async (accountId: string, email: string, role: CollaborationRole = 'viewer') => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();

    const { error } = await supabase
      .from('account_collaborators')
      .insert({
        account_id: accountId,
        user_id: existingUser?.user_id || '00000000-0000-0000-0000-000000000000',
        invited_by: user.id,
        invited_email: email,
        role
      });
    
    if (error) {
      console.error('Error inviting to account:', error);
      if (error.code === '23505') {
        return { success: false, error: 'Este usuário já foi convidado' };
      }
      return { success: false, error: error.message };
    }

    // Create notification for invited user if they exist
    if (existingUser?.user_id) {
      await createNotification(
        existingUser.user_id,
        'account_invitation',
        'Convite para conta',
        `Você foi convidado para colaborar em uma conta Lovable`,
        'account',
        accountId
      );
    }
    
    toast.success('Convite enviado com sucesso!');
    return { success: true };
  };

  // Accept project invitation
  const acceptProjectInvitation = async (invitationId: string) => {
    if (!user) return { success: false };
    
    const { error } = await supabase
      .from('project_collaborators')
      .update({ 
        accepted_at: new Date().toISOString(),
        user_id: user.id 
      })
      .eq('id', invitationId);
    
    if (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Erro ao aceitar convite');
      return { success: false };
    }
    
    toast.success('Convite aceito!');
    await fetchPendingInvitations();
    return { success: true };
  };

  // Accept account invitation
  const acceptAccountInvitation = async (invitationId: string) => {
    if (!user) return { success: false };
    
    const { error } = await supabase
      .from('account_collaborators')
      .update({ 
        accepted_at: new Date().toISOString(),
        user_id: user.id 
      })
      .eq('id', invitationId);
    
    if (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Erro ao aceitar convite');
      return { success: false };
    }
    
    toast.success('Convite aceito!');
    await fetchPendingInvitations();
    return { success: true };
  };

  // Remove collaborator from project
  const removeProjectCollaborator = async (collaboratorId: string) => {
    const { error } = await supabase
      .from('project_collaborators')
      .delete()
      .eq('id', collaboratorId);
    
    if (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Erro ao remover colaborador');
      return { success: false };
    }
    
    toast.success('Colaborador removido');
    return { success: true };
  };

  // Remove collaborator from account
  const removeAccountCollaborator = async (collaboratorId: string) => {
    const { error } = await supabase
      .from('account_collaborators')
      .delete()
      .eq('id', collaboratorId);
    
    if (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Erro ao remover colaborador');
      return { success: false };
    }
    
    toast.success('Colaborador removido');
    return { success: true };
  };

  // Update collaborator role
  const updateProjectCollaboratorRole = async (collaboratorId: string, role: CollaborationRole) => {
    const { error } = await supabase
      .from('project_collaborators')
      .update({ role })
      .eq('id', collaboratorId);
    
    if (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar permissão');
      return { success: false };
    }
    
    toast.success('Permissão atualizada');
    return { success: true };
  };

  // Update account collaborator role
  const updateAccountCollaboratorRole = async (collaboratorId: string, role: CollaborationRole) => {
    const { error } = await supabase
      .from('account_collaborators')
      .update({ role })
      .eq('id', collaboratorId);
    
    if (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar permissão');
      return { success: false };
    }
    
    toast.success('Permissão atualizada');
    return { success: true };
  };

  // Create notification
  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    entityType: string,
    entityId: string
  ) => {
    const { error } = await supabase
      .from('collaboration_notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        entity_type: entityType,
        entity_id: entityId,
        actor_id: user?.id,
        actor_name: user?.email
      });
    
    if (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('collaboration_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('collaboration_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }
    
    setNotifications(prev => 
      prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        fetchPendingInvitations(),
        fetchNotifications()
      ]).finally(() => setLoading(false));
    }
  }, [user, fetchPendingInvitations, fetchNotifications]);

  // Setup realtime subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('collaboration-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as CollaborationNotification;
          setNotifications(prev => [newNotification, ...prev]);
          toast.info(newNotification.title, {
            description: newNotification.message
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadNotificationsCount = notifications.filter(n => !n.read_at).length;

  return {
    projectCollaborators,
    accountCollaborators,
    notifications,
    unreadNotificationsCount,
    pendingInvitations,
    loading,
    fetchProjectCollaborators,
    fetchAccountCollaborators,
    inviteToProject,
    inviteToAccount,
    acceptProjectInvitation,
    acceptAccountInvitation,
    removeProjectCollaborator,
    removeAccountCollaborator,
    updateProjectCollaboratorRole,
    updateAccountCollaboratorRole,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    createNotification
  };
}
