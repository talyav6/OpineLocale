import {
    doc,
    getDoc,
  } from "firebase/firestore";
  
  import { useState } from "react";
  import { useEffect } from "react";
  import { db } from "../firebase";
  import {  useNavigate } from "react-router-dom";
  import Spinner from "./Spinner";
  
  export default function UserProfileReviewItem({ listing, id, onEdit, onDelete }) {
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
      async function fetchBusiness() {
        
        const docRef = doc(db, "businesses", listing.businessId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBusiness(docSnap.data());
          setLoading(false);
        }
      }
      fetchBusiness();
    }, [listing.businessId]);
    if (loading) {
      return <Spinner />;
    }
    return (
      <div className="flex max-w-6xl mx-auto px-3 py-3 items-center">
          <div className="px-12">
            <img src={listing.imgUrls[0]} className="h-12"/>
          </div>
          <div className="px-3">
            <div>
            <a href={`/business-public/${listing.businessId}`}>
            <b>{business.business_name} ({listing.review_date})</b>
              </a>
            </div>
            <div>{listing.review}</div>
          </div>
  
        </div>
    );
  }
  