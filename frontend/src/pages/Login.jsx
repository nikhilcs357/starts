import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.bgImage})` }}
    >
      {/* Left Side */}

      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:pl-32 text-left space-y-8 bg-white/60 backdrop-blur-sm relative">

        {/*  Logo */}
        <div className="absolute top-6 left-8 md:top-10 md:left-16">
          <img
            src={assets.logo}
            alt="Sociofy Logo"
            className="h-12 object-contain"
          />
        </div>

        {/* User Ratings */}
        <div className="flex items-center gap-3 mt-20">
          <img src={assets.group_users} alt="Users" className="h-10" />
          <div>
            <div className="flex">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-transparent fill-amber-500"
                  />
                ))}
            </div>
            <p className="text-gray-700 text-sm md:text-base">
              Used by 1000+ users
            </p>
          </div>
        </div>


        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-indigo-900">
          More than people<br /> truly connect
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-md">
          Connect with global community on{" "}
          <span className="font-semibold text-indigo-700">sociofy.</span>
        </p>
      </div>

      {/* Right Side: Login */}

      <div className="flex-1 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="w-full max-w-sm">
          <SignIn />
        </div>
      </div>
    </div>
  );
};

export default Login;
