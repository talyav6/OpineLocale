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
  uploadBytesResumable,
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

export default function ReviewSubmit() {
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
   });
  const { title, review, images,   isReplied,
    reportedAsSpam,
    isVisible,
    replyText } = formData;

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

    if (images.length > 6) {
      setLoading(false);
      toast.error("maximum 6 images are allowed");
      return;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

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
        <form
          onSubmit={onSubmit}
          className="col-span-6 grid grid-cols-6  bg-white px-2 py-2 "
        >
          <div className="col-span-6">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              How do you rate your experience out of 5 stars?
            </label>
          </div>
          <div className="col-span-6">
            <Rating onClick={handleRating} />
          </div>
          <div className="col-span-6 mt-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Briefly write your experience
            </label>
          </div>
          <div className="col-span-6">
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
          <div className="col-span-6">
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
          <div className="col-span-6 mt-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              When was your visit?
            </label>
          </div>
          <div className="col-span-6">
            <Datepicker
              onChange={handleChange}
              show={show}
              setShow={handleClose}
            />
          </div>

          <div className="col-span-6 mt-2">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Add photos(optional)
            </label>
          </div>
          <div className="col-span-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    id="images"
                    onChange={onChange}
                    accept=".jpg,.png,.jpeg"
                    multiple
                    required
                    className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>

          <div className="col-span-6">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
        <div className="col-span-6 grid grid-cols-6 bg-white  max-h-3xl my-auto ">
          <div className="col-span-6 grid grid-cols-6 px-4 py-4 mx-4 items-center">
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
      </div>
    </>
  );
}
