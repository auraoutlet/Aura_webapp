'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { mockProducts, mockCategories } from '@/lib/mock-data';
import { slugify } from '@/lib/utils';
import { Product, ProductVariant, ProductImage, Category } from '@/lib/types';
import { getProductById, saveProductToDb, deleteProductFromDb } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { uploadImageToStorage } from '@/lib/services/storage';

export default function EditProduct({ params }: { params?: Promise<{ id: string }> }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Categories from Supabase
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  // Next.js 16 param unwrapping
  const unwrappedParams = params ? React.use(params) : null;
  const routeParams = useParams();
  const id = unwrappedParams?.id || (Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id);

  const [product, setProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('AURA OUTLET');
  const [basePrice, setBasePrice] = useState<string>('0');
  const [salePrice, setSalePrice] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Images State
  const [images, setImages] = useState<Array<{ id: string; image_url: string; alt_text?: string; is_primary: boolean }>>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Variants State
  const [variants, setVariants] = useState<Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]>([]);

  // Submission feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadProductAndCategories() {
      if (!id) return;
      
      const [found, cats] = await Promise.all([
        getProductById(id),
        getCategories()
      ]);

      if (cats && cats.length > 0) {
        setCategories(cats);
      }

      if (found) {
        setProduct(found);
        setName(found.name);
        setSlug(found.slug);
        setDescription(found.description || '');
        setCategoryId(found.category_id || (cats && cats[0]?.id) || '');
        setBrand(found.brand || 'AURA OUTLET');
        setBasePrice(found.base_price.toString());
        setSalePrice(found.sale_price ? found.sale_price.toString() : '');
        setIsActive(found.is_active);
        setIsFeatured(found.is_featured);

        // Populate images
        if (found.images && found.images.length > 0) {
          setImages(found.images.map((img, i) => ({
            id: img.id || `img-${i}`,
            image_url: img.image_url,
            alt_text: img.alt_text || '',
            is_primary: img.is_primary || i === 0,
          })));
        } else {
          setImages([]);
        }

        // Populate variants
        if (found.variants && found.variants.length > 0) {
          setVariants(found.variants.map(v => ({
            size: v.size,
            color: v.color,
            sku: v.sku,
            price: v.price,
            stock_quantity: v.stock_quantity,
            is_active: v.is_active,
          })));
        } else {
          setVariants([
            { size: 'S', color: 'Black', sku: `${found.slug}-S`, price: found.sale_price || found.base_price, stock_quantity: 10, is_active: true },
            { size: 'M', color: 'Black', sku: `${found.slug}-M`, price: found.sale_price || found.base_price, stock_quantity: 15, is_active: true },
            { size: 'L', color: 'Black', sku: `${found.slug}-L`, price: found.sale_price || found.base_price, stock_quantity: 12, is_active: true },
            { size: 'XL', color: 'Black', sku: `${found.slug}-XL`, price: found.sale_price || found.base_price, stock_quantity: 8, is_active: true },
          ]);
        }
      }
    }

    loadProductAndCategories();
  }, [id]);

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

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== indexToRemove);
      if (prev[indexToRemove]?.is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === indexToPrimary,
      }))
    );
  };

  // Variant Handlers
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: 'M',
        color: 'Black',
        sku: `${slug ? slug.toUpperCase() : 'AURA'}-${Date.now().toString().slice(-4)}`,
        price: Number(salePrice) || Number(basePrice) || 999,
        stock_quantity: 10,
        is_active: true,
      }
    ]);
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleVariantChange = (index: number, field: keyof Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>, value: string | number | boolean) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Save / Update Handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (!basePrice || isNaN(Number(basePrice)) || Number(basePrice) <= 0) {
      setErrorMessage('Valid base price is required.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Please add at least one product image.');
      return;
    }
    if (variants.length === 0) {
      setErrorMessage('Please configure at least one product variant (size/stock).');
      return;
    }

    setIsSubmitting(true);

    const updatedProductImages: ProductImage[] = images.map((img, idx) => ({
      id: img.id,
      product_id: id || 'prod-updated',
      image_url: img.image_url,
      alt_text: img.alt_text || name,
      sort_order: idx,
      is_primary: img.is_primary,
      created_at: new Date().toISOString(),
    }));

    const updatedProductVariants: ProductVariant[] = variants.map((v, idx) => ({
      id: `var-${id}-${idx}`,
      product_id: id || 'prod-updated',
      size: v.size,
      color: v.color,
      sku: v.sku,
      price: Number(v.price),
      stock_quantity: Number(v.stock_quantity),
      is_active: v.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const updatedProduct: Product = {
      id: id || `prod-${Date.now()}`,
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      category_id: categoryId,
      base_price: Number(basePrice),
      sale_price: salePrice ? Number(salePrice) : null,
      brand: brand.trim() || 'AURA OUTLET',
      is_active: isActive,
      is_featured: isFeatured,
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: updatedProductImages,
      variants: updatedProductVariants,
      category: categories.find(c => c.id === categoryId),
    };

    // Save to Supabase
    await saveProductToDb(
      {
        id: updatedProduct.id,
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        description: updatedProduct.description,
        category_id: updatedProduct.category_id,
        base_price: updatedProduct.base_price,
        sale_price: updatedProduct.sale_price,
        brand: updatedProduct.brand,
        is_active: updatedProduct.is_active,
        is_featured: updatedProduct.is_featured,
        created_at: updatedProduct.created_at,
        updated_at: updatedProduct.updated_at,
      },
      variants,
      images
    );

    // Update in mock store
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = updatedProduct;
    } else {
      mockProducts.unshift(updatedProduct);
    }

    setIsSubmitting(false);
    setSuccessMessage(true);
    setTimeout(() => {
      router.push('/admin/products');
    }, 1200);
  };

  // Delete Handler
  const handleDeleteProduct = async () => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      if (id) {
        await deleteProductFromDb(id);
      }
      const index = mockProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProducts.splice(index, 1);
      }
      router.push('/admin/products');
    }
  };

  if (!product) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 mb-4">Loading product...</p>
        <Link href="/admin/products" className="text-xs uppercase font-bold tracking-widest text-black underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="text-gray-500 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">Update Product</h1>
            <p className="text-xs text-gray-500 font-mono">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleDeleteProduct}
            className="text-error border-error/50 hover:bg-error/10 uppercase text-xs tracking-wider"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Product
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-black text-white p-4 flex items-center justify-between animate-fade-in border border-black shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-white" />
            <span className="font-bold text-sm tracking-wide">
              Product updated successfully! Redirecting to products list...
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 text-error p-4 border border-error/20 text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form className="space-y-8" onSubmit={handleUpdateProduct}>
        {/* Basic Info */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <div className="border-b pb-2 flex justify-between items-center">
            <h2 className="text-lg font-bold uppercase tracking-wider">Basic Info</h2>
            <span className="text-xs text-gray-400">PostgreSQL table: `products`</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name *</label>
              <Input
                required
                placeholder="e.g. OVERSIZED VINTAGE TEE"
                value={name}
                onChange={handleNameChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Slug *</label>
              <Input
                required
                placeholder="e.g. oversized-vintage-tee"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={4}
              placeholder="Provide detailed fabric specifications, GSM, wash instructions, and fit details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand</label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="AURA OUTLET"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <div className="border-b pb-2 flex justify-between items-center">
            <h2 className="text-lg font-bold uppercase tracking-wider">Pricing</h2>
            <span className="text-xs text-gray-400">Prices in INR (₹)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base / MRP Price (₹) *</label>
              <Input
                type="number"
                required
                min="0"
                step="1"
                placeholder="1499"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sale / Discounted Price (₹)</label>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder="999 (Optional, leave blank if no discount)"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Images Management */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider">Product Images ({images.length})</h2>
              <p className="text-xs text-gray-500">Supports direct device uploads (base64) & public/Supabase URLs.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs uppercase"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                {showUrlInput ? 'Cancel URL' : 'Add via URL'}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="text-xs uppercase"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Upload Files
              </Button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* URL Input Form */}
          {showUrlInput && (
            <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
              <label className="text-xs font-bold uppercase text-gray-700">Image Web or Supabase Storage URL</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/... or /storage/v1/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="bg-white"
                />
                <Button type="button" variant="primary" onClick={handleAddImageUrl} className="whitespace-nowrap">
                  Add Image
                </Button>
              </div>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className={`relative group aspect-square border-2 ${
                  img.is_primary ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-400'
                } bg-gray-50 overflow-hidden`}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || `Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {img.is_primary && (
                  <div className="absolute top-1 left-1 bg-black text-white px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 shadow-sm">
                    <Star size={10} className="fill-white" /> Primary
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {!img.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className="bg-white text-black text-[10px] font-bold uppercase px-2 py-1 tracking-wider hover:bg-gray-100 transition-colors w-full"
                    >
                      Set Cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="bg-error text-white p-1.5 rounded hover:bg-red-700 transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Click to Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-black p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors aspect-square"
            >
              <Upload className="h-6 w-6 text-gray-400 mb-1" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Upload New</p>
              <p className="text-[9px] text-gray-400">PNG, JPG, WEBP</p>
            </div>
          </div>
        </div>

        {/* Variants Management */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider">Inventory Variants ({variants.length})</h2>
              <p className="text-xs text-gray-500">Each size and color combination maps to `product_variants`</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
              className="h-8 uppercase text-xs"
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
            </Button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left whitespace-nowrap min-w-[650px]">
              <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">SKU *</th>
                  <th className="px-4 py-3">Price (₹)</th>
                  <th className="px-4 py-3">Stock Qty *</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((variant, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2">
                      <select
                        value={variant.size}
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                        className="h-8 px-2 border border-gray-300 rounded-none bg-white text-xs font-bold"
                      >
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        <option value="FREE">FREE</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={variant.color}
                        onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                        className="h-8 w-24 text-xs font-medium"
                        placeholder="e.g. Black"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        className="h-8 font-mono text-xs"
                        placeholder="SKU-CODE"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                        className="h-8 w-24 text-xs font-bold"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock_quantity}
                        onChange={(e) => handleVariantChange(idx, 'stock_quantity', Number(e.target.value))}
                        className="h-8 w-24 text-xs font-bold"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        disabled={variants.length <= 1}
                        className="text-gray-400 hover:text-error disabled:opacity-30 disabled:hover:text-gray-400 p-1 transition-colors"
                        title="Remove Variant"
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

        {/* Status / Visibility */}
        <div className="bg-white p-6 border border-gray-200 space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-wider border-b pb-2">Visibility & Flags</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded-none border-gray-300 text-black focus:ring-black accent-black"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div>
                <span className="font-bold text-sm block">Active (Published to Store)</span>
                <span className="text-xs text-gray-500">When checked, customers can view and purchase this product.</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded-none border-gray-300 text-black focus:ring-black accent-black"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <div>
                <span className="font-bold text-sm block">Featured Product</span>
                <span className="text-xs text-gray-500">Showcases this item prominently on the homepage hero / featured carousel.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteProduct}
            className="text-error border-error/50 hover:bg-error/10 uppercase text-xs tracking-wider"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Product
          </Button>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
              className="uppercase text-xs tracking-wider"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="uppercase text-xs tracking-wider min-w-[140px]"
            >
              {isSubmitting ? 'Saving Changes...' : 'Update Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
