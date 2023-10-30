import {
  doc,
  getDoc,
} from "firebase/firestore";

import { useState } from "react";
import { useEffect } from "react";
import { db } from "../firebase";
import {  useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

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
    <div className="flex max-w-6xl mx-auto px-3  items-center">
        <div className="px-3">
          <div>
            <a href={`/user-public/${listing.userRef}`}>
            {userProfile.name}
            </a>
            
          </div>
          <div>{listing.review}</div>
        </div>
        <div className="px-12">
          <img src={listing.imgUrls[0]} className="h-12"/>
        </div>
      </div>
  );
}
