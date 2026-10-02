'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { mockCategories } from '@/lib/mock-data';
import { Plus, Edit2, Trash2, X, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button, Input, Textarea, TablePagination } from '@/components/ui';
import { slugify } from '@/lib/utils';
import { Category } from '@/lib/types';
import { getAllAdminCategories, saveCategoryToDb, deleteCategoryFromDb } from '@/lib/services/categories';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const loadCategories = async () => {
    setLoading(true);
    const data = await getAllAdminCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return categories.slice(start, start + pageSize);
  }, [categories, currentPage, pageSize]);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setIsActive(cat.is_active);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      // Edit existing
      const updatedCategory: Category = {
        ...editingCategory,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      await saveCategoryToDb(updatedCategory);

      setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
      setFeedback(`Category "${name}" updated successfully.`);
    } else {
      // Create new
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveCategoryToDb(newCategory);

      setCategories([newCategory, ...categories]);
      setFeedback(`Category "${name}" created successfully.`);
    }

    setIsModalOpen(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      setCategories(categories.filter(c => c.id !== id));
      await deleteCategoryFromDb(id);
      setFeedback(`Category "${catName}" deleted.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">Categories</h1>
          <p className="text-gray-500 text-sm">Manage product categories mapping 1:1 to database table `categories`.</p>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-black text-white hover:bg-gray-800 rounded-none uppercase text-xs tracking-wider"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      {feedback && (
        <div className="p-4 bg-black text-white flex items-center gap-3 animate-fade-in text-sm font-semibold">
          <CheckCircle2 size={18} className="text-white" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div className="font-bold text-black">{category.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{category.slug}</td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{category.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold ${category.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
                      {category.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(category)}
                        className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded transition-colors" 
                        title="Edit Category"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.name)}
                        className="p-2 text-error hover:bg-red-50 rounded transition-colors" 
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No categories found. Click "Add Category" to create one.
            </div>
          )}
        </div>
        {categories.length > 0 && (
          <TablePagination
            totalItems={categories.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-black shadow-2xl p-6 space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700">Category Name *</label>
                <Input
                  required
                  placeholder="e.g. Graphic Tees"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700">Slug *</label>
                <Input
                  required
                  placeholder="graphic-tees"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700">Banner / Image URL</label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700">Description</label>
                <Textarea
                  rows={3}
                  placeholder="Category description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-none accent-black"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span className="text-xs font-bold uppercase">Active (Visible in Store)</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="uppercase text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="uppercase text-xs"
                >
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
