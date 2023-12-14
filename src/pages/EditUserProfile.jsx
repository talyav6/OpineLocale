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
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import FileSelector from "../components/FileSelector";

export default function EditUserProfile() {
  const [imgAfterCrop0, setImgAfterCrop0] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    photoUrls: {},
    images: {},
  });
  const { name, bio,     photoUrls, images } = formData;

  useEffect(() => {
    setLoading(true);
    async function fetchUserProfile() {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        setFormData({ ...docSnap.data() });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("setUserProfile does not exist");
      }
    }
    fetchUserProfile();
  }, [navigate, auth.currentUser.uid]);

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

    var photoUrlsTemp = [];
    if (imgAfterCrop0) {
      photoUrlsTemp.push(await storeImage(imgAfterCrop0));
    } else if (photoUrls[0]) {
      photoUrlsTemp.push(photoUrls[0]);
    }

    const formDataCopy = {
      ...formData,
      photoUrls : photoUrlsTemp,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;
    const docRef = doc(db, "users", auth.currentUser.uid);

    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("User Profile Edited");
    navigate(`/user-public/${docRef.id}`);
  }
  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <section>
        <h1 className="text-3xl text-center mt-3 font-bold">Your Profile</h1>
        <div className="flex justify-center flex-wrap items-center px-6 py-4 max-w-6xl mx-auto">
          <form onSubmit={onSubmit}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      for="business_name"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Your Name
                    </label>
                    <div class="mt-2">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={onChange}
                        autocomplete="name"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div class="col-span-full">
                    <label
                      for="cover-photo"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Profile Photo
                    </label>
                  </div>
                  <div className="col-span-full bg-stone-200 ">
                    {photoUrls[0] ? (
                      <FileSelector
                        sCrop={setImgAfterCrop0}
                        img={photoUrls[0]}
                        imgState="image-crop"
                      />
                    ) : (
                      <FileSelector
                        sCrop={setImgAfterCrop0}
                        img="/nophoto.png"
                        
                      />
                    )}
                  </div>
                  <div class="col-span-full">
                    <label
                      for="description"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Bio
                    </label>
                    <div class="mt-2">
                      <textarea
                        id="bio"
                        name="bio"
                        rows="3"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={bio}
                        onChange={onChange}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="submit"
                class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
