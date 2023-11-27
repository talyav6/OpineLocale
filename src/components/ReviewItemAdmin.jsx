import { doc, getDoc } from "firebase/firestore";

import { useState, useCallback } from "react";
import { useEffect } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import RatingStarsItemOnlyStars from "./RatingStarsItemOnlyStars";
import {
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";

export default function ReviewItemAdmin({ listing, id, onEdit, onDelete }) {
  const auth = getAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [formDataSpam, setFormDataSpam] = useState({
    spamReason: "Inappropriate Language",
  });
  const { spamReason } = formDataSpam;


  function onChangeSpam(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    // Files
    if (e.target.files) {
      setFormDataSpam((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    // Text/Boolean/Number
    if (!e.target.files) {
      setFormDataSpam((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }


  
  async function onSubmitSpam(e) {
    setLoading(true);

    const formDataSpamCopy = {
      ...formDataSpam,
      reportedAsSpam: true,
    };

    const docRef = doc(db, "reviews", id);
    await updateDoc(docRef, formDataSpamCopy);

    setLoading(false);
    toast.success("Reported as spam");
    navigate(0);
  }

  async function onReportAsNotSpam() {
    setLoading(true);

    const formDataCopy = {
      reportedAsSpam: false,
    };

    const docRef = doc(db, "reviews", id);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Reported as spam");
    navigate(`/business-public/${listing.businessId}`);
  }

  async function onDelete() {
    setLoading(true);

    const formDataCopy = {
      isVisible: false,
    };
    const docRef = doc(db, "reviews", id);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Review deleted");
    navigate(`/business-public/${listing.businessId}`);
  }

  async function onUnDelete() {
    setLoading(true);

    const formDataCopy = {
      isVisible: true,
    };
    const docRef = doc(db, "reviews", id);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Review undeleted");
    navigate(`/business-public/${listing.businessId}`);
  }

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
    <>
      <div className="col-span-12 grid grid-cols-12  shadow-md px-2 py-2">
        <div className="col-span-4">
          <a href={`/user-public/${listing.userRef}`}>
            {userProfile.name} </a>
            <p>Visit Date: {listing.review_date}</p>
            <p>Review Date: {listing.timestamp.toDate().toDateString()}</p>
            

          
          <RatingStarsItemOnlyStars {...listing} />

          <p>{listing.review}</p>
        </div>
        <div className="col-span-4 ">
          <Gallery
            photos={listing.imgUrls.map((imgUrl) => ({
              src: imgUrl,
              width: 1,
              height: 1,
              style: { height: 60, width: 60, padding: 5 },
            }))}
            onClick={openLightbox}
          />
          <ModalGateway>
            {viewerIsOpen ? (
              <Modal onClose={closeLightbox}>
                <Carousel
                  currentIndex={currentImage}
                  views={listing.imgUrls
                    .map((imgUrl) => ({ src: imgUrl, width: 1, height: 1 }))
                    .map((x) => ({
                      ...x,
                      srcset: x.srcSet,
                      caption: x.title,
                    }))}
                />
              </Modal>
            ) : null}
          </ModalGateway>
        </div>

        {!listing.reportedAsSpam && (
          <div className="col-span-2">
<>
                <form
                  onSubmit={onSubmitSpam}
                  className=" col-span-2 grid grid-cols-2  "
                >
                  <div className="col-span-2">
                    <select
                      id="spamReason"
                      name="spamReason"
                      value={spamReason}
                      onChange={onChangeSpam}
                      autocomplete="spamReason"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option>Inappropriate Language</option>
                      <option>Biased review</option>
                      <option>Review is not consistent with rating</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Report as Spam
                    </button>
                  </div>
                </form>
              </>
          </div>
        )}
        {listing.reportedAsSpam && (
          <div className="col-span-2">
            <p>Marked as spam</p>
            <p>{listing.spamReason}</p>
            <a
              onClick={onReportAsNotSpam}
              className="cursor-pointer text-orange-500"
            >
              This is not Spam
            </a>
          </div>
        )}

      <div className="col-span-1 px-2">
        
        {listing.trollDetected && (
          <p>Troll Detected</p>
        )}
      </div>


        
      {listing.isVisible && (
          <div className="col-span-1">
            <a
              onClick={onDelete}
              className="cursor-pointer text-orange-500"
            >
              Delete
            </a>
          </div>
        )}
        
        {!listing.isVisible && (
          <div className="col-span-1">
            <p>This review is deleted.</p>
            <a
              onClick={onUnDelete}
              className="cursor-pointer text-orange-500"
            >
              Undelete
            </a>
          </div>
        )}


        {listing.isReplied && (
          <div className="col-start-2 col-span-4">
            <h2 className="italic">
              Replied by business on{" "}
              {listing.replyDate.toDate().toLocaleString()}
            </h2>
            <p>"{listing.replyText}"</p>
          </div>
        )}
      </div>
    </>
  );
}
