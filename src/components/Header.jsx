import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [pageState, setPageState] = useState("Login");
  const [businessIdState, setBusinessIdState] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        
        setBusinessIdState(user.uid);   
        const userRef = doc(db, "users", user.uid);
        const userSnap = getDoc(userRef).then((uitem) => {
          let role = "User";

          if(uitem.get("role") != null) {
            role = uitem.data().role;
          };

          if (role == "Business") {
            const businessRef = doc(db, "businesses", user.uid);
            const businessSnap = getDoc(businessRef).then((snapshot) => {

              if (snapshot.data()) {
                  setPageState("business-edit");        
              } else {
                setPageState("business-create");        
              }
            });
              
            
          } else {
            setPageState("user");        
          }
        
      });
      } else {
        setPageState("Login");
      }
      
    });
  }, [auth]);
  function onLogout() {
    auth.signOut();
    navigate("/");
  }
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>Logo</div>
        <div>
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/") && "!text-black !border-b-red-500"
              }`}
              onClick={() => navigate("/")}
            >
              Home
            </li>
            {pageState=="business-edit" &&
            <>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent `}
                onClick={() => navigate(`business-public\\${businessIdState}`)}
              >
              Your Profile
            </li>
            </>
            }
            {pageState=="user" &&
            <>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent `}
                onClick={() => navigate(`\edit-user-profile`)}
              >
              Your Profile
            </li>
            </>
            }
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                (pathMatchRoute("/login") ||
                pathMatchRoute("/business-edit") || 
                  pathMatchRoute("/business-create")) &&
                "!text-black !border-b-red-500"
              }`}
              

                onClick={() => navigate(`/${pageState}`)}
              
            >
              {pageState=="business-create" && "Create your Business"}
              {pageState=="business-edit" && <p>Manage your Business</p>}
              {pageState=="Login" && pageState}
            </li>
            {pageState!="Login" &&
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent `}
              onClick={onLogout}
            >
              Sign out
              
            </li>
            }
          </ul>
        </div>
      </header>
    </div>
  );
}
