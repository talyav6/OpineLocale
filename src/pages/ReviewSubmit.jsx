import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import Datepicker from "tailwind-datepicker-react";
import { Rating } from "react-simple-star-rating";
import FileSelector from "../components/FileSelector";

export default function ReviewSubmit() {
  const [imgAfterCrop0, setImgAfterCrop0] = useState(null);
  const [imgAfterCrop1, setImgAfterCrop1] = useState(null);
  const [imgAfterCrop2, setImgAfterCrop2] = useState(null);
  const [imgAfterCrop3, setImgAfterCrop3] = useState(null);
  const [imgAfterCrop4, setImgAfterCrop4] = useState(null);
  const [imgAfterCrop5, setImgAfterCrop5] = useState(null);

  const auth = getAuth();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    review: "",
    images: {},
    isReplied: false,
    reportedAsSpam: false,
    isVisible: true,
    replyText: "",
    reportReason: "",
    trollDetected: false,
    spamReason: "",
  });
  const {
    title,
    review,
    images,
    isReplied,
    reportedAsSpam,
    isVisible,
    replyText,
  } = formData;

  const [rate, setRate] = useState(0);
  const [reviewDate, setReviewDate] = useState(new Date());

  // Catch Rating value
  const handleRating = (r) => {
    setRate(r);
  };
  const [show, setShow] = useState(false);
  const handleChange = (selectedDate) => {
    setReviewDate(selectedDate);
    console.log(selectedDate);
  };
  const handleClose = (state) => {
    setShow(state);
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



    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();

        const filename = `${auth.currentUser.uid}-${uuidv4()}`;
        const storageRef = ref(storage, filename);

        uploadString(storageRef, image, "data_url").then((snapshot) => {
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        });
      });
    }

    var imgUrls = [];
    if (imgAfterCrop0) {
      imgUrls.push(await storeImage(imgAfterCrop0));
    }
    if (imgAfterCrop1) {
      imgUrls.push(await storeImage(imgAfterCrop1));
    }
    if (imgAfterCrop2) {
      imgUrls.push(await storeImage(imgAfterCrop2));
    }
    if (imgAfterCrop3) {
      imgUrls.push(await storeImage(imgAfterCrop3));
    }
    if (imgAfterCrop4) {
      imgUrls.push(await storeImage(imgAfterCrop4));
    }
    if (imgAfterCrop5) {
      imgUrls.push(await storeImage(imgAfterCrop5));
    }

    const formDataCopy = {
      ...formData,
      rating: rate,
      review_date: reviewDate.toDateString(),
      imgUrls,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
      businessId: params.businessId,
    };
    delete formDataCopy.images;
    const docRef = await addDoc(collection(db, "reviews"), formDataCopy);
    const businessData = {
      total_number_of_ratings: 1 + business.total_number_of_ratings,
      sum_of_ratings: parseInt(rate) + business.sum_of_ratings,
    };
    const businessRef = doc(db, "businesses", params.businessId);
    await updateDoc(businessRef, businessData);
    setLoading(false);
    toast.success("Review created");
    navigate(`/business-public/${params.businessId}`);
  }

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
    
      <div className="grid grid-cols-12 gap-4 px-3 max-w-6xl mx-auto mb-12 mt-4">
      <div className="col-span-12 grid grid-cols-12 bg-white  max-h-3xl my-auto ">
          <div className="col-span-12 grid grid-cols-6 px-4 py-4 mx-4 items-center">
            <div className="col-span-6 mb-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl ">
                Tell us Your Thoughts!
              </h1>
            </div>
            <div className="col-span-3">
              <img src={business.imgUrls[0]} className="h-36" />
            </div>
            <div className="col-span-3">
              <p>{business.business_name}</p>
              <p>{business.street_address}</p>
              <p>
                {business.region} {business.city} {business.postal_code}
              </p>
            </div>
          </div>
        </div>
        <form
          onSubmit={onSubmit}
          className="col-span-12 grid grid-cols-12  bg-white px-2 py-2 "
        >
          <div className="col-span-12">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              How do you rate your experience out of 5 stars?
            </label>
          </div>
          <div className="col-span-12">
            <Rating onClick={handleRating} />
          </div>
          <div className="col-span-12 mt-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Briefly write your experience
            </label>
          </div>
          <div className="col-span-12">
            <input
              type="text"
              name="title"
              id="title"
              value={title}
              onChange={onChange}
              placeholder="Give a title to your review here!"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="col-span-12">
            <textarea
              id="review"
              name="review"
              rows="3"
              placeholder="Write your review here!"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={review}
              onChange={onChange}
            ></textarea>
          </div>
          <div className="col-span-12 mt-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              When was your visit?
            </label>
          </div>
          <div className="col-span-12">
            <Datepicker
              onChange={handleChange}
              show={show}
              setShow={handleClose}
            />
          </div>

          <div className="col-span-12 mt-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Add photos(optional)
            </label>
          </div>


          <div className="col-span-full bg-stone-200 ">
                    <FileSelector sCrop={setImgAfterCrop0} img="/noimage.png" />
                  </div>
                  <div className="col-span-full bg-stone-50">
                    <FileSelector sCrop={setImgAfterCrop1} img="/noimage.png" />
                  </div>
                  <div className="col-span-full bg-stone-200">
                    <FileSelector sCrop={setImgAfterCrop2} img="/noimage.png" />
                  </div>
                  <div className="col-span-full bg-stone-50">
                    <FileSelector sCrop={setImgAfterCrop3} img="/noimage.png" />
                  </div>
                  <div className="col-span-full bg-stone-200">
                    <FileSelector sCrop={setImgAfterCrop4} img="/noimage.png" />
                  </div>
                  <div className="col-span-full bg-stone-50">
                    <FileSelector sCrop={setImgAfterCrop5} img="/noimage.png" />
                  </div>


          <div className="col-span-12">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
        
      </div>
    </>
  );
}
