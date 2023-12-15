import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import {
  addDoc,
  setDoc,
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import FileSelector from "../components/FileSelector";

export default function CreateBusiness() {
  const [imgAfterCrop0, setImgAfterCrop0] = useState(null);
  const [imgAfterCrop1, setImgAfterCrop1] = useState(null);
  const [imgAfterCrop2, setImgAfterCrop2] = useState(null);
  const [imgAfterCrop3, setImgAfterCrop3] = useState(null);
  const [imgAfterCrop4, setImgAfterCrop4] = useState(null);
  const [imgAfterCrop5, setImgAfterCrop5] = useState(null);

  const [photoAfterCrop0, setPhotoAfterCrop0] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  // this is to use the geocoding api or not

  const [loading, setLoading] = useState(false);
  // this is to activate the spinner , when the page is busy the spinner is activated, when it is done, spinner is stopped.

  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    street_address: "",
    city: "",
    region: "",
    postal_code: "",
    phone_number: "",
    description: "",
    keywords: "",
    first_name: "",
    last_name: "",
    latitude: 0,
    longitude: 0,
    images: {},
  });
  const {
    business_name,
    business_type,
    street_address,
    city,
    region,
    postal_code,
    phone_number,
    description,
    keywords,
    first_name,
    last_name,
    latitude,
    longitude,
    images,
  } = formData;

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

    let geolocation = {};
    let location;

    let fullAddress =
      street_address + " " + city + " " + region + " " + postal_code;
    // this is the address to be sent to the geocoding api

    // get the coordinates of the address from the geocoding api
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${fullAddress}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );
      const data = await response.json();
      console.log(data);
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location = data.status === "ZERO_RESULTS" && undefined;

      if (location === undefined) {
        setLoading(false);
        toast.error("please enter a correct address");
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    // this function is used to upload an image to our firebase storage system.

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

    var photoUrls = [];
    if (photoAfterCrop0) {
      photoUrls.push(await storeImage(photoAfterCrop0));
    }


    if (imgUrls.length < 2) {
      setLoading(false);
      toast.error("you must upload at least 2 images");
      return;
    }
    const formDataCopy = {
      ...formData,
      imgUrls,
      photoUrls,
      geolocation,
      timestamp: serverTimestamp(),
      keywords: keywords.toString().replace(/\s/g, "").split(","),
      userRef: auth.currentUser.uid,
      sum_of_ratings: 0,
      total_number_of_ratings: 0,
    };
    delete formDataCopy.images;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;

    // insert this data to the businesses collection
    const docRef = doc(collection(db, "businesses"), auth.currentUser.uid);

    // setDoc is used to create a new doc
    await setDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Business created");
    
    navigate(`/business-public/${docRef.id}`);
    window.location.reload(false);
  }

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <section>
        <div className="bg-[#fffffe] flex justify-center flex-wrap items-center px-6 py-4 max-w-7xl mx-auto">
          <form onSubmit={onSubmit}>
          <h1 className="text-3xl text-center mt-6 font-bold">
          Create your Business!
          </h1>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      for="business_name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Business Name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="business_name"
                        name="business_name"
                        value={business_name}
                        onChange={onChange}
                        autocomplete="business_name"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      for="business_type"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Business Type
                    </label>
                    <div className="mt-2">
                      <select
                        id="business_type"
                        name="business_type"
                        value={business_type}
                        onChange={onChange}
                        autocomplete="business_type"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      >
                        <option>Doctor's office</option>
                        <option>Hotel</option>
                        <option>Law Office</option>
                        <option>Restaurant</option>
                        <option>Shop</option>
                        <option>Store</option>

                      </select>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      for="street_address"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Street address
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="street_address"
                        id="street_address"
                        value={street_address}
                        onChange={onChange}
                        autocomplete="street_address"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      for="city"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      City
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={city}
                        onChange={onChange}
                        autocomplete="address-level2"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      for="region"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      State / Province
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="region"
                        id="region"
                        value={region}
                        onChange={onChange}
                        autocomplete="address-level1"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      for="postal_code"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      ZIP / Postal code
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="postal_code"
                        id="postal_code"
                        value={postal_code}
                        onChange={onChange}
                        autocomplete="postal_code"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      for="phone-number"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Phone Number
                    </label>
                    <div className="mt-2">
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="text"
                        value={phone_number}
                        onChange={onChange}
                        autocomplete="phone_number"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label
                      for="description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Description of the place/amenities
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={description}
                        onChange={onChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-span-full">
                    <label
                      for="description"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Keywords (Comma separated)
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="keywords"
                        name="keywords"
                        rows="3"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={keywords}
                        onChange={onChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="col-span-full">
                    <label
                      for="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Business photos (You can upload up to 6 photos)
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
                </div>
              </div>

              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base font-semibold leading-7 text-gray-900">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Your personal information will not be displayed on your
                  business profile.
                </p>

                <div className="col-span-full">
                  <label
                    for="photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Photo
                  </label>
                  <div className="col-span-full bg-stone-200 ">
                    <FileSelector sCrop={setPhotoAfterCrop0} img="/nophoto.png" />
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      for="first_name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      First name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="first_name"
                        id="first_name"
                        value={first_name}
                        onChange={onChange}
                        autocomplete="given-name"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      for="last_name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Last name
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="last_name"
                        id="last_name"
                        value={last_name}
                        onChange={onChange}
                        autocomplete="family-name"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="submit"
                className="col-span-1 rounded-md bg-[#637a94] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#556a7e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#637a94]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
