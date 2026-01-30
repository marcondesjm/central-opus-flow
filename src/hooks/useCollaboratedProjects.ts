import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Project, Tag } from './useProjects';

export interface CollaboratedProject extends Project {
  collaboration_type: 'project' | 'account';
  role: 'viewer' | 'editor' | 'admin';
  owner_email?: string;
}

export function useCollaboratedProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collaborated-projects', user?.id],
    queryFn: async (): Promise<CollaboratedProject[]> => {
      if (!user) return [];

      const collaboratedProjects: CollaboratedProject[] = [];

      // Get projects where user is a direct collaborator
      const { data: projectCollabs } = await supabase
        .from('project_collaborators')
        .select(`
          project_id,
          role,
          accepted_at
        `)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null);

      if (projectCollabs && projectCollabs.length > 0) {
        const projectIds = projectCollabs.map(pc => pc.project_id);
        
        const { data: projects } = await supabase
          .from('projects')
          .select(`
            *,
            project_tags (
              tag_id,
              tags (*)
            )
          `)
          .in('id', projectIds);

        if (projects) {
          for (const project of projects) {
            const collab = projectCollabs.find(pc => pc.project_id === project.id);
            
            // Get owner email
            const { data: ownerProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('user_id', project.user_id)
              .maybeSingle();

            collaboratedProjects.push({
              ...project,
              tags: project.project_tags?.map((pt: any) => pt.tags) || [],
              collaboration_type: 'project',
              role: collab?.role || 'viewer',
              owner_email: ownerProfile?.email,
            } as CollaboratedProject);
          }
        }
      }

      // Get projects from accounts where user is a collaborator
      const { data: accountCollabs } = await supabase
        .from('account_collaborators')
        .select(`
          account_id,
          role,
          accepted_at
        `)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null);

      if (accountCollabs && accountCollabs.length > 0) {
        const accountIds = accountCollabs.map(ac => ac.account_id);
        
        const { data: accountProjects } = await supabase
          .from('projects')
          .select(`
            *,
            project_tags (
              tag_id,
              tags (*)
            )
          `)
          .in('account_id', accountIds);

        if (accountProjects) {
          for (const project of accountProjects) {
            // Skip if already added as project collaborator
            if (collaboratedProjects.some(cp => cp.id === project.id)) continue;
            
            const collab = accountCollabs.find(ac => ac.account_id === project.account_id);
            
            // Get owner email
            const { data: ownerProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('user_id', project.user_id)
              .maybeSingle();

            collaboratedProjects.push({
              ...project,
              tags: project.project_tags?.map((pt: any) => pt.tags) || [],
              collaboration_type: 'account',
              role: collab?.role || 'viewer',
              owner_email: ownerProfile?.email,
            } as CollaboratedProject);
          }
        }
      }

      return collaboratedProjects;
    },
    enabled: !!user,
  });
}
