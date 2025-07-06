import React, { useState, useEffect } from 'react';
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit2, Trash2, Package, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProductForm } from '@/components/salon/forms/ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {toast} from 'sonner';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; 
type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  isAvailable: boolean;
  imagePath?: string;
  salon_id: string;
  created_at: string;
};
type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  name?: string;
  // any other fields you expect
};
export default function ProductsPage() {
  const token = Cookies.get('salonUser');
  
  const decoded = jwtDecode<JwtPayload>(token);
  if (token) {
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('User ID:', decoded.Id);
  }

  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://kapperking.runasp.net/api/Products/GetProducts/${decoded?.Id}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
      console.log('Fetched products:', data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [ ]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

const handleDelete = async (productId: string) => {
  try {
      setLoading(true);
      const response = await fetch(`https://kapperking.runasp.net/api/Products/DeleteProduct/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove the product from local state
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
};

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (salonLoading || loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (salonError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        Error loading salon context: {salonError}
      </div>
    );
  }

  // if (!currentSalon) {
  //   return (
  //     <div className="p-6 text-center text-gray-500">
  //       No active salon associated with this account.
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Products for </h1>
          <p className="mt-1 text-sm text-gray-500">Manage products available for sale.</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

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

      {error && (
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
                    {
                      product.imagePath ? (
                        <img src={`https://kapperking.runasp.net/${product.imagePath}` || '/images/placeholders/product-default.png'} alt={product.name} className="h-full w-full object-contain" />
                        
                      ) : (
                        <img src={'/images/placeholders/product-default.png'} alt={product.name} className="h-full w-full object-contain" />

                      )
                    }
                  </div>
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description || 'No description'}</p>
                  <div className="mt-2 flex justify-between items-center text-sm">
                    <span className="text-gray-900 font-medium">{formatCurrency(product.price)}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.isAvailable ? 'Active' : 'Inactive'}
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

      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm
            salonId={decoded?.Id?.toString() || ''}
            productData={editingProduct}
            onSuccess={() => {
              setShowProductForm(false);
              fetchProducts();
            }}
            onCancel={() => setShowProductForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
