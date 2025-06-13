// src/pages/admin/AdminProducts.jsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AnimatedButton from '../../components/AnimatedButton';
import { Trash2, Edit3 } from 'lucide-react';

const CLOUDINARY_UPLOAD_URL =
  'https://api.cloudinary.com/v1_1/dhubit7vj/upload';
const UPLOAD_PRESET = 'estore';

// Helper to format numbers like "Tsh.2,250,000.00/="
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

  const confirmDeletion = (id) => setConfirmDeleteId(id);
  const cancelDeletion = () => setConfirmDeleteId(null);

  const handleDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/products/${id}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

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

  const uploadToCloudinary = async (file, slotIdx) => {
    const body = new FormData();
    body.append('file', file);
    body.append('upload_preset', UPLOAD_PRESET);

    try {
      setUploadingIdx(slotIdx);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body,
      });
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

  const toggleFeaturedInline = async (prod) => {
    const flag = !prod.isFeatured;
    try {
      await api.put(`/api/products/${prod._id}`, { isFeatured: flag });
      toast.success(`Product ${flag ? 'marked' : 'unmarked'} as featured.`);
      fetchProducts();
    } catch {
      toast.error('Failed to update status.');
    }
  };

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
          {/* … same form fields … */}
          {/* Submit */}
          <div className="flex space-x-4 mt-4">
            <AnimatedButton
              type="submit"
              disabled={loading || uploadingIdx !== null}
              className="px-6 py-2"
            >
              {editingProduct
                ? loading
                  ? 'Updating…'
                  : 'Update'
                : loading
                ? 'Creating…'
                : 'Create'}
            </AnimatedButton>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-neutral-300 rounded-2xl text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-x-auto p-6 lg:p-8">
        <h3 className="text-xl font-medium mb-4 text-neutral-800">All Products</h3>
        {products.length ? (
          <table className="min-w-full bg-transparent">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Price</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Discount</th>
                <th className="px-4 py-2 text-right text-sm font-medium">Disc. Price</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Stock</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Featured</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Images</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Description</th>
                <th className="px-4 py-2 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, i) => {
                const price = parseFloat(prod.price) || 0;
                const disc = Math.max(0, parseFloat(prod.discount) || 0);
                const finalPrice = Math.round(((price * (100 - disc)) / 100) * 100) / 100;
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
                      {formatPrice(finalPrice)}
                    </td>
                    <td className="px-4 py-2 text-center">{prod.stock}</td>
                    <td className="px-4 py-2">{prod.category?.name || '—'}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleFeaturedInline(prod)}
                        className={`text-xl ${
                          prod.isFeatured ? 'text-yellow-500' : 'text-neutral-300'
                        }`}
                      >
                        {prod.isFeatured ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      {prod.images?.length ? (
                        <div className="flex space-x-1">
                          {prod.images.slice(0, 3).map((u, idx) => (
                            <img
                              key={idx}
                              src={u}
                              alt=""
                              className="w-8 h-8 object-cover rounded"
                            />
                          ))}
                          {prod.images.length > 3 && (
                            <span className="text-sm text-neutral-500">
                              +{prod.images.length - 3}
                            </span>
                          )}
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
          <p className="text-center text-neutral-500 py-8">No products found.</p>
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
                <p className="text-neutral-800 mb-4">
                  Are you sure you want to delete this product?
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelDeletion}
                    className="px-4 py-2 bg-neutral-200 rounded-2xl hover:bg-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deletingId === confirmDeleteId}
                    className="px-4 py-2 bg-red-500 text-white rounded-2xl hover:bg-red-600"
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
