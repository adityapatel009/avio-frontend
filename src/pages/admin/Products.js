import { useState, useEffect, useRef } from 'react';
import {
  Plus, Edit, Trash2, X, Search, Check, Package,
  Upload, Link, Loader, Image
} from 'lucide-react';
import { getProducts, adminAddProduct, adminUpdateProduct, adminDeleteProduct } from '../../utils/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const categories = [
  'Women', 'Men', 'Electronics', 'Home Decor',
  'Beauty', 'Footwear', 'Jewellery & Accessories',
  'Sports & Fitness', 'Kids', 'Toys', 'Books', 'Food', 'Other'
];

const SIZE_TYPES = [
  { value: 'none',      label: 'No Size (Electronics, Home Decor etc.)' },
  { value: 'free',      label: 'Free Size / One Size' },
  { value: 'clothing',  label: 'Clothing (S / M / L / XL / XXL)' },
  { value: 'innerwear', label: 'Innerwear (XS / S / M / L / XL / XXL)' },
  { value: 'bra',       label: 'Bra Size (28A / 30B / 32C... etc.)' },
  { value: 'bottom',    label: 'Bottom/Pants (28 / 30 / 32 / 34 / 36 / 38)' },
  { value: 'footwear',  label: 'Footwear (UK 5 / 6 / 7 / 8 / 9 / 10)' },
];

const SIZE_OPTIONS = {
  clothing:  ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  innerwear: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  bra:       ['28A','28B','28C','30A','30B','30C','30D','32A','32B','32C','32D','34A','34B','34C','34D','36B','36C','36D','S','M','L','XL','Free Size'],
  bottom:    ['26','28','30','32','34','36','38','40','S','M','L','XL','XXL','2XL'],
  footwear:  ['UK 4','UK 5','UK 6','UK 7','UK 8','UK 9','UK 10','UK 11'],
  free:      ['Free Size'],
  none:      [],
};

// ─── SIZE SELECTOR ────────────────────────────────────────
const SizeSelector = ({ sizeType, selected, onChange }) => {
  const options = SIZE_OPTIONS[sizeType] || [];
  if (options.length === 0) return null;
  const toggle = (size) => {
    if (selected.includes(size)) onChange(selected.filter(s => s !== size));
    else onChange([...selected, size]);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-gray-400 text-xs uppercase tracking-wider">Available Sizes ({selected.length} selected)</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onChange([...options])} className="text-xs text-gold hover:underline">All</button>
          <button type="button" onClick={() => onChange([])} className="text-xs text-gray-400 hover:underline">Clear</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(size => (
          <button key={size} type="button" onClick={() => toggle(size)}
            className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition ${
              selected.includes(size) ? 'bg-gold text-black border-gold' : 'border-border text-gray-300 hover:border-gold/50'
            }`}>{size}</button>
        ))}
      </div>
    </div>
  );
};

// ─── MULTI IMAGE UPLOADER — URL + CLOUDINARY ─────────────
const MultiImageUploader = ({ value = [], onChange, max = 5 }) => {
  const [mode, setMode] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const addUrl = () => {
    if (!urlInput.trim()) return toast.error('URL daalo!');
    if (value.length >= max) return toast.error(`Maximum ${max} images allowed!`);
    if (value.includes(urlInput.trim())) return toast.error('Yeh URL already add hai!');
    onChange([...value, urlInput.trim()]);
    setUrlInput('');
  };

  const handleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (value.length + files.length > max) return toast.error(`Maximum ${max} images allowed!`);
    setUploading(true);
    try {
      const token = localStorage.getItem('crownbay_token');
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const res = await axios.post('http://localhost:5000/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      onChange([...value, ...res.data.images.map(i => i.url)]);
      toast.success(`${res.data.images.length} image(s) upload ho gayi! ✅`);
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => onChange(value.filter((_, i) => i !== idx));
  const moveImage = (idx, dir) => {
    const arr = [...value];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-gray-400 text-xs uppercase tracking-wider">
          Product Images <span className="text-gray-600">({value.length}/{max})</span>
        </label>
        {value.length > 0 && <span className="text-xs text-gray-500">Pehli image = main image</span>}
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-secondary border border-border rounded-xl p-1 w-fit">
        <button type="button" onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${mode === 'url' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
          <Link size={12} /> URL Paste
        </button>
        <button type="button" onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${mode === 'upload' ? 'bg-gold text-black' : 'text-gray-400 hover:text-white'}`}>
          <Upload size={12} /> Upload
        </button>
      </div>

      {/* URL Mode */}
      {mode === 'url' && value.length < max && (
        <div>
          <div className="flex gap-2">
            <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
            <button type="button" onClick={addUrl}
              className="bg-gold text-black px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition shrink-0 flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-1">💡 Meesho image pe right-click → "Copy image address" → yahan paste karo</p>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && value.length < max && (
        <div>
          <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleFilesUpload} className="hidden" />
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-border hover:border-gold/50 rounded-xl p-5 flex flex-col items-center gap-2 transition disabled:opacity-50">
            {uploading
              ? <><Loader size={24} className="text-gold animate-spin" /><span className="text-gray-400 text-sm">Uploading to Cloudinary...</span></>
              : <><Upload size={24} className="text-gray-500" /><span className="text-gray-400 text-sm">Click karke images choose karo</span><span className="text-gray-600 text-xs">JPG, PNG, WEBP • Max 5MB each • Multiple select kar sakte ho</span></>
            }
          </button>
        </div>
      )}

      {/* Image Grid Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-2 mt-2">
          {value.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
              <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">MAIN</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button type="button" onClick={() => moveImage(idx, -1)}
                    className="w-6 h-6 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white text-xs">←</button>
                )}
                <button type="button" onClick={() => removeImage(idx)}
                  className="w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-lg flex items-center justify-center">
                  <X size={12} className="text-white" />
                </button>
                {idx < value.length - 1 && (
                  <button type="button" onClick={() => moveImage(idx, 1)}
                    className="w-6 h-6 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white text-xs">→</button>
                )}
              </div>
            </div>
          ))}
          {value.length < max && (
            <button type="button" onClick={() => mode === 'upload' && fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-gold/50 flex flex-col items-center justify-center gap-1 transition">
              <Plus size={18} className="text-gray-500" />
              <span className="text-gray-600 text-[10px]">Add</span>
            </button>
          )}
        </div>
      )}

      {value.length === 0 && (
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <Image size={14} />
          <span>Koi image nahi add ki gayi abhi tak</span>
        </div>
      )}
    </div>
  );
};

// ─── PRODUCT FORM MODAL ───────────────────────────────────
const ProductForm = ({ editProduct, onClose, onSave }) => {
  const getInitialForm = () => {
    if (editProduct) return {
      name: editProduct.name,
      description: editProduct.description || '',
      images: editProduct.images || [],   // ← array now, not string
      category: editProduct.category,
      sizeType: editProduct.sizeType || 'none',
      availableSizes: editProduct.availableSizes || [],
      meeshoPrice: editProduct.meeshoPrice || '',
      sellingPrice: editProduct.sellingPrice,
      originalPrice: editProduct.originalPrice,
      stock: editProduct.stock,
      tags: editProduct.tags?.join(', ') || '',
      isFeatured: editProduct.isFeatured || false,
      isNewArrival: editProduct.isNewArrival || false,
      isTrending: editProduct.isTrending || false,
    };
    return {
      name: '', description: '', images: [], category: 'Women',  // ← array
      sizeType: 'none', availableSizes: [],
      meeshoPrice: '', sellingPrice: '', originalPrice: '',
      stock: '', tags: '',
      isFeatured: false, isNewArrival: false, isTrending: false,
    };
  };

  const [form, setForm] = useState(getInitialForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const profit = form.sellingPrice && form.meeshoPrice
    ? Number(form.sellingPrice) - Number(form.meeshoPrice) : 0;

  const handleSizeTypeChange = (newType) => {
    setForm(f => ({
      ...f,
      sizeType: newType,
      availableSizes: newType === 'free' ? ['Free Size'] : newType === 'none' ? [] : f.availableSizes,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sellingPrice || !form.stock)
      return toast.error('Name, price aur stock zaroori hai!');
    if (form.images.length === 0)
      return toast.error('Kam se kam ek image add karo!');
    setSaving(true);
    try {
      const payload = {
        ...form,
        // images already array hai — no split needed
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        meeshoPrice: Number(form.meeshoPrice),
        sellingPrice: Number(form.sellingPrice),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        availableSizes: form.sizeType === 'none' ? [] : form.availableSizes,
      };
      if (editProduct) {
        await adminUpdateProduct(editProduct._id, payload);
        toast.success('Product update ho gaya! ✅');
      } else {
        await adminAddProduct(payload);
        toast.success('Product add ho gaya! ✅');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error aaya!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Package size={20} className="text-gold" />
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center hover:bg-border transition">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'sizes', label: 'Sizes' },
            { id: 'pricing', label: 'Pricing & Stock' },
            { id: 'media', label: 'Images & Tags' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs md:text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id ? 'border-gold text-gold' : 'border-transparent text-gray-400 hover:text-white'
              }`}>
              {tab.label}
              {tab.id === 'media' && form.images.length > 0 && (
                <span className="ml-1 bg-gold text-black text-xs rounded-full px-1.5">{form.images.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5">

          {/* ── BASIC INFO ── */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Product Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Women Blue Slim Fit Jeans"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Product description..." rows={3}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition resize-none" />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Product Badges</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'isFeatured', label: '⭐ Featured' },
                    { key: 'isNewArrival', label: '🆕 New Arrival' },
                    { key: 'isTrending', label: '🔥 Trending' },
                  ].map(badge => (
                    <label key={badge.key}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition ${
                        form[badge.key] ? 'border-gold bg-gold/10 text-gold' : 'border-border text-gray-400 hover:border-gold/50'
                      }`}>
                      <input type="checkbox" checked={form[badge.key]}
                        onChange={e => setForm({ ...form, [badge.key]: e.target.checked })} className="hidden" />
                      {form[badge.key] && <Check size={12} />}
                      <span className="text-sm">{badge.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SIZES ── */}
          {activeTab === 'sizes' && (
            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Size Type *</label>
                <div className="space-y-2">
                  {SIZE_TYPES.map(type => (
                    <label key={type.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        form.sizeType === type.value ? 'border-gold bg-gold/10' : 'border-border hover:border-gold/40'
                      }`}>
                      <input type="radio" name="sizeType" value={type.value}
                        checked={form.sizeType === type.value}
                        onChange={() => handleSizeTypeChange(type.value)} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        form.sizeType === type.value ? 'border-gold' : 'border-gray-500'
                      }`}>
                        {form.sizeType === type.value && <div className="w-2 h-2 bg-gold rounded-full" />}
                      </div>
                      <span className={`text-sm ${form.sizeType === type.value ? 'text-gold font-semibold' : 'text-gray-300'}`}>
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {form.sizeType !== 'none' && form.sizeType !== 'free' && (
                <div className="bg-secondary border border-border rounded-xl p-4">
                  <SizeSelector sizeType={form.sizeType} selected={form.availableSizes}
                    onChange={sizes => setForm({ ...form, availableSizes: sizes })} />
                </div>
              )}
              {form.sizeType === 'free' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                  <p className="text-green-400 text-sm font-semibold">✅ Free Size / One Size set hai</p>
                </div>
              )}
              {form.sizeType === 'none' && (
                <div className="bg-secondary border border-border rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-sm">Is product mein size selection nahi hoga</p>
                </div>
              )}
              {form.availableSizes.length > 0 && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Preview — Customer ko dikhega:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.availableSizes.map(size => (
                      <div key={size} className="px-3 py-1.5 rounded-xl border border-border text-white text-sm bg-secondary">{size}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRICING ── */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'meeshoPrice', label: 'Meesho Price (Hidden) *', placeholder: '250' },
                  { key: 'sellingPrice', label: 'Selling Price *', placeholder: '450' },
                  { key: 'originalPrice', label: 'Original Price (MRP)', placeholder: '599' },
                  { key: 'stock', label: 'Stock *', placeholder: '50' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">{f.label}</label>
                    <input type="number" value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
                  </div>
                ))}
              </div>
              {profit !== 0 && (
                <div className={`rounded-xl p-4 border ${profit > 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className="text-gray-400 text-xs mb-1">Estimated Profit per unit</p>
                  <p className={`font-bold text-2xl ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit > 0 ? '+' : ''}₹{profit}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── MEDIA — URL + CLOUDINARY UPLOAD ── */}
          {activeTab === 'media' && (
            <div className="space-y-5">
              <MultiImageUploader
                value={form.images}
                onChange={(imgs) => setForm({ ...form, images: imgs })}
                max={5}
              />
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="jeans, women, denim, slim fit"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.split(',').map(s => s.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-gray-300">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-border shrink-0">
          <button onClick={onClose}
            className="flex-1 border border-border text-gray-300 py-2.5 rounded-xl hover:border-gold transition text-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-gold text-black py-2.5 rounded-xl font-bold hover:bg-gold-light transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving...</>
              : <><Check size={16} /> {editProduct ? 'Update Product' : 'Add Product'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ADMIN PRODUCTS ──────────────────────────────────
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selected, setSelected] = useState([]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await getProducts({ limit: 100 });
      setProducts(data.products);
    } catch { toast.error('Products load nahi hue!'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Product delete karna chahte ho?')) return;
    try { await adminDeleteProduct(id); toast.success('Product delete ho gaya!'); fetchProducts(); }
    catch { toast.error('Delete nahi hua!'); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`${selected.length} products delete karna chahte ho?`)) return;
    try {
      await Promise.all(selected.map(id => adminDeleteProduct(id)));
      toast.success(`${selected.length} products delete ho gaye!`);
      setSelected([]); fetchProducts();
    } catch { toast.error('Bulk delete failed!'); }
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSelectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p._id));

  let filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !categoryFilter || p.category === categoryFilter);
  if (sortBy === 'price_low') filtered = [...filtered].sort((a, b) => a.sellingPrice - b.sellingPrice);
  else if (sortBy === 'price_high') filtered = [...filtered].sort((a, b) => b.sellingPrice - a.sellingPrice);
  else if (sortBy === 'stock_low') filtered = [...filtered].sort((a, b) => a.stock - b.stock);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Products</h1>
          <p className="text-gray-400 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={() => { setEditProduct(null); setShowForm(true); }}
          className="bg-gold text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-light transition text-sm">
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition" />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gold transition">
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="stock_low">Low Stock First</option>
        </select>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-gold/10 border border-gold/30 rounded-xl px-4 py-2.5">
          <span className="text-gold text-sm font-semibold">{selected.length} selected</span>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-red-400 text-sm border border-red-400/30 px-3 py-1 rounded-lg hover:border-red-400 transition">
            <Trash2 size={14} /> Delete Selected
          </button>
          <button onClick={() => setSelected([])} className="text-gray-400 text-sm ml-auto hover:text-white transition">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><Package size={40} className="mx-auto mb-3 opacity-50" /><p>Koi product nahi mila</p></div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={toggleSelectAll}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                selected.length === filtered.length && filtered.length > 0 ? 'bg-gold border-gold' : 'border-border hover:border-gold'
              }`}>
              {selected.length === filtered.length && filtered.length > 0 && <Check size={12} className="text-black" />}
            </button>
            <span className="text-gray-500 text-xs">Select All ({filtered.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => {
              const profit = product.sellingPrice - (product.meeshoPrice || 0);
              const discount = product.originalPrice > product.sellingPrice
                ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100) : 0;
              const isSelected = selected.includes(product._id);
              return (
                <div key={product._id}
                  className={`bg-card border rounded-2xl overflow-hidden transition group ${isSelected ? 'border-gold' : 'border-border hover:border-gold/40'}`}>
                  <div className="relative">
                    <img src={product.images[0]} alt={product.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button onClick={() => toggleSelect(product._id)}
                      className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition ${isSelected ? 'bg-gold border-gold' : 'bg-black/40 border-white/50 hover:border-gold'}`}>
                      {isSelected && <Check size={12} className="text-black" />}
                    </button>
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {discount > 0 && <span className="bg-gold text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{discount}%</span>}
                      {product.isFeatured && <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">⭐</span>}
                      {product.isTrending && <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">🔥</span>}
                      {product.isNewArrival && <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">NEW</span>}
                    </div>
                    {product.stock < 5 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white text-xs text-center py-1">⚠️ Low Stock: {product.stock}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-gray-400 text-xs mb-0.5">{product.category}</p>
                    <p className="text-white font-semibold text-sm line-clamp-2 mb-1">{product.name}</p>
                    {product.availableSizes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.availableSizes.slice(0, 4).map(s => (
                          <span key={s} className="text-xs bg-secondary border border-border px-1.5 py-0.5 rounded text-gray-300">{s}</span>
                        ))}
                        {product.availableSizes.length > 4 && <span className="text-xs text-gray-500">+{product.availableSizes.length - 4}</span>}
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gold font-bold">₹{product.sellingPrice}</span>
                        {product.originalPrice > product.sellingPrice && (
                          <span className="text-gray-500 text-xs line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs">Stock: {product.stock}</span>
                    </div>
                    {product.meeshoPrice > 0 && (
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block mb-2 ${profit > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        Profit: {profit > 0 ? '+' : ''}₹{profit}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => { setEditProduct(product); setShowForm(true); }}
                        className="flex-1 border border-border text-gray-300 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 hover:border-gold hover:text-gold transition">
                        <Edit size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(product._id)}
                        className="flex-1 border border-red-500/20 text-red-400 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 hover:border-red-500 transition">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showForm && (
        <ProductForm
          editProduct={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSave={() => { setShowForm(false); setEditProduct(null); fetchProducts(); }}
        />
      )}
    </div>
  );
};

export default AdminProducts;