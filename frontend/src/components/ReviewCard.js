// frontend/src/components/ReviewCard.js
import React from 'react';

const ReviewCard = ({ review }) => {
    return (
        <div className="border-t pt-4 mt-4">
            <p className="font-semibold">{review.userId.name}</p>
            <p className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
            <p className="text-gray-700">{review.reviewText}</p>
        </div>
    );
};

export default ReviewCard;