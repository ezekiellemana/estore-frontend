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
    description: [''],      // now an array of bullets
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

  // Filter & paginate
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
      description: prod.description
        ? prod.description.split('\n• ').slice(1)
        : [''],
      price: prod.price
        ? prod.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : '',
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
      description: [''],
      price: '',
      stock: '',
      category: '',
      discount: '',
      isFeatured: false,
      images: [''],
    });
  };

  // Handle change, with live formatting on price
  const handleChange = (e, idx = null) => {
    const { name, value, checked } = e.target;
    if (name === 'price') {
      let cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
      const [intPart, decPart] = cleaned.split('.');
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      const formatted = decPart !== undefined
        ? `${formattedInt}.${decPart.slice(0, 2)}`
        : formattedInt;
      setFormData(f => ({ ...f, price: formatted }));
    } else if (name === 'images') {
      const imgs = [...formData.images];
      imgs[idx] = value;
      setFormData(f => ({ ...f, images: imgs }));
    } else if (name === 'isFeatured') {
      setFormData(f => ({ ...f, isFeatured: checked }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  // Bullet handlers
  const addBullet = () =>
    setFormData(f => ({ ...f, description: [...f.description, ''] }));
  const removeBullet = idx =>
    setFormData(f => ({
      ...f,
      description: f.description.filter((_, i) => i !== idx),
    }));
  const handleBulletChange = (e, idx) => {
    const arr = [...formData.description];
    arr[idx] = e.target.value;
    setFormData(f => ({ ...f, description: arr }));
  };

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
      setFormData(f => ({ ...f, images: imgs }));
      toast.success('Image uploaded.');
    } catch {
      toast.error('Image upload failed.');
    }
  };

  // Toggle featured
  const toggleFeaturedInline = async (prod) => {
    try {
      await api.put(`/api/products/${prod._id}`, {
        isFeatured: !prod.isFeatured,
      });
      fetchProducts();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      toast.error('Name, price, stock & category are required.');
      return;
    }
    const discount = Math.max(0, parseFloat(formData.discount) || 0);
    const payload = {
      ...formData,
      description: formData.description
        .map(b => b.trim())
        .filter(Boolean)
        .join('\n• '),
      price: parseFloat(formData.price.replace(/,/g, '')),
      stock: parseInt(formData.stock, 10),
      discount,
      images: formData.images.filter(u => u.trim()),
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
        err.response?.data?.errors?.map(e => e.msg).join(', ') ||
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
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
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

          {/* Description as Bullets */}
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Description
            </label>
            {formData.description.map((text, idx) => (
              <div key={idx} className="flex items-center space-x-2 mt-2">
                <span className="text-neutral-500">•</span>
                <input
                  type="text"
                  value={text}
                  onChange={e => handleBulletChange(e, idx)}
                  className="block w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                {formData.description.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBullet(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBullet}
              className="mt-2 text-accent-500 hover:underline text-sm"
            >
              + Add bullet
            </button>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* … rest of your form fields unchanged … */}
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
      {/* … your table code unchanged … */}

      {/* Delete Confirmation */}
      {/* … your delete modal code unchanged … */}
    </div>
  );
}
