import React, { useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Categories/GetCategories');
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('https://kapperking.runasp.net/api/Categories/AddCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory), // Still just the string for Add
      });

      if (!response.ok) throw new Error('Failed to add category');
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Categories/DeleteCategory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setEditedName(category.name);
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editedName.trim()) return;

    try {
      const response = await fetch('https://kapperking.runasp.net/api/Categories/EditCategory', {
        method: 'POST', // or 'POST' if required by your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name: editedName }), // Correct payload format
      });

      if (!response.ok) throw new Error('Failed to update category');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
          className="border rounded p-2 flex-1"
        />
        <button
          onClick={handleAddCategory}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white shadow-md rounded-lg p-4 text-center relative group"
            >
              {editingId === category.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="border rounded p-2 mb-2"
                  />
                  <button
                    onClick={() => handleUpdateCategory(category.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-lg">{category.name}</span>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;