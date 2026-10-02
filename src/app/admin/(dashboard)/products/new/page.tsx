'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { slugify } from '@/lib/utils';
import { Product, ProductVariant, ProductImage, Category } from '@/lib/types';
import { getCategories } from '@/lib/services/categories';
import { saveProductToDb } from '@/lib/services/products';
import { uploadImageToStorage } from '@/lib/services/storage';

export default function NewProduct() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Categories from Supabase
  const [categories, setCategories] = useState<Category[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('cat-1');
  const [brand, setBrand] = useState('AURA OUTLET');

  useEffect(() => {
    async function loadCategories() {
      const data = await getCategories();
      if (data && data.length > 0) {
        setCategories(data);
        setCategoryId(data[0].id);
      }
    }
    loadCategories();
  }, []);
  const [basePrice, setBasePrice] = useState<string>('1499');
  const [salePrice, setSalePrice] = useState<string>('999');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Images State
  const [images, setImages] = useState<{ id: string; image_url: string; alt_text?: string; is_primary: boolean }[]>([
    {
      id: 'img-new-1',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
      alt_text: 'Front view',
      is_primary: true,
    }
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Variants State
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([
    { size: 'S', color: 'Black', sku: 'AURA-NEW-S-BLK', price: 999, stock_quantity: 15, is_active: true },
    { size: 'M', color: 'Black', sku: 'AURA-NEW-M-BLK', price: 999, stock_quantity: 25, is_active: true },
    { size: 'L', color: 'Black', sku: 'AURA-NEW-L-BLK', price: 999, stock_quantity: 20, is_active: true },
    { size: 'XL', color: 'Black', sku: 'AURA-NEW-XL-BLK', price: 999, stock_quantity: 10, is_active: true },
  ]);

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(slugify(val));
  };

  // Image Upload Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const publicUrl = await uploadImageToStorage(file, 'products');
      setImages((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          image_url: publicUrl,
          alt_text: file.name,
          is_primary: prev.length === 0,
        }
      ]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        image_url: imageUrlInput.trim(),
        alt_text: name || 'Product image',
        is_primary: prev.length === 0,
      }
    ]);
    setImageUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If primary was removed, make the first one primary
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  // Variant Handlers
  const handleAddVariant = () => {
    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const existingSizes = variants.map((v) => v.size);
    const nextSize = defaultSizes.find((s) => !existingSizes.includes(s)) || 'OS';
    const priceNum = parseFloat(salePrice) || parseFloat(basePrice) || 999;
    const cleanSlug = slug || 'PROD';

    setVariants((prev) => [
      ...prev,
      {
        size: nextSize,
        color: 'Black',
        sku: `AURA-${cleanSlug.toUpperCase()}-${nextSize}-BLK`,
        price: priceNum,
        stock_quantity: 10,
        is_active: true,
      }
    ]);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Product must have at least one variant.');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      setErrorMessage('Valid base price is required.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please add at least one product image.');
      return;
    }

    setIsSubmitting(true);

    const newProductId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: newProductId,
      name,
      slug: slug || slugify(name),
      description,
      category_id: categoryId,
      category: categories.find((c) => c.id === categoryId),
      base_price: parseFloat(basePrice),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      brand: brand || 'AURA OUTLET',
      is_active: isActive,
      is_featured: isFeatured,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: images.map((img, idx) => ({
        id: img.id,
        product_id: newProductId,
        image_url: img.image_url,
        alt_text: img.alt_text || name,
        sort_order: idx,
        is_primary: img.is_primary,
        created_at: new Date().toISOString(),
      })),
      variants: variants.map((v, idx) => ({
        id: `var-${newProductId}-${idx}`,
        product_id: newProductId,
        size: v.size,
        color: v.color,
        sku: v.sku,
        price: v.price,
        stock_quantity: Number(v.stock_quantity),
        is_active: v.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };

    // Save to Supabase
    await saveProductToDb(
      {
        id: newProductId,
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        category_id: newProduct.category_id,
        base_price: newProduct.base_price,
        sale_price: newProduct.sale_price,
        brand: newProduct.brand,
        is_active: newProduct.is_active,
        is_featured: newProduct.is_featured,
        created_at: newProduct.created_at,
        updated_at: newProduct.updated_at,
      },
      variants,
      images
    );

    setIsSubmitting(false);
    setSuccessMessage(true);
    setTimeout(() => {
      router.push('/admin/products');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="text-gray-500 hover:text-black transition-colors p-1">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase text-black">Add New Product</h1>
            <p className="text-xs md:text-sm text-gray font-medium">Create a new streetwear item in the catalog</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/products')} className="text-xs uppercase font-bold">
          Cancel
        </Button>
      </div>

      {successMessage && (
        <div className="bg-success/15 border-2 border-success text-black p-4 flex items-center gap-3 animate-fade-in font-bold text-sm">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Product created successfully! Redirecting to products directory...
        </div>
      )}

      {errorMessage && (
        <div className="bg-error/15 border-2 border-error text-error p-4 animate-fade-in font-bold text-sm">
          {errorMessage}
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <h2 className="text-base md:text-lg font-black uppercase tracking-wider border-b border-gray-200 pb-3 text-black">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
                Product Name *
              </label>
              <Input
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Heavyweight Boxy Noir Tee"
                className="font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
                URL Slug *
              </label>
              <Input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="heavyweight-boxy-noir-tee"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
              Product Description
            </label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crafted from 240+ GSM combed heavyweight cotton. Features custom oversized streetwear cut..."
              className="leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
                Category *
              </label>
              <Select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                placeholder="Select a category"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
                Brand Name
              </label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. AURA OUTLET"
                className="font-bold uppercase"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <h2 className="text-base md:text-lg font-black uppercase tracking-wider border-b border-gray-200 pb-3 text-black">
            2. Pricing (INR ₹)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
                Regular / Base Price (₹) *
              </label>
              <Input
                type="number"
                required
                min="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="1499"
                className="font-bold text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-black">
                Sale / Discounted Price (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="999"
                className="font-bold text-base text-success"
              />
              <span className="text-xs text-gray-500 font-medium">Leave blank if item is not on sale</span>
            </div>
          </div>
        </div>

        {/* Images Uploading & URLs */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-3 gap-2">
            <div>
              <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-black">
                3. Product Imagery
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload local photos or paste image URLs</p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold uppercase"
              >
                <Upload size={14} className="mr-1.5" /> Upload Files
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs font-bold uppercase"
              >
                <Plus size={14} className="mr-1.5" /> Add URL
              </Button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Image URL Input Form */}
          {showUrlInput && (
            <div className="p-4 bg-off-white border border-gray-200 space-y-3 animate-fade-in">
              <label className="text-xs font-bold uppercase tracking-wider text-black">
                Image Web Address (URL)
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="bg-white"
                />
                <Button type="button" onClick={handleAddImageUrl} className="text-xs font-bold uppercase">
                  Add Image
                </Button>
              </div>
            </div>
          )}

          {/* Image Previews Grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group border-2 border-gray-200 overflow-hidden bg-off-white aspect-square">
                  <img src={img.image_url} alt={img.alt_text || 'Product image'} className="w-full h-full object-cover" />
                  
                  {img.is_primary ? (
                    <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow">
                      Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className="absolute top-2 left-2 bg-white/90 text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Make Cover
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-white p-1.5 text-error hover:bg-error hover:text-white transition-colors shadow"
                    title="Remove Image"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black hover:bg-off-white/50 transition-all"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <p className="font-bold text-sm text-black uppercase tracking-wider">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          )}
        </div>

        {/* Variants Management */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-black">
                4. Sizes & Inventory Variants
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Define SKUs, sizes, colors and quantity</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddVariant} className="text-xs font-bold uppercase">
              <Plus size={14} className="mr-1" /> Add Variant
            </Button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[650px] text-sm text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price (₹)</th>
                  <th className="px-4 py-3">Stock Qty</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <Input
                        value={variant.size}
                        onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value.toUpperCase())}
                        className="h-9 w-20 font-bold uppercase text-center"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        value={variant.color}
                        onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                        className="h-9 w-24 font-medium"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        value={variant.sku}
                        onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value)}
                        className="h-9 w-44 font-mono text-xs"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="h-9 w-24 font-bold"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock_quantity}
                        onChange={(e) => handleUpdateVariant(idx, 'stock_quantity', parseInt(e.target.value, 10) || 0)}
                        className="h-9 w-20 font-bold text-center"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1.5 text-gray-400 hover:text-error transition-colors"
                        title="Delete variant"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Settings */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <h2 className="text-base md:text-lg font-black uppercase tracking-wider border-b border-gray-200 pb-3 text-black">
            5. Visibility & Promotion
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 accent-black rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-sm text-black uppercase">Active (Visible in store)</span>
                <p className="text-xs text-gray-500">Uncheck to hide this product from customers</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-5 w-5 accent-black rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-sm text-black uppercase">Featured Product</span>
                <p className="text-xs text-gray-500">Feature this product in the homepage carousel & drop banner</p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4 justify-end pt-4 pb-12">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')} className="font-bold text-xs uppercase">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="h-12 px-8 font-black uppercase tracking-widest text-sm"
          >
            {isSubmitting ? 'Saving Product...' : 'Publish Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
