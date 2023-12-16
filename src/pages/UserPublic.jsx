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
          where("isVisible", "==", true),
          orderBy("timestamp", "desc")
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
      <div className="grid grid-cols-12 gap-4 px-3 max-w-6xl mx-auto mb-12 mt-4">
        <div className="col-span-12 grid grid-cols-12 bg-white px-8 py-8">
          <div className="col-span-2">
            <img
              src={userProfile.photoUrls[0] ? userProfile.photoUrls[0] : "/nophoto.png"}
              className=" w-42 h-36 "
            />
          </div>
          <div className="col-span-8"style={{ paddingLeft: '20px', paddingTop: '35px'}}>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {userProfile.name}
            </h1>
            <p>{userProfile.bio}</p>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-12 bg-white px-8 py-8">
          <div className="col-span-12">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              {reviewListings && reviewListings.length} Reviews
            </h2>
          </div>
          <div className="col-span-12 grid grid-cols-12 items-center ">
            {reviewListings && reviewListings.length > 0 && (
              <>
                {reviewListings.map((listing) => (
                  <UserProfileReviewItem
                    key={listing.id}
                    listing={listing.data}
                    id={listing.id}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
