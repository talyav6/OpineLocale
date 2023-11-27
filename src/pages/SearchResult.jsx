import {
  doc,
  collection,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  startAt,
} from "firebase/firestore";

import { useState } from "react";
import { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import SearchBusinessItem from "../components/SearchBusinessItem";

export default function SearchResult() {
  const [businessListings, setBusinessListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        // get reference
        const businessesRef = collection(db, "businesses");
        // create the query

        const q = query(
          businessesRef,
          //where("description", "==", params.keyword),
          where("keywords", "array-contains", params.keyword),

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
        setBusinessListings(listings);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    keyword: params.keyword,
  });
  const { keyword } = formData;
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
    navigate(`/search-result/${formData.keyword}`);
  }

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <div className="grid grid-cols-9 gap-4 px-6 max-w-6xl mx-auto ">
        <form
          onSubmit={onSubmit}
          className="col-span-9 grid grid-cols-9 gap-4 mt-4 bg-white py-4"
        >
          <input
            type="text"
            name="keyword"
            id="keyword"
            value={keyword}
            onChange={onChange}
            className="col-start-3 col-span-4 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />

          <button
            type="submit"
            className="col-span-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Search
          </button>
        </form>


      {businessListings && businessListings.length > 0 && (
        <>
          {businessListings.map((listing) => (
            <SearchBusinessItem
              key={listing.id}
              listing={listing.data}
              id={listing.id}
            />
          ))}
        </>
      )}
            </div>
    </>
  );
}
