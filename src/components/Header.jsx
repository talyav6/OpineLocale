import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [pageState, setPageState] = useState("Login");
  // pageState is used to keep track of the current status of the loggedin user
  // it can have these values:
  // Login . When the header is set to show the login button (user is not logged in)
  // business-create : when a user is registered as a business but has not yet created the business profile page
  // business-edit : when a user is registered as a business and created the business profile page. (manage page)
  // admin: When a user is an admin
  // user: When a user is a regular user. (not a business profile)

  const [businessIdState, setBusinessIdState] = useState(null);
  // businessIdState stores the user id, this id is used to navigate to the business profile page

  const location = useLocation();
  const navigate = useNavigate();
  
  const auth = getAuth();
  // auth is used  to get the user credentials


  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setBusinessIdState(user.uid);
        const userRef = doc(db, "users", user.uid);
        // the role of the user is stroed in the users collection in firebase.

        const userSnap = getDoc(userRef).then((uitem) => {
          let role = "User";

          if (uitem.get("role") != null) {
            role = uitem.data().role;
            //console.log(role);
          }

          if (role === "Business") {
            // check to see if this business has already created the profile page
            const businessRef = doc(db, "businesses", user.uid);
            const businessSnap = getDoc(businessRef).then((snapshot) => {
              if (snapshot.data()) {
                setPageState("business-edit");
              } else {
                setPageState("business-create");
              }
            });
          } else if (role === "Admin") {
            setPageState("admin");
            console.log("admin");
          } else {
            setPageState("user");
          }
        });
      } else {
        setPageState("Login");
      }

      //console.log(pageState);

    });
  }, [auth]);


  function onLogout() { 
    auth.signOut();
    navigate("/");
  }


  function pathMatchRoute(route) {
    // this function is used to highlight the page name in the header
    if (route === location.pathname) {
      return true;
    }
  }


  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
        <img
            src="/logo1.png"
            alt="logo"
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
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

            {pageState == "admin" && (
              <>
                <li
                  className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent `}
                  onClick={() => navigate(`\admin-manage-reviews`)}
                >
                  Manage Reviews
                </li>
              </>
            )}

            {pageState == "business-edit" && (
              <>
                <li
                  className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                    pathMatchRoute(`/business-public/${businessIdState}`) && "!text-black !border-b-red-500"
                  }`}
                  onClick={() =>
                    navigate(`business-public/${businessIdState}`)
                  }
                >
                  Your Profile
                </li>
              </>
            )}
            {pageState == "user" && (
              <>
              <li
                  className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                    pathMatchRoute(`/user-public/${businessIdState}`) && "!text-black !border-b-red-500"
                  }`}
                  onClick={() => navigate(`/user-public/${businessIdState}`)}
                >
                  Your Profile
                </li>
                <li
                  className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                    pathMatchRoute(`/edit-user-profile`) && "!text-black !border-b-red-500"
                  }`}
                  onClick={() => navigate(`/edit-user-profile`)}
                >
                  Manage Your Profile
                </li>
              </>
            )}
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                (pathMatchRoute("/login") ||
                  pathMatchRoute("/business-edit") ||
                  pathMatchRoute("/business-create")) &&
                "!text-black !border-b-red-500"
              }`}
              onClick={() => navigate(`/${pageState}`)}
            >
              {pageState == "business-create" && "Create your Business"}
              {pageState == "business-edit" && <p>Manage your Business</p>}
              {pageState == "Login" && pageState}
            </li>
            {pageState != "Login" && (
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent `}
                onClick={onLogout}
              >
                Sign out
              </li>
            )}
          </ul>
        </div>
      </header>
    </div>
    
  );
}
