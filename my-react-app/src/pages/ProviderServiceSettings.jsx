import { useState, useEffect, useRef } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import AdminTopHeader from '../components/AdminTopHeader';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { MapPin, Clock, DollarSign, Users, FileText, Save, CheckCircle, ImagePlus, X } from 'lucide-react';

const ProviderServiceSettings = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [form, setForm]         = useState({});
  const [images, setImages]     = useState([]); // Store as { file, preview }
  const [existingImages, setExistingImages] = useState([]);
  const fileInputRef            = useRef(null);

  useEffect(() => {
    document.title = 'Service Settings | Provider Portal';
    api.get('/provider/profile')
      .then(res => {
        setForm({
          description:   res.data.description || '',
          address:       res.data.address || '',
          base_price:    res.data.base_price || 0,
          opening_time:  res.data.opening_time?.substring(0, 5) || '09:00',
          closing_time:  res.data.closing_time?.substring(0, 5) || '18:00',
          capacity:      res.data.capacity || 1,
        });
        
        if (res.data.gallery_images) {
           try {
             const gallery = typeof res.data.gallery_images === 'string' 
               ? JSON.parse(res.data.gallery_images) 
               : res.data.gallery_images;
             if (Array.isArray(gallery)) {
               setExistingImages(gallery);
             }
           } catch(e) {
             console.error("Gallery parse error:", e);
           }
        } else if (res.data.image) {
           setExistingImages([res.data.image]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - (existingImages.length + images.length);
    if (files.length > availableSlots) {
      alert(`You can only add ${availableSlots} more image(s). Max 4 images allowed.`);
      return;
    }
    const newImages = files.map(file => ({
      file: file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeExistingImage = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const removeNewImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      formData.append('existing_gallery', JSON.stringify(existingImages));
      images.forEach(img => {
        formData.append('images', img.file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4001/api/provider/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update provider profile.');
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const cardBg        = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const inputCls      = `w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'}`;
  const labelCls      = `block text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  const renderImageThumbnail = (src, onRemove) => (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-[4/3]">
      <img src={src} alt="Gallery" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button type="button" onClick={onRemove} className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen font-inter transition-colors duration-300" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        <AdminTopHeader 
            title="Service Settings"
            subtitle="Configure your service details and update business parameters"
        />

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />)}
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleSave} className={`rounded-3xl border p-8 ${cardBg}`}>
              
               {/* Gallery Section */}
               <div className="mb-8">
                <label className={labelCls}>Service Gallery (Max 4)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`}>
                      {renderImageThumbnail(`http://localhost:4001${src}`, () => removeExistingImage(i))}
                    </div>
                  ))}
                  {images.map((file, i) => (
                    <div key={`new-${i}`}>
                      {renderImageThumbnail(file.preview, () => removeNewImage(i))}
                    </div>
                  ))}
                  
                  {existingImages.length + images.length < 4 && (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed aspect-[4/3] transition-all cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 ${isDark ? 'border-slate-700 bg-slate-800/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    >
                      <ImagePlus className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Add Photo</span>
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/jpeg,image/png,image/webp,image/jpg" 
                  multiple 
                  className="hidden" 
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelCls}><MapPin className="inline w-3 h-3 mr-1" />Address</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)} className={inputCls} placeholder="Your service address" />
                </div>
                <div>
                  <label className={labelCls}><FileText className="inline w-3 h-3 mr-1" />Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Describe your service..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}><DollarSign className="inline w-3 h-3 mr-1" />Base Price (Rs.)</label>
                    <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Users className="inline w-3 h-3 mr-1" />Capacity</label>
                    <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} min="1" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}><Clock className="inline w-3 h-3 mr-1" />Opening Time</label>
                    <input type="time" value={form.opening_time} onChange={e => set('opening_time', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Clock className="inline w-3 h-3 mr-1" />Closing Time</label>
                    <input type="time" value={form.closing_time} onChange={e => set('closing_time', e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>

              {success && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-4 py-3 rounded-xl animate-in fade-in">
                  <CheckCircle className="w-5 h-5" /> Service settings successfully updated!
                </div>
              )}

              <button type="submit" disabled={saving}
                className={`mt-8 w-full py-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer ${saving ? 'opacity-60' : ''}`}>
                <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderServiceSettings;
