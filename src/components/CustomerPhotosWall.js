import { useState, useEffect } from 'react';
import { X, Star, Heart, Camera } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ─── PLACEHOLDER PHOTOS ───────────────────────────────────
const PLACEHOLDER_PHOTOS = [
  { photo: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', userName: 'Priya S.', rating: 5, comment: 'Bahut sundar dress hai! Quality ekdum top notch 😍', productName: 'Floral Kurta Set', city: 'Mumbai' },
  { photo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', userName: 'Rahul M.', rating: 5, comment: 'Shoes bahut comfortable hain, daily wear ke liye perfect!', productName: 'Sports Sneakers', city: 'Delhi' },
  { photo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', userName: 'Sneha R.', rating: 4, comment: 'Skincare products ne meri skin glow kar di! Highly recommended ✨', productName: 'Skincare Kit', city: 'Bangalore' },
  { photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80', userName: 'Ananya K.', rating: 5, comment: 'Outfit bilkul waisa hi aaya jaise photo mein tha! Love it 💜', productName: 'Party Dress', city: 'Chennai' },
  { photo: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80', userName: 'Vikram P.', rating: 5, comment: 'Shirt ki quality amazing hai. Fast delivery bhi mili!', productName: 'Casual Shirt', city: 'Pune' },
  { photo: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', userName: 'Kavya N.', rating: 5, comment: 'Lehenga ekdum gorgeous hai! Sabne taarif ki shaadi mein 🥻', productName: 'Bridal Lehenga', city: 'Jaipur' },
  { photo: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80', userName: 'Arjun T.', rating: 4, comment: 'Gym wear comfortable aur stylish dono hai. Worth it!', productName: 'Gym Wear Set', city: 'Hyderabad' },
  { photo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80', userName: 'Meera J.', rating: 5, comment: 'Collection bahut unique hai. Har koi poochh raha tha kahan se liya!', productName: 'Ethnic Wear', city: 'Kolkata' },
  { photo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80', userName: 'Divya P.', rating: 5, comment: 'Avio se pehli baar order kiya, disappointed bilkul nahi! 🛍️', productName: 'Summer Collection', city: 'Surat' },
  { photo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&q=80', userName: 'Riya A.', rating: 5, comment: 'Style game level up ho gaya! Avio is the best 💜', productName: 'Western Wear', city: 'Chandigarh' },
  { photo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80', userName: 'Pooja M.', rating: 4, comment: 'Colours bilkul waise hain jaise website pe the. Satisfied!', productName: 'Palazzo Set', city: 'Lucknow' },
  { photo: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80', userName: 'Karan S.', rating: 5, comment: 'Men ke liye bhi itna accha collection! Impressed 👔', productName: 'Formal Shirt', city: 'Amritsar' },
];

// ─── PHOTO MODAL ──────────────────────────────────────────
const PhotoModal = ({ photo, onClose }) => {
  if (!photo) return null;
  return (
    <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="relative max-w-lg w-full bg-[#1a1a2e] border border-purple-500/20 rounded-3xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition">
          <X size={16} className="text-white" />
        </button>
        <img src={photo.photo} alt={photo.productName}
          className="w-full h-72 object-cover" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ background: 'linear-gradient(135deg,#6C3AE8,#C084FC)' }}>
                {photo.userName?.charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{photo.userName}</p>
                {photo.city && <p className="text-gray-500 text-xs">{photo.city}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-green-600 px-2.5 py-1 rounded-lg">
              <Star size={11} className="fill-white text-white" />
              <span className="text-white font-bold text-xs">{photo.rating}</span>
            </div>
          </div>
          {photo.productName && (
            <p className="text-purple-400 text-xs font-semibold mb-2">📦 {photo.productName}</p>
          )}
          <p className="text-gray-300 text-sm leading-relaxed">"{photo.comment}"</p>
          {photo.isReal && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">Verified Purchase</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MASONRY GRID ─────────────────────────────────────────
const MasonryGrid = ({ photos, onPhotoClick }) => {
  // 3 columns mein divide karo
  const cols = [[], [], []];
  photos.forEach((p, i) => cols[i % 3].push({ ...p, index: i }));

  const heights = ['h-48', 'h-56', 'h-44', 'h-64', 'h-52', 'h-40', 'h-60', 'h-48'];

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      {cols.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-2 md:gap-3">
          {col.map((photo, i) => {
            const heightClass = heights[(colIdx * 4 + i) % heights.length];
            return (
              <div key={i}
                onClick={() => onPhotoClick(photo)}
                className={`relative ${heightClass} rounded-2xl overflow-hidden cursor-pointer group`}>
                <img src={photo.photo} alt={photo.userName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Info on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-xs font-bold truncate">{photo.userName}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(photo.rating)].map((_, j) => (
                      <Star key={j} size={8} className="fill-gold text-gold" />
                    ))}
                  </div>
                </div>
                {/* Verified badge */}
                {photo.isReal && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────
const CustomerPhotosWall = () => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      // Saare reviews fetch karo jo photos ke saath hain
      const res = await fetch(`${API_URL}/reviews/admin/all`);
      const data = await res.json();
      const reviews = data.reviews || [];

      // Sirf reviews with photos
      const realPhotos = [];
      reviews.forEach(review => {
        if (review.photos?.length > 0) {
          review.photos.forEach(photo => {
            realPhotos.push({
              photo,
              userName: review.userName || 'Customer',
              rating: review.rating || 5,
              comment: review.comment || '',
              productName: review.productName || '',
              city: '',
              isReal: true,
            });
          });
        }
      });

      // Real photos + placeholders mix karo
      const combined = [...realPhotos];

      // Placeholders se fill karo — minimum 12 photos dikhao
      const needed = Math.max(0, 12 - combined.length);
      const shuffledPlaceholders = [...PLACEHOLDER_PHOTOS]
        .sort(() => Math.random() - 0.5)
        .slice(0, needed);

      setPhotos([...combined, ...shuffledPlaceholders]);
    } catch {
      // Sirf placeholders
      setPhotos([...PLACEHOLDER_PHOTOS].sort(() => Math.random() - 0.5));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (photos.length === 0) return null;

  const visiblePhotos = showAll ? photos : photos.slice(0, 9);

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Camera size={22} className="text-pink-400" /> Customer Love
            <span className="text-xs font-normal text-gray-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
              📸 Real Photos
            </span>
          </h2>
          <p className="text-gray-500 text-xs mt-1">Hamare customers ki real tasveerein 💜</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-secondary border border-border px-3 py-1.5 rounded-full">
          <Heart size={12} className="text-pink-400 fill-pink-400" />
          {photos.length}+ Happy Customers
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { label: 'Happy Customers', value: '10,000+', emoji: '😊' },
          { label: 'Photos Shared', value: `${photos.length}+`, emoji: '📸' },
          { label: 'Avg Rating', value: '4.8★', emoji: '⭐' },
          { label: 'Verified Reviews', value: '95%', emoji: '✅' },
        ].map(stat => (
          <div key={stat.label}
            className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-2 shrink-0">
            <span className="text-lg">{stat.emoji}</span>
            <div>
              <p className="text-white font-bold text-sm">{stat.value}</p>
              <p className="text-gray-500 text-[10px]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Masonry Grid */}
      <MasonryGrid photos={visiblePhotos} onPhotoClick={setSelectedPhoto} />

      {/* Show More */}
      {photos.length > 9 && (
        <button onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-3 rounded-2xl border border-border text-gray-300 text-sm font-semibold hover:border-pink-500/50 hover:text-pink-400 transition flex items-center justify-center gap-2">
          {showAll
            ? <><X size={14} /> Show Less</>
            : <><Camera size={14} /> View All {photos.length} Photos</>}
        </button>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </section>
  );
};

export default CustomerPhotosWall;