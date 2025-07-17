import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Globe, FileText, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PageForm } from '@/components/platform/forms/PageForm';
import { usePageStore, PageData, FullPageData } from '@/lib/pageStore';
import { useThemeStore } from '@/lib/theme'; // Import theme store
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
interface MyJwtPayload {
      Id?: string;
      Role?: string;
      [key: string]: any;
    }
function WebsiteManagement() { // Correct component name

      const navigate = useNavigate()
      const token = Cookies.get('salonUser');
      const decoded: MyJwtPayload | undefined = token ? jwtDecode<MyJwtPayload>(token) : undefined;
  
      useEffect(() => {
        if (!decoded?.Id || (decoded?.Role !== "SuperAdmin" && decoded?.Role !== "Admin")) {
          navigate('/login')
        }
      },[])
      
  const [showNewPage, setShowNewPage] = useState(false);
  const [showEditPage, setShowEditPage] = useState(false);
  const [selectedPageData, setSelectedPageData] = useState<FullPageData | null>(null); // Store full data for editing
  const [searchTerm, setSearchTerm] = useState('');

  const { pages,  deletePage, pageContents, fetchPages, addPage , updatePage } = usePageStore();
  const { dashboardButtonTextColor } = useThemeStore((state) => state.currentTheme); // Get text color
  // TODO: Add addPage function to store and here
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleNewPageSubmit = async (data: any) => {
    try {
      await addPage({
        title: data.title,
        description: data.meta?.description || '',
        keywords: data.meta?.keywords || '',
        content: data.content,
        name: data.title.toLowerCase().replace(/\s+/g, '-'),
        type: data.type === 'landing' ? 'Landing_Page' : data.type === 'blog' ? 'Blog_Page' : 'Content_Page',
        status: data.status === 'published' ? 'Published' : 'Draft'
      });
      
      toast.success('Page created successfully');
      setShowNewPage(false);
      fetchPages();
    } catch (error) {
      toast.error('Failed to create page');
      console.error('Error creating page:', error);
    }
  };

  const handleEditPageSubmit = async (data: any) => {
    if (!selectedPageData) return;
  
    try {
      await updatePage(selectedPageData.id, {
        ...data,
        meta: {
          description: data.meta?.description || '',
          keywords: data.meta?.keywords || ''
        }
      });
  
      toast.success('Page updated successfully');
      setShowEditPage(false);
      setSelectedPageData(null);
      fetchPages(); // Refresh the page list
    } catch (error) {
      toast.error('Failed to update page');
      console.error('Error updating page:', error);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await deletePage(pageId);
      toast.success('Page deleted successfully');
      fetchPages(); // Refresh the list after deletion
    } catch (error) {
      toast.error('Failed to delete page');
      console.error('Delete error:', error);
    }
  };

  // TODO: Implement filtering based on searchTerm and dropdowns
  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Website Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage website content and pages</p>
        </div>
        <Button
          onClick={() => setShowNewPage(true)}
          style={{ color: dashboardButtonTextColor || '#FFFFFF' }} // Apply text color
        >
          <Plus className="h-4 w-4 mr-2" />
          New Page
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-4">
          {/* TODO: Implement filter logic */}
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Types</option>
            <option>Page</option>
            <option>Blog</option>
            <option>Landing</option>
          </select>
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page: PageData) => ( // Use PageData type here
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-lg ${
                        page.type === 'landing' ? 'bg-purple-100' :
                        page.type === 'blog' ? 'bg-blue-100' : 'bg-gray-100'
                      } flex items-center justify-center`}>
                        {page.type === 'landing' ? (
                          <Globe className="h-4 w-4 text-purple-600" />
                        ) : page.type === 'blog' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">{page.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      page.type === 'landing' ? 'bg-purple-100 text-purple-800' :
                      page.type === 'blog' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {page.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-4 w-4 mr-1" />
                        {page.stats?.views?.toLocaleString() ?? '-'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Globe className="h-4 w-4 mr-1" />
                        {page.stats?.conversions?.toLocaleString() ?? '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {page.lastModified}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Combine page metadata with content from the store state
                          const contentData = pageContents[page.id];
                          const fullData: FullPageData = {
                            ...page,
                            content: contentData?.content ?? null,
                            meta: {
                              description: contentData?.meta?.description ?? null,
                              keywords: contentData?.meta?.keywords ?? null
                            }
                          };
                          setSelectedPageData(fullData);
                          setShowEditPage(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms */}
      <PageForm
        open={showNewPage}
        onClose={() => setShowNewPage(false)}
        onSubmit={handleNewPageSubmit}
      />

      {/* Add a key prop based on the selected page ID */}
      {/* This forces React to mount a new instance when the selected page changes */}
      
      <PageForm
        key={selectedPageData?.id || 'edit-form'} // Use page ID as key, fallback if null
        open={showEditPage}
        onClose={() => {
          setShowEditPage(false);
          setSelectedPageData(null);
        }}
        onSubmit={handleEditPageSubmit}
        initialData={selectedPageData} // Pass full page data including content
        title="Edit Page"
      />
    </div>
  );
}

export default WebsiteManagement;