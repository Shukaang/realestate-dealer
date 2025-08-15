"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { faMapMarkerAlt, faStar } from "@fortawesome/free-solid-svg-icons";

const testimonials = [
  {
    name: "Alemayehu Tadesse",
    location: "Addis Ababa, Ethiopia",
    image: "/my-profilepic.jpg",
    stars: 5,
    message:
      "EthioAddis helped me find the perfect family home in Bole. Their deep knowledge of Addis Ababa's neighborhoods and professional service made the entire process smooth and stress-free.",
  },
  {
    name: "Hanan Mohammed",
    location: "Hawassa, Ethiopia",
    image: "/david.jpg",
    stars: 5,
    message:
      "As a first-time buyer, I was nervous about the process. The EthioAddis team guided me every step of the way and helped me secure a beautiful apartment within my budget.",
  },
  {
    name: "Daniel Bekele",
    location: "Adama, Ethiopia",
    image: "/michael.jpg",
    stars: 5,
    message:
      "I've worked with several real estate agencies, but EthioAddis stands out. Their market expertise and commitment to client satisfaction is unmatched. Highly recommended!",
  },
  {
    name: "Sara Getachew",
    location: "Bahir Dar, Ethiopia",
    image: "/sarah.jpg",
    stars: 4,
    message:
      "Professional, reliable, and results-driven. EthioAddis helped me sell my property quickly and at a great price. Their marketing strategy was exceptional.",
  },
];

export default function MainTestimonial() {
  return (
    <section className="py-20 bg-white animate-on-scroll animate-pc-only animate-fade-in delay-200">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
          <div className="inline-flex items-center px-3 py-1 bg-yellow-50 rounded-full text-yellow-700 text-sm font-medium mb-4">
            <FontAwesomeIcon icon={faStar} className="w-4 h-4 mr-2" />
            Client Stories
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from satisfied clients across Ethiopia
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={3}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-2xl shadow-lg p-8 h-full border border-gray-100 hover:border-blue-200 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.image || "/sarah.jpg"}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm flex items-center">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="w-3 h-3 mr-1"
                      />
                      {testimonial.location}
                    </p>
                  </div>
                </div>

                <div className="text-yellow-400 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="mr-1" />
                  ))}
                  {[...Array(5 - testimonial.stars)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="mr-1 text-gray-300"
                    />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed italic">
                  "{testimonial.message}"
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
