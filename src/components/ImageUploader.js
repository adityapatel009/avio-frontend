import { useState, useRef } from 'react';
import { Upload, Link, X, Image, Loader, CheckCircle, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// ─── Single Image Uploader ────────────────────────────────
export const ImageUploader = ({ value, onChange, label = 'Image' }) => {
  const [mode, setMode] = useState('url'); // 'url' | 'upload'
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUrlSave = () => {
    if (!urlInput.trim()) return toast.error('URL daalo!');
    onChange(urlInput.trim());
    toast.success('Image URL set ho gayi!');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image 5MB se chhoti honi chahiye!');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('crownbay_token');
      const res = await axios.post('http://localhost:5000/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      onChange(res.data.url);
      setUrlInput(res.data.url);
      toast.success('Image upload ho gayi! ✅');
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm text-gray-400 font-medium block">{label}</label>}

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
      {mode === 'url' && (
        <div className="flex gap-2">
          <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-gold transition text-sm" />
          <button type="button" onClick={handleUrlSave}
            className="bg-gold text-black px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gold-light transition shrink-0">
            Set
          </button>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div>
          <input type="file" ref={fileRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-border hover:border-gold/50 rounded-xl p-4 flex flex-col items-center gap-2 transition disabled:opacity-50">
            {uploading ? (
              <><Loader size={24} className="text-gold animate-spin" /><span className="text-gray-400 text-sm">Uploading...</span></>
            ) : (
              <><Upload size={24} className="text-gray-500" /><span className="text-gray-400 text-sm">Click karke image choose karo</span><span className="text-gray-600 text-xs">JPG, PNG, WEBP • Max 5MB</span></>
            )}
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border group">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => { onChange(''); setUrlInput(''); }}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <X size={18} className="text-white" />
          </button>
          <div className="absolute top-1 right-1">
            <CheckCircle size={14} className="text-green-400" />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Multiple Images Uploader ─────────────────────────────
export const MultiImageUploader = ({ value = [], onChange, max = 5 }) => {
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
    toast.success('Image add ho gayi!');
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
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const newUrls = res.data.images.map(i => i.url);
      onChange([...value, ...newUrls]);
      toast.success(`${newUrls.length} images upload ho gayi! ✅`);
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveImage = (idx, dir) => {
    const arr = [...value];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400 font-medium">
          Product Images <span className="text-gray-600">({value.length}/{max})</span>
        </label>
        {value.length > 0 && (
          <span className="text-xs text-gray-500">Pehli image = main image</span>
        )}
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
      )}

      {/* Upload Mode */}
      {mode === 'upload' && value.length < max && (
        <div>
          <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleFilesUpload} className="hidden" />
          <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
            className="w-full border-2 border-dashed border-border hover:border-gold/50 rounded-xl p-4 flex flex-col items-center gap-2 transition disabled:opacity-50">
            {uploading ? (
              <><Loader size={24} className="text-gold animate-spin" /><span className="text-gray-400 text-sm">Uploading...</span></>
            ) : (
              <><Upload size={24} className="text-gray-500" /><span className="text-gray-400 text-sm">Click karke images choose karo (multiple select kar sakte ho)</span><span className="text-gray-600 text-xs">JPG, PNG, WEBP • Max 5MB each</span></>
            )}
          </button>
        </div>
      )}

      {/* Image Grid Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {value.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
              <img src={img} alt={`img-${idx}`} className="w-full h-full object-cover" />

              {/* Main badge */}
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  MAIN
                </div>
              )}

              {/* Hover controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button type="button" onClick={() => moveImage(idx, -1)}
                    className="w-6 h-6 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white text-xs">
                    ←
                  </button>
                )}
                <button type="button" onClick={() => removeImage(idx)}
                  className="w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-lg flex items-center justify-center">
                  <X size={12} className="text-white" />
                </button>
                {idx < value.length - 1 && (
                  <button type="button" onClick={() => moveImage(idx, 1)}
                    className="w-6 h-6 bg-white/20 hover:bg-white/40 rounded-lg flex items-center justify-center text-white text-xs">
                    →
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {value.length < max && (
            <button type="button" onClick={() => mode === 'upload' ? fileRef.current.click() : null}
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