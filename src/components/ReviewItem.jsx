import {
  doc,
  getDoc,
} from "firebase/firestore";

import { useState } from "react";
import { useEffect } from "react";
import { db } from "../firebase";
import {  useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import RatingStarsItemOnlyStars from "../components/RatingStarsItemOnlyStars";

export default function ReviewItem({ listing, id, onEdit, onDelete }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchUserProfile() {
      
      const docRef = doc(db, "users", listing.userRef);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, [listing.userRef]);
  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="col-span-12 grid grid-cols-12">
        <div className="col-span-4">
          
            <a href={`/user-public/${listing.userRef}`}>{userProfile.name}</a>
            <RatingStarsItemOnlyStars {...listing} /> 
            
          
          <p>{listing.review}</p>
        </div>
        <div className="col-span-4">
          <img src={listing.imgUrls[0]} className="h-12"/>
        </div>
      </div>
  );
}
