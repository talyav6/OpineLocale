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
import RatingStarsItemTotalReviews from "../components/RatingStarsItemTotalReviews";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper";
import "swiper/css/bundle";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function BusinessPublic() {
  const [reviewListings, setReviewListings] = useState(null);
  SwiperCore.use([Autoplay, Navigation, Pagination]);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const listingsRef = collection(db, "reviews");
        // create the query
        const q = query(
          listingsRef,
          where("businessId", "==", params.businessId),
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
    <main>
      <div className="grid grid-cols-12 gap-4 px-3 max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-12 col-span-12 mt-2 items-baseline">
          <div className="col-span-9 ">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {business.business_name}
            </h1>

            <RatingStarsItemTotalReviews {...business} />
          </div>

          <button
            type="submit"
            className="col-span-3 w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate(`/review-submit/${params.businessId}`)}
          >
            Leave a review
          </button>
        </div>

        <div className="col-span-12">
          <p>{business.business_type}</p>
          <p>{business.street_address}</p>
          <p>
            {business.region} {business.city} {business.postal_code}
          </p>
          <p>Phone: {business.phone_number}</p>
          <Swiper
            slidesPerView={1}
            navigation
            pagination={{ type: "progressbar" }}
            effect="fade"
            modules={[EffectFade]}
            autoplay={{ delay: 3000 }}
          >
            {business.imgUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative w-full overflow-hidden h-[300px]"
                  style={{
                    background: `url(${business.imgUrls[index]}) center no-repeat`,
                    backgroundSize: "cover",
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="col-span-12">
          <p>{business.description}</p>
        </div>
        <div className="col-span-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Reviews
          </h2>
        </div>
        {reviewListings && reviewListings.length > 0 && (
          <>
            {reviewListings.map((listing) => (
              <ReviewItem
                key={listing.id}
                listing={listing.data}
                id={listing.id}
              />
            ))}
          </>
        )}

        <div className="col-span-12">
          <div className="w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2">
            <MapContainer
              center={[45.42690022258507, -75.6898153883481]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[45.42690022258507, -75.6898153883481]}>
                <Popup>{business.street_address}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
