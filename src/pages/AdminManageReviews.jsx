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
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import ReviewItemAdmin from "../components/ReviewItemAdmin";
import AutoComplete from "../components/AutoComplete";
import Datepicker from "tailwind-datepicker-react";
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default function AdminManageReviews() {
  const [reviewListings, setReviewListings] = useState(null);
  const [userListings, setUserListings] = useState(null);
  const [userSelected, setUserSelected] = useState("");
  const [userSelectedId, setUserSelectedId] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const [formDataFilter, setFormDataFilter] = useState({
    reviewStatus: searchParams.get("reviewStatus"),
    spamStatus: searchParams.get("spamStatus"),
    trollStatus: searchParams.get("trollStatus"),
    userN: searchParams.get("userName"),
  });
  const { spamStatus, reviewStatus, trollStatus, userN, } = formDataFilter;

  var dateFromData = new Date();
  if (searchParams.get("dateFrom") !== "") {
    dateFromData = searchParams.get("dateFrom");
  }
  
  const [dateFrom, setDateFrom] = useState(dateFromData);
  const [showFrom, setShowFrom] = useState(false);

  
  const handleChangeFrom = (selectedDate) => {
    setDateFrom(selectedDate);
    var x = document.getElementById("dateFrom");
    x.value = selectedDate;
  };
  const handleCloseFrom = (state) => {
    setShowFrom(state);
  };


  var dateToData = new Date();
  if (searchParams.get("dateTo") !== "") {
    dateToData = searchParams.get("dateTo");
  }
  const [dateTo, setDateTo] = useState(dateToData);
  const [showTo, setShowTo] = useState(false);



  const handleChangeTo = (selectedDate) => {
    setDateTo(selectedDate);
    var x = document.getElementById("dateTo");
    x.value = selectedDate;
  };
  const handleCloseTo = (state) => {
    setShowTo(state);
  };



  function onChangeFilter(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    // Files
    if (e.target.files) {
      setFormDataFilter((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    // Text/Boolean/Number
    if (!e.target.files) {
      setFormDataFilter((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  async function onSubmitFilter(e) {
    navigate(`/admin-manage-reviews`);
  }

  function getLastWeeksDate() {
    const now = new Date();
  
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 7,
    );
  }

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);

      try {
        const usersRef = collection(db, "users");
        let q = query(usersRef);
        let querySnap = await getDocs(q);
        let listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setUserListings(listings);

        // get reference
        const listingsRef = collection(db, "reviews");
        // create the query
        const constraints = [];
        let uselectedId = "";
        if (searchParams.get("userName")!=="") {
          uselectedId = "-1";
        }
        console.log(listings);
        for (const i in listings) {
          if (listings[i].data.name === searchParams.get("userName")) {
            uselectedId = listings[i].id;
            break;
          }
        }
        console.log(dateFrom);
        console.log(dateTo);
        
        if (searchParams.get("dateFrom") !== "") {
          
          const date = firebase.firestore.Timestamp.fromDate(new Date(searchParams.get("dateFrom")));
          constraints.push(where("timestamp", ">=", date));
        }
        
        if (searchParams.get("dateTo") !== "") {
          
          const date = firebase.firestore.Timestamp.fromDate(new Date(searchParams.get("dateTo")));
          constraints.push(where("timestamp", "<=", date));
        }

        if (uselectedId !== "") {
          constraints.push(where("userRef", "==", uselectedId));
        }

        if (searchParams.get("spamStatus") === "Spam") {
          constraints.push(where("reportedAsSpam", "==", true));
        }

        if (searchParams.get("spamStatus") === "NotSpam") {
          constraints.push(where("reportedAsSpam", "==", false));
        }

        if (searchParams.get("reviewStatus") === "Live") {
          constraints.push(where("isVisible", "==", true));
        }

        if (searchParams.get("reviewStatus") === "Deleted") {
          constraints.push(where("isVisible", "==", false));
        }

        if (searchParams.get("trollStatus") === "Troll") {
          constraints.push(where("trollDetected", "==", true));
        }

        if (searchParams.get("trollStatus") === "NonTroll") {
          constraints.push(where("trollDetected", "==", false));
        }

        q = query(
          listingsRef,
          ...constraints,
          orderBy("timestamp", "desc")
        );

        // execute the query
        querySnap = await getDocs(q);
        listings = [];
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

      setLoading(false);
    }
    fetchListings();
  }, []);

  function onChangeUSer(e) {
    setUserSelected(e);
    console.log(e);
  }
  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      <form
        onSubmit={onSubmitFilter}
        className="grid grid-cols-12 gap-4 px-3 max-w-6xl mx-auto mb-12 mt-4"
      >
        <h1 className="col-span-1">
          Spam
        </h1>
        <h1 className="col-span-1">
          Review 
        </h1>
        <h1 className="col-span-2">
          Troll Status
        </h1>
        <h1 className="col-span-4">
          Review User
        </h1>
        <h1 className="col-span-2">
          From Date
        </h1>
        <h1 className="col-span-2">
          To Date
        </h1>
        <div className="col-span-1">
          <select
            id="spamStatus"
            name="spamStatus"
            value={spamStatus}
            onChange={onChangeFilter}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            <option>All</option>
            <option>Spam</option>
            <option>NotSpam</option>
          </select>
        </div>
        <div className="col-span-1">
          <select
            id="reviewStatus"
            name="reviewStatus"
            value={reviewStatus}
            onChange={onChangeFilter}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            <option>All</option>
            <option>Deleted</option>
            <option>Live</option>
          </select>
        </div>
        <div className="col-span-2">
          <select
            id="trollStatus"
            name="trollStatus"
            value={trollStatus}
            onChange={onChangeFilter}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
          >
            <option>All</option>
            <option>Troll</option>
            <option>NonTroll</option>
          </select>
        </div>
        <div className="col-span-4">
          <AutoComplete
            options={userListings.map((x) => x.data.name)}
            //options={["test1","test2"]}
            value={userN}
            onChange={onChangeUSer}
          />
        </div>
        <div className="col-span-2">
            <Datepicker
              onChange={handleChangeFrom}
              show={showFrom}
              value={dateFrom ? new Date(dateFrom): getLastWeeksDate()} 
              setShow={handleCloseFrom}
            />
            <input type="hidden" name="dateFrom" id="dateFrom" value={dateFrom ? dateFrom : getLastWeeksDate()}></input>
          </div>
          <div className="col-span-2">
            <Datepicker
              onChange={handleChangeTo}
              value={dateTo ? new Date(dateTo): new Date()}
              show={showTo}
              setShow={handleCloseTo}
            />
            <input type="hidden" name="dateTo" id="dateTo"  value={dateTo ? dateTo: new Date()}></input>
          </div>
        <div className="col-start-12 col-span-1">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Filter
          </button>
        </div>
      </form>
            
      <div className="grid grid-cols-12 gap-4 px-3 max-w-6xl mx-auto mb-12">
        <div className="col-span-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            Reviews
          </h2>
        </div>
        {reviewListings && reviewListings.length > 0 && (
          <>
            {reviewListings.map((listing) => (
              <ReviewItemAdmin
                key={listing.id}
                listing={listing.data}
                id={listing.id}
              />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
