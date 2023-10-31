import { useNavigate } from "react-router-dom";
import RatingStarsItem from "../components/RatingStarsItem";

export default function SearchBusinessItem({ listing, id, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="col-span-9  bg-white shadow-md px-2 py-2 grid grid-cols-9 gap-4">
      <div className="col-span-2 items-center">
        <img
          src={listing.imgUrls[0]}
          className="h-24 px-6"
          onClick={() => navigate(`/business-public/${id}`)}
        />
      </div>
      <div className="col-span-7">
        <div className="font-bold text-gray-900">{listing.business_name}</div>
        <div>
          <RatingStarsItem {...listing} />
        </div>
        <div className="">{listing.city} </div>
      </div>
    </div>
  );
}
