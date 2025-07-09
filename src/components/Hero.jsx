import React from 'react';
import { useState } from "react";

const Header = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
<div className="px-6 sm:px-10 md:px-16">
      <div className="flex items-center justify-between py-4">
        <img src="Shu-Home-logo.png" alt="ShuHomes Logo" className="h-12 cursor-pointer" />
        <div className="hidden md:flex flex-wrap justify-center text-gray-700 text-sm gap-4">
          <p className="cursor-pointer hover:text-black">Home</p>
          <p className="cursor-pointer hover:text-black">Overview</p>
          <p className="cursor-pointer hover:text-black">Gallery</p>
          <p className="cursor-pointer hover:text-black">Features</p>
          <p className="cursor-pointer hover:text-black">Realtor</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-700 text-sm gap-3">
            <p className="cursor-pointer hover:text-black">Login</p>
            <p className="border border-blue-600 font-semibold rounded-full py-1 px-4 cursor-pointer hover:bg-slate-100">Sign Up</p>
          </div>
          <button
            className="text-2xl text-gray-700 md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden flex flex-col items-center gap-3 mb-3 text-gray-700 text-sm">
          <p className="cursor-pointer hover:text-black">Home</p>
          <p className="cursor-pointer hover:text-black">Overview</p>
          <p className="cursor-pointer hover:text-black">Gallery</p>
          <p className="cursor-pointer hover:text-black">Features</p>
          <p className="cursor-pointer hover:text-black">Realtor</p>
        </div>
      )}
      <div className="sm:hidden mb-5">
        <img src="Home pictures.jpg" alt="Mobile Hero" className="w-full rounded-lg" />
      </div>
      <div className="mt-10 flex flex-col lg:flex-row justify-between items-center gap-10 text-center lg:text-left">
        <div className="hidden lg:flex flex-col items-center lg:items-start gap-8">
          <div>
            <p className="text-4xl text-gray-600 font-bold">408+</p>
            <p className="text-gray-700">Happy Customers</p>
          </div>
          <div>
            <p className="text-4xl text-gray-600 font-bold">4.9</p>
            <p className="text-gray-700">Ratings</p>
          </div>
        </div>
        <div className="max-w-xl text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-3 leading-tight">
            Home Is Where<br />Your Story Begins
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Unlock Your Dream Home. Explore Endless Possibilities With<br />
            <a href="#" className="text-blue-600 font-bold">Shu Homes</a> - Your Premier Real Estate Destination.
          </p>
          <a href="#" className="rounded-full bg-blue-600 inline-block py-2 px-5 text-white mt-4 hover:bg-blue-700">
            Find Properties
          </a>
        </div>
        <div className="hidden lg:flex flex-col items-center lg:items-end gap-8">
          <div>
            <p className="text-4xl text-gray-600 font-bold">323+</p>
            <p className="text-gray-700">Awards Winning</p>
          </div>
          <div>
            <p className="text-4xl text-gray-600 font-bold">30+</p>
            <p className="text-gray-700">Property Ready</p>
          </div>
        </div>
      </div>
      <div className="lg:hidden grid grid-cols-2 gap-6 mt-10 w-full text-center">
        <div>
          <p className="text-3xl text-gray-600 font-bold">408+</p>
          <p className="text-gray-700">Happy Customers</p>
        </div>
        <div>
          <p className="text-3xl text-gray-600 font-bold">4.9</p>
          <p className="text-gray-700">Ratings</p>
        </div>
        <div>
          <p className="text-3xl text-gray-600 font-bold">323+</p>
          <p className="text-gray-700">Awards Winning</p>
        </div>
        <div>
          <p className="text-3xl text-gray-600 font-bold">30+</p>
          <p className="text-gray-700">Property Ready</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
