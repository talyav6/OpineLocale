import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Search from "./pages/Search";
import SearchResult from "./pages/SearchResult";
import ReviewSubmit from "./pages/ReviewSubmit";
import EditUserProfile from "./pages/EditUserProfile";
import UserPublic from "./pages/UserPublic";
import CreateBusiness from "./pages/CreateBusiness";
import EditBusiness from "./pages/EditBusiness";
import BusinessPublic from "./pages/BusinessPublic";
import AdminManageReviews from "./pages/AdminManageReviews";


function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search-result/:keyword" element={<SearchResult />} />
          <Route path="admin-manage-reviews" element={<PrivateRoute />}>
            <Route path="/admin-manage-reviews" element={<AdminManageReviews />} />
          </Route>
          <Route path="review-submit" element={<PrivateRoute />}>
            <Route path="/review-submit/:businessId" element={<ReviewSubmit />} />
          </Route>
          <Route path="edit-user-profile" element={<PrivateRoute />}>
            <Route path="/edit-user-profile" element={<EditUserProfile />} />
          </Route>
          <Route path="/user-public/:userProfileId" element={<UserPublic />} />
          <Route path="business-create" element={<PrivateRoute />}>
            <Route path="/business-create" element={<CreateBusiness />} />
          </Route>
          <Route path="business-edit" element={<PrivateRoute />}>
            <Route path="/business-edit" element={<EditBusiness />} />
          </Route>
          <Route path="/business-public/:businessId" element={<BusinessPublic />} />
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;