export default function ReviewItem({ listing, id, onEdit, onDelete }) {
    return (
      <div className="flex max-w-6xl mx-auto px-3  items-center">
          <div className="px-3">
            <diV>
              <p>user1:</p>
            </diV>
            <diV>{listing.review}</diV>
          </div>
          <div className="px-12">
            <img src={listing.imgUrls[0]} className="h-12"/>
          </div>
        </div>
    );
  }