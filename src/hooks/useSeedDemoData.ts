import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const demoAccount = {
  name: 'Conta Demonstração',
  email: 'demo@exemplo.com',
  color: 'blue' as const,
  credits: 100,
};

const demoProjects = [
  {
    name: 'E-commerce Fashion Store',
    description: 'Loja virtual completa com carrinho, checkout e integração de pagamentos',
    url: 'https://fashion-store.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    status: 'published',
    type: 'website',
    progress: 100,
    is_favorite: true,
    notes: 'Projeto exemplo para demonstrar funcionalidades do painel.',
    view_count: 245,
    deadline: null,
  },
  {
    name: 'Landing Page Startup',
    description: 'Página de captura com formulário e integração de email marketing',
    url: 'https://startup-landing.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    status: 'published',
    type: 'landing',
    progress: 100,
    is_favorite: false,
    view_count: 189,
    deadline: null,
  },
  {
    name: 'Dashboard Analytics',
    description: 'Painel administrativo com gráficos e relatórios em tempo real',
    url: 'https://analytics-dash.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    status: 'draft',
    type: 'app',
    progress: 65,
    is_favorite: false,
    notes: 'Em desenvolvimento - falta integrar API de dados.',
    view_count: 67,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: 'Funil de Vendas Curso',
    description: 'Funil completo com VSL, página de vendas e checkout',
    url: 'https://curso-digital.lovable.app',
    screenshot: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=450&fit=crop',
    status: 'draft',
    type: 'funnel',
    progress: 40,
    is_favorite: false,
    notes: 'Precisa finalizar urgente!',
    view_count: 1024,
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const demoTags = [
  { name: 'E-commerce', color: 'blue' },
  { name: 'Landing Page', color: 'emerald' },
  { name: 'Dashboard', color: 'violet' },
  { name: 'SaaS', color: 'amber' },
];

export function useSeedDemoData() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const seedDemoData = useCallback(async () => {
    if (!user?.id) return false;
    
    setSeeding(true);
    
    try {
      // Check if user already has projects (not just accounts)
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingProjects && existingProjects.length > 0) {
        console.log('User already has projects, skipping seed');
        setSeeding(false);
        return false;
      }

      // Check if demo account exists, if not create it
      let accountId: string;
      const { data: existingDemoAccount } = await supabase
        .from('lovable_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Conta Demonstração')
        .maybeSingle();

      if (existingDemoAccount) {
        accountId = existingDemoAccount.id;
        console.log('Demo account exists, using it:', accountId);
      } else {
        // Create demo account
        const { data: account, error: accountError } = await supabase
          .from('lovable_accounts')
          .insert({
            ...demoAccount,
            user_id: user.id,
          })
          .select()
          .single();

        if (accountError) {
          console.error('Error creating demo account:', accountError);
          throw accountError;
        }
        accountId = account.id;
        console.log('Created demo account:', accountId);
      }

      // Create demo tags (if not exist)
      const { data: existingTags } = await supabase
        .from('tags')
        .select('id, name')
        .eq('user_id', user.id)
        .in('name', demoTags.map(t => t.name));

      const existingTagNames = existingTags?.map(t => t.name) || [];
      const newTags = demoTags.filter(t => !existingTagNames.includes(t.name));

      let allTags = existingTags || [];

      if (newTags.length > 0) {
        const { data: createdTags, error: tagsError } = await supabase
          .from('tags')
          .insert(newTags.map(tag => ({
            ...tag,
            user_id: user.id,
          })))
          .select();

        if (tagsError) {
          console.error('Error creating tags:', tagsError);
          // Continue without tags if there's an error
        } else if (createdTags) {
          allTags = [...allTags, ...createdTags];
        }
      }

      // Create demo projects
      const projectsToInsert = demoProjects.map(project => ({
        ...project,
        user_id: user.id,
        account_id: accountId,
      }));

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .insert(projectsToInsert)
        .select();

      if (projectsError) {
        console.error('Error creating projects:', projectsError);
        throw projectsError;
      }

      console.log('Created projects:', projects?.length);

      // Link tags to projects
      if (projects && allTags.length > 0) {
        const tagsByName: Record<string, { id: string }> = {};
        allTags.forEach(t => {
          tagsByName[t.name] = t;
        });

        const projectTagLinks = [
          { project: projects[0], tagNames: ['E-commerce', 'SaaS'] },
          { project: projects[1], tagNames: ['Landing Page'] },
          { project: projects[2], tagNames: ['Dashboard', 'SaaS'] },
          { project: projects[3], tagNames: ['Landing Page'] },
        ];

        for (const link of projectTagLinks) {
          if (link.project) {
            const validTagIds = link.tagNames
              .filter(name => tagsByName[name])
              .map(name => tagsByName[name].id);

            if (validTagIds.length > 0) {
              await supabase
                .from('project_tags')
                .insert(
                  validTagIds.map(tagId => ({
                    project_id: link.project.id,
                    tag_id: tagId,
                  }))
                );
            }
          }
        }
      }

      console.log('Demo data seeded successfully');
      toast.success('Projetos de demonstração criados!', {
        description: '4 projetos de exemplo foram adicionados ao seu painel.'
      });
      setSeeding(false);
      return true;
    } catch (error) {
      console.error('Error seeding demo data:', error);
      toast.error('Erro ao criar projetos de demonstração');
      setSeeding(false);
      return false;
    }
  }, [user?.id]);

  const clearDemoData = useCallback(async () => {
    if (!user?.id) return false;
    
    setClearing(true);
    
    try {
      // Find demo account
      const { data: demoAccountData } = await supabase
        .from('lovable_accounts')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Conta Demonstração')
        .maybeSingle();

      if (demoAccountData) {
        // Delete projects from demo account
        await supabase
          .from('projects')
          .delete()
          .eq('account_id', demoAccountData.id);

        // Delete the demo account
        await supabase
          .from('lovable_accounts')
          .delete()
          .eq('id', demoAccountData.id);
      }

      // Delete demo tags
      const demoTagNames = demoTags.map(t => t.name);
      await supabase
        .from('tags')
        .delete()
        .eq('user_id', user.id)
        .in('name', demoTagNames);

      console.log('Demo data cleared successfully');
      toast.success('Dados de demonstração removidos');
      setClearing(false);
      return true;
    } catch (error) {
      console.error('Error clearing demo data:', error);
      toast.error('Erro ao remover dados de demonstração');
      setClearing(false);
      return false;
    }
  }, [user?.id]);

  const hasDemoAccount = useCallback(async () => {
    if (!user?.id) return false;
    
    const { data } = await supabase
      .from('lovable_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Conta Demonstração')
      .maybeSingle();
    
    return !!data;
  }, [user?.id]);

  const hasDemoProjects = useCallback(async () => {
    if (!user?.id) return false;
    
    const { data: demoAccountData } = await supabase
      .from('lovable_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Conta Demonstração')
      .maybeSingle();
    
    if (!demoAccountData) return false;

    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('account_id', demoAccountData.id)
      .limit(1);
    
    return projects && projects.length > 0;
  }, [user?.id]);

  return {
    seedDemoData,
    clearDemoData,
    hasDemoAccount,
    hasDemoProjects,
    seeding,
    clearing,
  };
}
