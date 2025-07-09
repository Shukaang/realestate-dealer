"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export default function MainTestimonial() {
  return (
    <section className="mb-0">
      <div className="container px-4">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Don&apos;t just take our word for it—hear from our satisfied clients
            about their experience working with EstateElite.
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
              <div className="rounded-xl mb-5 bg-card text-card-foreground border border-none shadow-lg flex flex-col justify-between">
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
                      <FontAwesomeIcon key={i} icon={faStar} className="mr-1" />
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
  );
}
