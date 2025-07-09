"use client";

import Footer from "@/components/user/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshake,
  faChartLine,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { faStar } from "@fortawesome/free-solid-svg-icons";

const testimonials = [
  {
    name: "Michael Thompson",
    location: "New York, NY",
    image: "/michael.jpg",
    stars: 5,
    message:
      "Working with EstateElite was an absolute pleasure. Their team guided me through every step of purchasing my dream penthouse. Their expertise made the process seamless.",
  },
  {
    name: "Sarah Johnson",
    location: "Los Angeles, CA",
    image: "/sarah.jpg",
    stars: 5,
    message:
      "I can't recommend EstateElite enough! They helped me find the perfect beachfront property within my budget. Their market knowledge saved me thousands.",
  },
  {
    name: "David Rodriguez",
    location: "Miami, FL",
    image: "/david.jpg",
    stars: 4,
    message:
      "After months of searching on my own, I turned to EstateElite and found my dream home within weeks. Their approach and understanding made all the difference.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-10">
      {/* Hero */}
      <section className="bg-gray-600 text-white pt-40 pb-35 px-5">
        <h1 className="text-4xl  font-bold mb-4">About EthioAddis</h1>
        <p className="text-lg max-w-2xl text-gray-300">
          Discover our story, mission, and the team behind our exceptional real
          estate services.
        </p>
      </section>

      {/* Our Story */}
      <section className="mt-20 py-16 px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 py-5">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="text-gray-700 text-[15px]">
              Founded in 2010, EstateElite began with a simple mission: to
              transform the real estate experience by combining exceptional
              properties with unparalleled service. What started as a small team
              of passionate professionals has grown into one of the most trusted
              names in luxury real estate.
            </p>
            <p className="text-gray-700 text-[15px]">
              Our journey has been defined by our commitment to excellence and
              our deep understanding of both the market and our clients' needs.
              We believe that finding the perfect property is about more than
              just location and features—it's about finding a place where
              memories will be made and lives will unfold.
            </p>
            <p className="text-gray-700 text-[15px]">
              Today, EstateElite stands as a beacon of innovation and integrity
              in the real estate industry. Our portfolio of exclusive properties
              spans prime locations, and our network of satisfied clients
              continues to grow through referrals and repeat business—a
              testament to the trust we've built over the years.
            </p>
          </div>
          <div className="w-full h-full rounded-md shadow-lg">
            <img
              src="/Big Home1.jpg"
              alt="About Pic"
              className="object-cover w-full h-full rounded-md"
            />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-gray-100 py-16 mb-18">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-10">Our Mission & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity",
                desc: "We conduct our business with the highest ethical standards, ensuring transparency and honesty in every interaction. Our clients' trust is our most valuable asset.",
                icon: <FontAwesomeIcon icon={faHandshake} />,
              },
              {
                title: "Excellence",
                desc: "We strive for excellence in everything we do, from the properties we represent to the service we provide. Our attention to detail and commitment to quality set us apart.",
                icon: <FontAwesomeIcon icon={faChartLine} />,
              },
              {
                title: "Client Focused",
                desc: "We put our clients at the center of everything we do. We listen carefully to their needs and work tirelessly to exceed their expectations at every step.",
                icon: <FontAwesomeIcon icon={faUsers} />,
              },
            ].map((val, index) => (
              <div
                key={index}
                className="p-8 bg-white border rounded-lg shadow space-y-2"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-6">
                  <i className="text-2xl">{val.icon}</i>
                </div>
                <h3 className="font-semibold text-lg mb-2">{val.title}</h3>
                <p className="text-gray-600">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl text-gray-900 font-bold mb-8">
              Our Achievements
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              We take pride in our record of success and the recognition we've
              received for our commitment to excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <StatBox number="1,200+" label="Properties Sold" />
            <StatBox number="$2B+" label="Sales Volume" />
            <StatBox number="98%" label="Client Satisfaction" />
            <StatBox number="15+" label="Industry Awards" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Don&apos;t just take our word for it—hear from our satisfied
              clients about their experience working with EstateElite.
            </p>
          </div>

          {/* Swiper */}
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={3}
            loop={true}
            autoplay={{ delay: 4500 }}
            pagination={{ clickable: true }}
            navigation
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((t, index) => (
              <SwiperSlide key={index} className="h-full">
                <div className="rounded-xl h-full bg-white border-none shadow-lg flex flex-col justify-between">
                  {/* Top: Info */}
                  <div className="p-6 pb-2">
                    <div className="flex items-center">
                      <div className="relative flex shrink-0 overflow-hidden rounded-full h-14 w-14 mr-4">
                        <Image
                          src={t.image}
                          alt={t.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{t.name}</div>
                        <p className="text-sm text-gray-500">{t.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stars + Message */}
                  <div className="p-6 pt-0">
                    <div className="text-yellow-400 mb-3">
                      {[...Array(t.stars)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className="mr-1"
                        />
                      ))}
                      {[...Array(5 - t.stars)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className="mr-1 text-gray-300"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 italic text-sm leading-relaxed">
                      {t.message}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Swiper pagination dots spacing */}
          <div className="mt-8 flex justify-center">
            <div className="swiper-pagination !static !w-auto gap-2"></div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-700 text-white text-center py-16 px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
        <p className="mb-6 mx-auto max-w-xl text-gray-300 text-lg">
          Whether you're looking to buy, sell, or invest in real estate, our
          team is here to help you achieve your goals.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <Link href="/listings">
            <button className="px-4 py-2 bg-white cursor-pointer text-blue-700 text-sm font-semibold rounded shadow hover:bg-blue-100 transition">
              Browse Properties
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-4 py-2 bg-blue-700 cursor-pointer text-white text-sm font-semibold rounded shadow hover:bg-blue-800 transition border border-white">
              Contact Us
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Component for Achievements
const StatBox = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center bg-white shadow-md rounded-md py-5">
    <p className="text-4xl font-bold text-blue-700 mb-2">{number}</p>
    <p className="text-lg text-gray-700">{label}</p>
  </div>
);
