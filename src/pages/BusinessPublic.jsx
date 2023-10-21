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
import { getAuth } from "firebase/auth";
import ReviewItem from "../components/ReviewItem";


export default function BusinessPublic() {
  const [reviewListings, setReviewListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "reviews");
        // create the query
        const q = query(
          listingsRef,
          where("businessId", "==", params.businessId),
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
  const auth = getAuth();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      const docRef = doc(db, "businesses", params.businessId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBusiness(docSnap.data());
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [params.businessId]);
  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <diV className="flex justify-between max-w-6xl mx-auto px-3 py-3 items-center">
        <diV className="flex items-baseline ">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {business.business_name}
            </h1>
          </div>
          <div className="px-10">
            <h3>{reviewListings && reviewListings.length} Reviews</h3>
          </div>
        </diV>
        <diV>
          <button
            type="submit"
            className=" flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate(`/review-submit/${params.businessId}`)}
          >
            Leave a review
          </button>
        </diV>
      </diV>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <p>{business.business_type}</p>
      </div>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <p>{business.street_address}</p>
      </div>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <p>
          {business.region} {business.city} {business.postal_code}
        </p>
      </div>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <p>Phone: {business.phone_number}</p>
      </div>

      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <img src={business.imgUrls[0]} className="h-52" />
        <img src={business.imgUrls[1]} className="h-52" />
      </div>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <p>{business.description}</p>
      </div>
      <div className="flex justify-between max-w-6xl mx-auto px-3  items-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Reviews
        </h2>
      </div>
      {reviewListings && reviewListings.length > 0 && (



            <ul >
              {reviewListings.map((listing) => (
                <ReviewItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>

        )}

    </>
  );
}