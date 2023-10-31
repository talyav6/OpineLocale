
export default function RatingStarsItemTotalReviews( listing ) {
    let rating = 0;
    if (listing.total_number_of_ratings > 0) {
      rating = listing.sum_of_ratings / listing.total_number_of_ratings;
    }
    const yellowStars = [];
  
    for (let i = 0; i < rating; i++) {
      yellowStars.push(
        <svg
          className="w-4 h-4 text-yellow-300 mr-1"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 22 20"
          key={i}
        >
          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
        </svg>
      );
    }
    const grayStars = [];
  
    for (let i = rating; i < 5; i++) {
      grayStars.push(
        <svg
          className="w-4 h-4 text-gray-300 mr-1 dark:text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 22 20"
          key={i}
        >
          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
        </svg>
      );
    }
    return (
      <div className="flex items-center">
      {listing.total_number_of_ratings > 0 && (
        <>
          {yellowStars}
          {grayStars}
          <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {listing.total_number_of_ratings} Reviews
          </p>
        </>
      )}
      {listing.total_number_of_ratings == 0 && (
        <>
          
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No ratings
          </p>
        </>
      )}
    </div>
    );
  }
  