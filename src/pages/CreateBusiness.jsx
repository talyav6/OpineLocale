import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, setDoc,collection, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreateBusiness() {
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
    keywords:"",
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

    if (images.length > 6) {
      setLoading(false);
      toast.error("maximum 6 images are allowed");
      return;
    }

    let geolocation = {};
    let location;
    
    let fullAddress =     street_address + " " + city + " " + region + " " + postal_code;
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
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
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
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }

    // this part is to upload all the image files to the system.
    // and the resulting image urls are stored in imgUrls variable
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    // extra fields added to the form
    // imgUrls: retrieved from the firebase storage app
    // geolocation: retrieved from geocoding api
    // timestamp : the time user has saved the form
    // keywords: keywords should converted from string to an array of strings splitted by the comma value
      // this is necessary for the search function to work.
      // userRef: this is the userid

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      keywords: keywords.toString().replace(/\s/g,"").split(","),
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
  }

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <section>
        <h1 className="text-3xl text-center mt-6 font-bold">
          Create your Business!
        </h1>
        <div className="flex justify-center flex-wrap items-center px-6 py-4 max-w-6xl mx-auto">
          <form onSubmit={onSubmit}>
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
                        <option>Hotel</option>
                        <option>Restaurant</option>
                        <option>Dr office</option>
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
                      for="cover-photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Business photos (you can upload upto 6 photos)
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label
                            for="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
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
                      Keywords (comma separated)
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
                  <div className="mt-2 flex items-center gap-x-3">
                    <svg
                      className="h-12 w-12 text-gray-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <button
                      type="button"
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Change
                    </button>
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
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
