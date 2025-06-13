// src/pages/admin/AdminProducts.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AnimatedButton from '../../components/AnimatedButton';
import { Trash2, Edit3 } from 'lucide-react';

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dhubit7vj/upload';
const UPLOAD_PRESET = 'estore';

// Format numbers like "Tsh.2,250,000.00/="
const formatPrice = (price) =>
  `Tsh.${price.toLocaleString('en-TZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}/=`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form state
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount: '',
    isFeatured: false,
    images: [''],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Search & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch products & categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/api/products', {
        params: { page: 1, limit: 1000 },
      });
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      toast.error('Failed to load products.');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load categories.');
    }
  };

  // Filter & paginate list
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Delete handlers
  const confirmDeletion = (id) => setConfirmDeleteId(id);
  const cancelDeletion = () => setConfirmDeleteId(null);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await api.delete(`/api/products/${confirmDeleteId}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Edit form handlers
  const startEdit = (prod) => {
    setEditingProduct(prod._id);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price?.toString() || '',
      stock: prod.stock?.toString() || '',
      category: prod.category?._id || '',
      discount: prod.discount?.toString() || '',
      isFeatured: prod.isFeatured || false,
      images: Array.isArray(prod.images) && prod.images.length ? prod.images : [''],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      discount: '',
      isFeatured: false,
      images: [''],
    });
  };

  const handleChange = (e, idx = null) => {
    const { name, value, checked } = e.target;
    if (name === 'images') {
      const imgs = [...formData.images];
      imgs[idx] = value;
      setFormData((f) => ({ ...f, images: imgs }));
    } else if (name === 'isFeatured') {
      setFormData((f) => ({ ...f, isFeatured: checked }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  const addImageField = () =>
    setFormData((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImageField = (idx) =>
    setFormData((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  // Upload image
  const uploadToCloudinary = async (file, slotIdx) => {
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', UPLOAD_PRESET);
    try {
      setUploadingIdx(slotIdx);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      return data.secure_url;
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleFileInput = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, idx);
      const imgs = [...formData.images];
      imgs[idx] = url;
      setFormData((f) => ({ ...f, images: imgs }));
      toast.success('Image uploaded.');
    } catch {
      toast.error('Image upload failed.');
    }
  };

  // Toggle featured
  const toggleFeaturedInline = async (prod) => {
    try {
      await api.put(`/api/products/${prod._id}`, { isFeatured: !prod.isFeatured });
      fetchProducts();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  // Submit add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast.error('Name, price, stock & category are required.');
      return;
    }
    const discount = Math.max(0, parseFloat(formData.discount) || 0);
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      discount,
      images: formData.images.filter((u) => u.trim()),
    };

    setLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/api/products', payload);
        toast.success('Product created.');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.map((e) => e.msg).join(', ') ||
        'Operation failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Add/Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card p-6 lg:p-8"
      >
        <h3 className="text-xl font-medium text-neutral-800 mb-4">
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700" htmlFor="name">
              Name *
            </label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none leading-relaxed"
            />
          </div>
          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700" htmlFor="price">
                Price *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700" htmlFor="stock">
                Stock *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </div>
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700" htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="">-- Select --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {/* Discount & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700" htmlFor="discount">
                Discount %
              </label>
              <input
                id="discount"
                name="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isFeatured"
                name="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-neutral-700" htmlFor="isFeatured">
                Featured
              </label>
            </div>
          </div>
          {/* Images */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-neutral-700">Images</p>
            {formData.images.map((url, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {url ? (
                  <img
                    src={url}
                    alt=""
                    className="h-32 w-32 rounded-lg border border-neutral-200 object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-400">
                    No image
                  </div>
                )}
                <div className="space-y-2">
                  <label
                    htmlFor={`file-input-${idx}`}
                    className="inline-flex cursor-pointer items-center rounded-2xl bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                  >
                    {uploadingIdx === idx
                      ? 'Uploading…'
                      : url
                      ? 'Change File'
                      : 'Choose File'}
                    <input
                      id={`file-input-${idx}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileInput(e, idx)}
                      className="hidden"
                      disabled={uploadingIdx === idx}
                    />
                  </label>
                  <input
                    name="images"
                    value={url}
                    onChange={(e) => handleChange(e, idx)}
                    placeholder="Paste URL"
                    className="mt-1 block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="self-start text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="text-accent-500 hover:underline text-sm"
            >
              + Add slot
            </button>
          </div>
          {/* Submit & Cancel */}
          <div className="flex space-x-4 mt-4">
            <AnimatedButton
              type="submit"
              disabled={loading || uploadingIdx !== null}
              className="px-6 py-2"
            >
              {editingProduct ? (loading ? 'Updating…' : 'Update') : loading ? 'Creating…' : 'Create'}
            </AnimatedButton>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-neutral-300 px-6 py-2 text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 lg:p-8">
          <h3 className="text-xl font-medium text-neutral-800">All Products</h3>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-4 md:mt-0 block max-w-sm rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 shadow-inner focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {filtered.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-neutral-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Price</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Discount</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Disc. Price</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Stock</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Feat.</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Images</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Desc.</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((prod, i) => {
                const price = parseFloat(prod.price) || 0;
                const disc = Math.max(0, parseFloat(prod.discount) || 0);
                const finalP = Math.round(((price * (100 - disc)) / 100) * 100) / 100;
                return (
                  <motion.tr
                    key={prod._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b even:bg-white hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2">{prod.name}</td>
                    <td className="px-4 py-2 text-right">{formatPrice(price)}</td>
                    <td className="px-4 py-2 text-right">{disc.toFixed(2)}%</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {formatPrice(finalP)}
                    </td>
                    <td className="px-4 py-2 text-center">{prod.stock}</td>
                    <td className="px-4 py-2">{prod.category?.name || '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => toggleFeaturedInline(prod)}>
                        {prod.isFeatured ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {prod.images?.length ? (
                        <div className="flex space-x-1">
                          {prod.images.slice(0, 3).map((u, idx) => (
                            <img key={idx} src={u} alt="" className="h-8 w-8 rounded object-cover" />
                          ))}
                          {prod.images.length > 3 && <span>+{prod.images.length - 3}</span>}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2 max-w-xs truncate">{prod.description || '—'}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button onClick={() => startEdit(prod)}>
                        <Edit3 size={18} className="text-blue-600 hover:text-blue-800" />
                      </button>
                      <button onClick={() => confirmDeletion(prod._id)}>
                        <Trash2 size={18} className="text-red-600 hover:text-red-800" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-neutral-500 py-8">
            No products matching “{searchTerm}”.
          </p>
        )}

        {/* Pagination */}
        {filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-sm text-neutral-600">
              Showing{' '}
              {(currentPage - 1) * itemsPerPage + 1}– 
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="rounded-2xl bg-neutral-200 px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`rounded-2xl px-3 py-1 ${
                    currentPage === idx + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-2xl bg-neutral-200 px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDeleteId &&
        ReactDOM.createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-2xl p-6 w-80 text-center shadow-lg"
              >
                <p className="mb-4 text-neutral-800">Delete this product?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelDeletion}
                    className="rounded-2xl bg-neutral-200 px-4 py-2 hover:bg-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deletingId === confirmDeleteId}
                    className="rounded-2xl bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    {deletingId === confirmDeleteId ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
);
}
