import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showValue = true 
}: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-0.5" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              !readonly ? 'cursor-pointer' : ''
            } transition-colors ${
              star <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};