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

import { useState, useCallback } from "react";
import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReviewItem from "../components/ReviewItem";
import RatingStarsItemTotalReviews from "../components/RatingStarsItemTotalReviews";
import SwiperCore, {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper";
import "swiper/css/bundle";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";


import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";

export default function BusinessPublic() {
  const [reviewListings, setReviewListings] = useState(null);
  // reviewListing is used to store the reviews for a business.


  SwiperCore.use([Autoplay, Navigation, Pagination]);
  useEffect(() => {
    async function fetchListings() {
      try {
        
        const listingsRef = collection(db, "reviews");
        // create a query that selects the reviews of a business.
        // reviews are selected if they are visible
        // reviews are sorted by their creation time
        const q = query(
          listingsRef,
          where("businessId", "==", params.businessId),
          where("isVisible", "==", true),
          orderBy("timestamp", "desc")
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

        // Load the reviews into the reviewListing array
        setReviewListings(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);
  
  const params = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [role, setRole] = useState(null);
  // role variable is used to manage the reply buttons in the review section
  // Guest : not logged in
  // User: logged in but not business
  // Business


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = getDoc(userRef).then((uitem) => {
          let role = "User";

          if(uitem.get("role") != null) {
            setRole(uitem.data().role);
          } else {
            setRole("User");  
          }
        
      });
      } else {
        setRole("Guest");
      }
      
    });
  }, [auth]);

  useEffect(() => {
    async function fetchBusiness() {

      // Load the business document into the business variable
      const docRef = doc(db, "businesses", params.businessId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBusiness(docSnap.data());
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [params.businessId]);


  // these constants are used to control the react images 
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      <div className="bg-[#fffffe] grid grid-cols-12 gap-4 px-3 max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-12 col-span-12 mt-2 items-baseline">
          <div className="col-span-9 ">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {business.business_name}
            </h1>

            <RatingStarsItemTotalReviews {...business} />
          </div>
          {role != "Business" &&
          <button
            type="submit"
            className="col-span-3 w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate(`/review-submit/${params.businessId}`)}
          >
            Leave a review
          </button>
          }
        </div>

        <div className="col-span-12">
          <p>{business.business_type}</p>
          <p>{business.street_address}</p>
          <p>
            {business.region} {business.city} {business.postal_code}
          </p>
          <p>Phone: {business.phone_number}</p>
          
          <div >
      <Gallery photos={business.imgUrls.map((imgUrl) => ({src: imgUrl, width:3, height:2} ) ) } onClick={openLightbox} />
      <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              currentIndex={currentImage}
              
              views={business.imgUrls.map((imgUrl) => ({src: imgUrl, width:1, height:1} ) ) .map(x => ({
                ...x,
                srcset: x.srcSet,
                caption: x.title,
                
              }))}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>

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
        {reviewListings && reviewListings.length == 0 && (
          <>
            <div className="col-span-12 grid grid-cols-12">
              <div className="col-span-4">
                <p>
                  No review.{" "}
                  <a
                    className="text-blue-600"
                    href={`/review-submit/${params.businessId}`}
                  >
                    {" "}
                    {role != "Business" &&
                    <>Be the first one to leave a review.</>
                    }
                  </a>
                </p>
              </div>
            </div>
          </>
        )}
        <div className="col-span-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Location
          </h2>
        </div>
        <div className="col-span-12">
          <div className="w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2">
            <MapContainer
              center={[business.geolocation.lat, business.geolocation.lng]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[business.geolocation.lat, business.geolocation.lng]}
              >
                <Popup>{business.street_address}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
