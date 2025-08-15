"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const teamMembers = [
  {
    name: "Shueb Ahmed",
    position: "Founder & CEO",
    image: "/my-profilepic.jpg",
    bio: "With over 10 years in Ethiopian real estate, Shueb leads our vision of transforming property experiences across the country.",
  },
  {
    name: "Meron Tadesse",
    position: "Senior Property Consultant",
    image: "/sarah.jpg",
    bio: "Specializing in luxury properties and commercial real estate with deep market knowledge of Addis Ababa.",
  },
  {
    name: "Yonas Haile",
    position: "Market Research Director",
    image: "/michael.jpg",
    bio: "Our market expert who ensures clients get the best deals through comprehensive market analysis and trends.",
  },
];

export default function OurTeams() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-gray-50 animate-on-scroll animate-pc-only animate-fade-in delay-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faUsers} className="w-4 h-4 mr-2" />
            Meet Our Team
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            The People Behind Our Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experienced professionals dedicated to making your real estate
            dreams a reality
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white animate-on-scroll animate-mobile-only animate-fade-in delay-200 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={member.image || "/michael.jpg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-700 font-medium mb-4">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
