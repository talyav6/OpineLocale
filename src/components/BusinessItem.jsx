import { useNavigate } from "react-router-dom";

export default function BusinessItem({ listing, id, onEdit, onDelete }) {
  const navigate = useNavigate();
  return (
    <div classNAme="mt-2 items-center">
        <div className="px-3">
          
          <div className="text-center">{listing.business_name}</div>
        </div>
        <div className="px-12">
          <img src={listing.imgUrls[0]} className="h-36" onClick={() => navigate(`/business-public/${id}`)}/>
        </div>
      </div>
  );
}
