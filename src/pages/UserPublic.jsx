import {
  doc,
  collection,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { useState } from "react";
import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import UserProfileReviewItem from "../components/UserProfileReviewItem";


export default function UserPublic() {
  const [reviewListings, setReviewListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "reviews");
        // create the query
        const q = query(
          listingsRef,
          where("userRef", "==", params.userProfileId),
          orderBy("timestamp", "desc"),
          //limit(4)
        );
        // execute the query
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setReviewListings(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      const docRef = doc(db, "users", params.userProfileId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, [params.userProfileId]);
  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <div className="flex justify-between max-w-6xl mx-auto px-3 py-3 items-center">
        <div className="flex items-baseline ">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {userProfile.name}
            </h1>
          </div>
          <div className="px-10">
            <h3>{reviewListings && reviewListings.length} Reviews</h3>
          </div>
        </div>
        
      </div>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <p>{userProfile.bio}</p>
      </div>
      

      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <img src={userProfile.photoUrls[0]} className="h-52" />
            </div>
      
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Reviews
        </h2>
      </div>
      {reviewListings && reviewListings.length > 0 && (



            <ul >
              {reviewListings.map((listing) => (
                <UserProfileReviewItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>

        )}

    </>
  )
}
