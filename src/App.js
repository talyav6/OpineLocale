import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Search from "./pages/Search";
import ReviewSearch from "./pages/ReviewSearch";
import SearchResult from "./pages/SearchResult";
import ReviewSubmit from "./pages/ReviewSubmit";
import UserAdmin from "./pages/UserAdmin";
import UserPublic from "./pages/UserPublic";
import BusinessAdmin from "./pages/BusinessAdmin";
import BusinessPublic from "./pages/BusinessPublic";
import Settings from "./pages/Settings";
import Recommendation from "./pages/Recommendation";
import Map from "./pages/Map";





function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/review-search" element={<ReviewSearch />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search-result" element={<SearchResult />} />
          <Route path="/review-submit" element={<ReviewSubmit />} />
          <Route path="/user-admin" element={<UserAdmin />} />
          <Route path="/user-public" element={<UserPublic />} />
          <Route path="/business-admin" element={<BusinessAdmin />} />
          <Route path="/business-public" element={<BusinessPublic />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/recommendation" element={<Recommendation />} />
          <Route path="/map" element={<Map />} />
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