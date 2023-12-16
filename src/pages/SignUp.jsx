import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photoUrls: [],
    role: "",
  });
  const { name, email, password,role,photoUrls } = formData;
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e) {
    e.preventDefault();

    try {
      const auth = getAuth();

      // The user is registered first in the Authantication module of the firebase.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


      updateProfile(auth.currentUser, {
        displayName: name,
      });

      // the user is also registered in the firestore Database under the users collection.
      // The role of this user ("User","Admin","Business") is stored in the db.
      const user = userCredential.user;
      const formDataCopy = { ...formData,
      };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await setDoc(doc(db, "users", user.uid), formDataCopy);
       toast.success("Sign up was successful");
      // navigate("/");
    } catch (error) {
      toast.error("Something went wrong with the registration");
    }
  }
  return (
    <section>
      <div className="bg-[#fffffe] flex flex-col justify-center flex-wrap items-center px-1 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl text-center py-4 mt-6 font-bold">Sign Up</h1>

          <form onSubmit={onSubmit}>
            <input
              type="text"
              id="name"
              value={name}
              onChange={onChange}
              placeholder="Full name"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email address"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <div class="sm:col-span-3">
                    <label
                      for="business_type"
                      class="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Are you a user or a business owner?
                    </label>
                    <div class="mt-2">
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={onChange}
                        autocomplete="role"
                        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                      >
                        <option>User</option>
                        <option>Business</option>
                      </select>
                    </div>
                  </div>
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg py-5">
              <p className="mb-6">
                Have an account?
                <Link
                  to="/login"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Sign in
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
            >
              Sign up
            </button>
            <div className="flex items-center  my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              <p className="text-center font-semibold mx-4">OR</p>
            </div>
            <OAuth />
          </form>
        
      </div>
    </section>
  );
}