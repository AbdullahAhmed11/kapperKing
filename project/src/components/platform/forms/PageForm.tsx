import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Markdown } from '@/components/ui/markdown';
import { FullPageData } from '@/lib/pageStore'; 

// Schema without slug
const pageSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['page', 'blog', 'landing']),
  content: z.string().min(1, 'Content cannot be empty'),
  status: z.enum(['published', 'draft']),
  meta: z.object({ 
    description: z.string().optional(),
    keywords: z.string().optional()
  }) 
});

type PageFormData = z.infer<typeof pageSchema>;

interface PageFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PageFormData) => Promise<void>; 
  initialData?: FullPageData | null;
  title?: string;
}

export function PageForm({ open, onClose, onSubmit, initialData, title = 'Add Page' }: PageFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control } = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: { 
      title: '', type: 'page', content: '', status: 'draft', 
      meta: { description: '', keywords: '' }, 
    }
  });

  const watchedContent = useWatch({ control, name: 'content' });

  // Reset form 
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title,
          type: initialData.type,
          content: initialData.content,
          status: initialData.status,
          meta: { 
            description: initialData.meta?.description || '',
            keywords: initialData.meta?.keywords || ''
          },
        });
      } else {
        reset({ 
          title: '', type: 'page', content: '', status: 'draft', 
          meta: { description: '', keywords: '' } 
        });
      }
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = async (data: PageFormData) => {
    // Re-add meta object before submitting
     const submitData = { 
      ...data, 
      meta: {
        description: data.meta?.description || '',
        keywords: data.meta?.keywords || ''
      }
    };
    await onSubmit(submitData); 
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 sm:rounded-lg"> 
        <DialogHeader className="p-6 border-b bg-gray-50 rounded-t-lg">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            Manage page details and content. Use Markdown for formatting.
          </DialogDescription>
        </DialogHeader>
        <form id="pageFormStyled" onSubmit={handleSubmit(handleFormSubmit)} className="flex-grow overflow-hidden bg-slate-100"> 
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full overflow-hidden"> 
            
            {/* Left Column: Settings */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto p-6 bg-white border-r"> 
              {/* Page Details Section */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Page Details</h3>
                 <div>
                    <Label htmlFor="title" className="font-medium text-gray-700">Page Title</Label>
                    <Input id="title" {...register('title')} className="mt-1 focus:ring-primary focus:border-primary" />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                 </div>
                 <div>
                    <Label htmlFor="type" className="font-medium text-gray-700">Page Type</Label>
                    <select id="type" {...register('type')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                      <option value="page">Standard Page</option>
                      <option value="blog">Blog Post</option>
                      <option value="landing">Landing Page</option>
                    </select>
                 </div>
                 <div>
                    <Label htmlFor="status" className="font-medium text-gray-700">Status</Label>
                    <select id="status" {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                 </div>
              </div>

              {/* SEO Settings Section */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">SEO Settings</h3>
                <div className="pt-2">
                  <Label htmlFor="meta.description" className="text-gray-700">Meta Description</Label>
                  <textarea id="meta.description" {...register('meta.description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                <div>
                  <Label htmlFor="meta.keywords" className="text-gray-700">Meta Keywords</Label>
                  <Input id="meta.keywords" {...register('meta.keywords')} className="mt-1 focus:ring-primary focus:border-primary" placeholder="keyword1, keyword2" />
                </div>
              </div>
            </div>

            {/* Right Column: Content Editor & Preview */}
            <div className="lg:col-span-2 flex flex-col overflow-hidden p-6 space-y-6"> 
              {/* Content Editor Section */}
              <div className="flex-grow flex flex-col p-4 border rounded-lg bg-white shadow-sm">
                <Label htmlFor="content" className="font-semibold text-gray-800 mb-2">Content (Markdown)</Label>
                <textarea
                  id="content"
                  {...register('content')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono flex-grow min-h-[150px]" 
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
              </div>

              {/* Live Preview Section */}
              <div className="flex-grow flex flex-col p-4 border rounded-lg bg-white shadow-sm min-h-[200px]"> 
                <h3 className="text-base font-semibold text-gray-800 mb-2 flex-shrink-0 border-b pb-2">Live Preview</h3>
                <div className="prose prose-lg max-w-none overflow-y-auto flex-grow pt-2"> 
                  <Markdown content={watchedContent || ''} />
                </div>
              </div>
            </div>
          </div>
        </form>
        <DialogFooter className="p-4 px-6 border-t bg-gray-100 rounded-b-lg">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {/* Use dashboard primary color for save button */}
            <Button type="submit" form="pageFormStyled" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-white"> 
              {isSubmitting ? 'Saving...' : 'Save Page'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}