import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Yeh component kisi bhi page pe use karo — Home, Products, Similar Products sab mein
const WishlistButton = ({ product, className = '', size = 16 }) => {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(product._id);

  const handleClick = (e) => {
    e.preventDefault();   // Link ke andar hoga to page navigate nahi karega
    e.stopPropagation();

    if (!user) {
      toast.error('Wishlist ke liye pehle login karo! 👆');
      navigate('/login');
      return;
    }

    const added = toggleWishlist(product);
    toast.success(added ? '❤️ Wishlist mein add ho gaya!' : '💔 Wishlist se hata diya');
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center transition-all duration-200 ${
        wishlisted
          ? 'text-red-500'
          : 'text-gray-400 hover:text-red-400'
      } ${className}`}
      title={wishlisted ? 'Wishlist se hatao' : 'Wishlist mein add karo'}
    >
      <Heart
        size={size}
        className={`transition-all duration-200 ${wishlisted ? 'fill-red-500 scale-110' : ''}`}
      />
    </button>
  );
};

export default WishlistButton;