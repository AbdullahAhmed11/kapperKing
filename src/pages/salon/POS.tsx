import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Package, DollarSign, BarChart2, Tag, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductStore } from '@/lib/store/products';
import { useSaleStore } from '@/lib/store/sales';
import { ProductForm } from '@/components/pos/ProductForm';
import { SaleForm } from '@/components/pos/SaleForm';
import { formatCurrency } from '@/lib/utils';

export default function POS() {
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showNewSale, setShowNewSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<Array<{ product: any; quantity: number }>>([]);

  const { 
    products = [],
    loading: productsLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts 
  } = useProductStore();

  const {
    sales = [],
    loading: salesLoading,
    createSale
  } = useSaleStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchProducts(searchTerm);
    } else {
      fetchProducts();
    }
  }, [searchTerm]);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleCheckout = async () => {
    try {
      await createSale({
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        date: new Date().toISOString()
      });
      setCart([]);
      setShowNewSale(false);
    } catch (error) {
      console.error('Failed to process sale:', error);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="h-full flex">
      {/* Left Side - Products */}
      <div className="flex-1 p-6 border-r border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Point of Sale</h1>
            <p className="mt-1 text-sm text-gray-500">Manage products and process sales</p>
          </div>
          <Button onClick={() => setShowNewProduct(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center space-x-4">
            <select
              className="rounded-lg border border-gray-200 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Archive className="h-3 w-3 mr-1" />
                  {product.stock} in stock
                </span>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
          <span className="text-sm text-gray-500">{cart.length} items</span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Add products to get started</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{formatCurrency(product.price)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="font-medium text-gray-500">Tax (21%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(cartTotal * 0.21)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-semibold mt-4">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(cartTotal * 1.21)}</span>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleCheckout}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Complete Sale
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Forms */}
      <ProductForm
        open={showNewProduct}
        onClose={() => setShowNewProduct(false)}
        onSubmit={createProduct}
      />

      <SaleForm
        open={showNewSale}
        onClose={() => setShowNewSale(false)}
        onSubmit={handleCheckout}
        cart={cart}
        total={cartTotal}
      />
    </div>
  );
}