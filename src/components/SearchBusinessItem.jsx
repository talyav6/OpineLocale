import { useNavigate } from "react-router-dom";

export default function SearchBusinessItem({ listing, id, onEdit, onDelete }) {
  const navigate = useNavigate();
  return (
    <div classNAme="mt-2 flex items-center">
        <div >
          
          <div className="text-center">{listing.business_name}</div>
          <div className="text-center">{listing.sum_of_ratings} stars {listing.total_number_of_ratings} Reviews</div>
          <div className="text-center">{listing.city}</div>
        </div>
        <div >
          <img src={listing.imgUrls[0]} className="h-36" onClick={() => navigate(`/business-public/${id}`)}/>
        </div>
      </div>
  );
}
