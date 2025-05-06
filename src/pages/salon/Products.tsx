import React, { useState, useEffect } from 'react';
import { useProductStore, Product } from '@/lib/store/products';
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Already imported
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Added Label import back if needed elsewhere, though not used in final version below
import { Plus, Search, Edit2, Trash2, Package, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Assuming utils exists
import { ProductForm } from '@/components/salon/forms/ProductForm'; // Import ProductForm
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // For form modal

export default function ProductsPage() {
  // Get loading/error state for salon context
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  // Removed duplicate declaration below
  const { products, loading, error, fetchProducts, deleteProduct } = useProductStore();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch products only when salon context is loaded and valid
  useEffect(() => {
    if (currentSalon?.id && !salonLoading && !salonError) {
      fetchProducts(currentSalon.id);
    }
  }, [currentSalon?.id, salonLoading, salonError, fetchProducts]); // Add dependencies

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
      // List should refresh automatically due to store update
    }
  };

  const filteredProducts = products.filter(p =>
     p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Logic ---

  // Show loading state if salon context or products are loading
  if (salonLoading || loading) {
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Show error if salon context failed to load
  if (salonError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading salon context: {salonError}</div>;
  }

  // Show message if no salon is associated after loading
  if (!currentSalon) {
     return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
  }

  // --- Render Page Content (only if salon context is loaded) ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products for {currentSalon.name}</h1> {/* Show salon name */}
          <p className="mt-1 text-sm text-gray-500">Manage products available for sale.</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
       <div className="relative max-w-xs">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
         <Input
           type="text"
           placeholder="Search products..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="pl-9"
         />
       </div>

      {/* Product List/Grid - Remove separate loading, handled above */}
      {/* {loading && ( ... )} */}
      {error && ( // Keep error display specifically for product fetching errors
         <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
           <AlertCircle className="h-5 w-5 mr-3" />
           <span>Error loading products list: {error}</span>
         </div>
      )}
      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.length === 0 ? (
             <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                   {searchTerm ? 'No products found matching your search.' : 'No products added yet.'}
                </p>
                {!searchTerm && <Button onClick={handleAddNew} className="mt-4">Add First Product</Button>}
             </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg border shadow-sm p-4 flex flex-col justify-between">
                 <div>
                    <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                       <img src={product.image_url || '/images/placeholders/product-default.png'} alt={product.name} className="h-full w-full object-contain"/>
                    </div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description || 'No description'}</p>
                    <div className="mt-2 flex justify-between items-center text-sm">
                       <span className="text-gray-900 font-medium">{formatCurrency(product.price)}</span>
                       <span className={`text-xs font-medium px-2 py-0.5 rounded ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {product.active ? 'Active' : 'Inactive'}
                       </span>
                    </div>
                    {product.stock !== null && product.stock !== undefined && (
                       <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
                    )}
                 </div>
                 <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                       <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(product.id)}>
                       <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                 </div>
              </div>
            ))
          )}
        </div>
      )}

       {/* Product Form Dialog */}
       <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
           </DialogHeader>
           {/* Render ProductForm correctly */}
           <ProductForm
             salonId={currentSalon?.id || ''}
             productData={editingProduct}
             onSuccess={() => setShowProductForm(false)}
             onCancel={() => setShowProductForm(false)}
           />
           {/* Stray comment removed */}
         </DialogContent>
       </Dialog>

    </div> // Closing main div
  );
}