import { doc, getDoc } from "firebase/firestore";

import { useState } from "react";
import { useEffect } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import RatingStarsItemOnlyStars from "../components/RatingStarsItemOnlyStars";
export default function UserProfileReviewItem({
  listing,
  id,
  onEdit,
  onDelete,
}) {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchBusiness() {
      const docRef = doc(db, "businesses", listing.businessId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBusiness(docSnap.data());
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [listing.businessId]);
  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <div className="col-span-2 py-4">
        <img src={listing.imgUrls[0]} className="h-24" />
      </div>
      <div className="col-span-10">
        <div>
          <a href={`/business-public/${listing.businessId}`}>
            <b>
              {business.business_name} ({listing.review_date})
            </b>
          </a>
          <RatingStarsItemOnlyStars {...listing} /> 
        </div>
        <div>{listing.review}</div>
      </div>
    </>
  );
}
