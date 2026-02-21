import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Eye, EyeOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useAdminBlogPosts,
  useBlogCategories,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useCreateBlogCategory,
  useDeleteBlogCategory,
  uploadBlogImage,
  getBlogImageUrl,
  type BlogPost,
} from '@/hooks/useBlog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

const LOCALES = [
  { value: 'pt', label: '🇧🇷 Português' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'de', label: '🇩🇪 Deutsch' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function BlogManager() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: posts, isLoading } = useAdminBlogPosts();
  const { data: categories } = useBlogCategories();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const createCategory = useCreateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();

  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('blue');
  const [uploading, setUploading] = useState(false);

  // Post form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category_id: '',
    locale: 'pt',
    tags: '',
    is_published: false,
  });

  const resetForm = () => {
    setForm({ title: '', slug: '', excerpt: '', content: '', cover_image: '', category_id: '', locale: 'pt', tags: '', is_published: false });
    setEditingPost(null);
    setIsCreating(false);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      cover_image: post.cover_image || '',
      category_id: post.category_id || '',
      locale: post.locale,
      tags: post.tags?.join(', ') || '',
      is_published: post.is_published,
    });
    setIsCreating(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : slugify(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data, error } = await uploadBlogImage(file);
      if (error) throw error;
      const url = getBlogImageUrl(data.path);
      setForm(prev => ({ ...prev, cover_image: url }));
      toast.success(t('blog.imageUploaded'));
    } catch {
      toast.error(t('blog.imageUploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error(t('blog.fillRequired'));
      return;
    }

    const tagsArray = form.tags.split(',').map(s => s.trim()).filter(Boolean);
    const postData = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image: form.cover_image || null,
      category_id: form.category_id || null,
      locale: form.locale,
      tags: tagsArray,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
      author_id: user?.id || '',
    };

    try {
      if (editingPost) {
        await updatePost.mutateAsync({ id: editingPost.id, ...postData });
        toast.success(t('blog.postUpdated'));
      } else {
        await createPost.mutateAsync(postData as any);
        toast.success(t('blog.postCreated'));
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || t('blog.saveError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('blog.confirmDelete'))) return;
    try {
      await deletePost.mutateAsync(id);
      toast.success(t('blog.postDeleted'));
    } catch {
      toast.error(t('blog.deleteError'));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    try {
      await createCategory.mutateAsync({ name: newCatName, slug: slugify(newCatName), color: newCatColor });
      toast.success(t('blog.categoryCreated'));
      setNewCatName('');
      setShowCategoryDialog(false);
    } catch {
      toast.error(t('blog.categoryError'));
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingPost ? t('blog.editPost') : t('blog.newPost')}
          </h3>
          <Button variant="ghost" onClick={resetForm}>{t('common.cancel')}</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('blog.postTitle')}</Label>
            <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('blog.category')}</Label>
            <Select value={form.category_id} onValueChange={v => setForm(prev => ({ ...prev, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder={t('blog.selectCategory')} /></SelectTrigger>
              <SelectContent>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('blog.language')}</Label>
            <Select value={form.locale} onValueChange={v => setForm(prev => ({ ...prev, locale: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LOCALES.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags ({t('blog.commaSeparated')})</Label>
            <Input value={form.tags} onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="lovable, tutorial, dicas" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('blog.excerpt')}</Label>
          <Textarea value={form.excerpt} onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))} rows={2} />
        </div>

        <div className="space-y-2">
          <Label>{t('blog.coverImage')}</Label>
          <div className="flex gap-3 items-center">
            <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {form.cover_image && (
              <img src={form.cover_image} alt="cover" className="w-20 h-12 object-cover rounded" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('blog.content')} (HTML)</Label>
          <Textarea value={form.content} onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))} rows={15} className="font-mono text-sm" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={form.is_published} onCheckedChange={v => setForm(prev => ({ ...prev, is_published: v }))} />
            <Label>{t('blog.publish')}</Label>
          </div>
          <Button onClick={handleSave} disabled={createPost.isPending || updatePost.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('blog.manageBlog')}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCategoryDialog(true)}>
            {t('blog.manageCategories')}
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" />
            {t('blog.newPost')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : (
        <div className="space-y-3">
          {posts?.map(post => (
            <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
              {post.cover_image && (
                <img src={post.cover_image} alt="" className="w-16 h-10 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{post.title}</p>
                  <Badge variant={post.is_published ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {post.is_published ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {post.is_published ? t('blog.published') : t('blog.draft')}
                  </Badge>
                  <Badge variant="outline" className="text-xs shrink-0">
                    <Globe className="w-3 h-3 mr-1" />
                    {post.locale.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(post.created_at), 'dd/MM/yyyy')}
                  {post.blog_categories && ` • ${(post.blog_categories as any).name}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {posts?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">{t('blog.noPosts')}</p>
          )}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('blog.manageCategories')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder={t('blog.categoryName')} />
              <Button onClick={handleCreateCategory} disabled={!newCatName}>{t('common.save')}</Button>
            </div>
            <div className="space-y-2">
              {categories?.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded border border-border">
                  <span>{cat.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(cat.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
