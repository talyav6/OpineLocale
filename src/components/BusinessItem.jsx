import { useNavigate } from "react-router-dom";
import RatingStarsItem from "../components/RatingStarsItem";

export default function BusinessItem({ listing, id, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="col-span-3 items-center bg-white shadow-md px-2 py-2">
      <div className="font-bold text-gray-900">{listing.business_name}</div>

      <div>
      <RatingStarsItem {...listing} />
      </div>
      <div className="mt-2">
        <img
          src={listing.imgUrls[0]}
          className="h-80 w-96 object-cover"
          onClick={() => navigate(`/business-public/${id}`)}
        />
      </div>
    </div>
  );
}
