import { doc, getDoc } from "firebase/firestore";

import { useState, useCallback } from "react";
import { useEffect } from "react";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import RatingStarsItemOnlyStars from "../components/RatingStarsItemOnlyStars";
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

export default function ReviewItem({ listing, id, onEdit, onDelete }) {
  const auth = getAuth();
  const [formData, setFormData] = useState({
    replyText: "",
  });
  const { replyText } = formData;

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyReview, setReplyReview] = useState(false);
  const [businessOwner, setBusinessOwner] = useState(false);
  const navigate = useNavigate();
  const openReview = () => {
    setReplyReview(!replyReview);
  };
  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    // Text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formDataCopy = {
      ...formData,
      isReplied: true,
      replyDate: serverTimestamp(),
    };

    const docRef = doc(db, "reviews", id);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Review replied");
    navigate(`/business-public/${listing.businessId}`);
  }

  async function onReportAsSpam() {
    setLoading(true);

    const formDataCopy = {
      reportedAsSpam: true,
    };

    const docRef = doc(db, "reviews", id);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Reported as spam");
    navigate(`/business-public/${listing.businessId}`);
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

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user && user.uid == listing.businessId) {
        setBusinessOwner(true);
      } else {
        setBusinessOwner(false);
      }
    });
  }, [auth]);

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <div className="col-span-12 grid grid-cols-12  shadow-md px-2 py-2">
        <div className="col-span-4">
          <a href={`/user-public/${listing.userRef}`}>
            {userProfile.name} ({listing.review_date})
          </a>
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
        {businessOwner && (
          <>
            <div className="col-start-10 col-span-1">
              <a onClick={openReview} className="cursor-pointer text-green-600">Reply</a>
            </div>
            {!listing.reportedAsSpam && (
              <div className="col-start-11 col-span-2">
                <a onClick={onReportAsSpam} className="cursor-pointer text-orange-500">Report As Spam</a>
              </div>
            )}
            {listing.reportedAsSpam && (
              <div className="col-start-11 col-span-2">
                <a onClick={onReportAsNotSpam} className="cursor-pointer text-orange-500">This is not Spam</a>
              </div>
            )}
          </>
        )}

        {listing.isReplied && (
          <div className="col-start-2 col-span-4">
            <h2 className="italic">Replied by business on {listing.replyDate.toDate().toLocaleString()}</h2>
            <p>"{listing.replyText}"</p>
          </div>
        )}

        {replyReview && businessOwner && (
          <>
            <form
              onSubmit={onSubmit}
              className=" col-span-12 grid grid-cols-12 mt-4 "
            >
              <div className="col-span-6">
                <textarea
                  id="replyText"
                  name="replyText"
                  rows="3"
                  placeholder="Write your reply here!"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={replyText}
                  onChange={onChange}
                ></textarea>
              </div>

              <div className="col-start-6 col-span-1">
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Reply
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
