import { Star } from "lucide-react";

export const renderPerformanceRating = (rating: number) => {
        const stars = Math.round(rating);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-3 h-3 ${
                        star <= stars 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                    }`}
                />
            ))}
            <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
        </div>
    );
};