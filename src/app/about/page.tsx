"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/user/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandshake,
  faChartLine,
  faUsers,
  faAward,
  faHome,
  faGlobe,
  faShieldAlt,
  faClock,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import PageLoader from "@/components/shared/PageLoader";

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

const teamMembers = [
  {
    name: "Shueb Ahmed",
    position: "Founder & CEO",
    image: "/My-profilepic.jpg",
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

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.fonts.ready.then(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="pt-10">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-5 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-32 -translate-x-32"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 rounded-full text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-400/20">
            <FontAwesomeIcon icon={faAward} className="w-4 h-4 mr-2" />
            Ethiopia's Premier Real Estate Company
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            About <span className="text-blue-300">EthioAddis</span>
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100 leading-relaxed">
            Transforming Ethiopia's real estate landscape through innovation,
            integrity, and unparalleled service excellence since 2025.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center text-blue-200 animate-slide-left delay-300">
              <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-2" />
              <span>1,200+ Properties Sold</span>
            </div>
            <div className="flex items-center text-blue-200 animate-scale-up delay-400">
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5 mr-2" />
              <span>98% Client Satisfaction</span>
            </div>
            <div className="flex items-center text-blue-200 animate-slide-right delay-300">
              <FontAwesomeIcon icon={faGlobe} className="w-5 h-5 mr-2" />
              <span>15+ Cities Covered</span>
            </div>
          </div>
        </div>
      </section>
      {/* Enhanced Our Story Section */}

      <section className="py-20 px-5 bg-white animate-on-scroll animate-pc-only delay-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* ✅ Animate this block on mobile only */}
              <div className="animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                <div className="inline-flex items-center px-3 py-1 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-4">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2" />
                  Our Journey
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
              </div>

              {/* ✅ Animate text paragraph block on mobile only */}
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                  Founded in 2025,{" "}
                  <strong className="text-blue-700">EthioAddis</strong> emerged
                  from a vision to revolutionize Ethiopia's real estate market.
                  We recognized the need for a modern, transparent, and
                  client-focused approach to property transactions in our
                  rapidly growing nation.
                </p>
                <p className="animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                  What began as a small team of passionate real estate
                  professionals has evolved into Ethiopia's most trusted
                  property consultancy. Our deep understanding of local markets,
                  combined with international best practices, has enabled us to
                  serve clients across major Ethiopian cities.
                </p>
                <p className="animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                  Today, we pride ourselves on being more than just a real
                  estate company. We are community builders, dream facilitators,
                  and trusted advisors who understand that every property
                  transaction represents a significant milestone in our clients'
                  lives.
                </p>
              </div>

              {/* ✅ Animate stats (founded, cities) on mobile only */}
              <div className="grid grid-cols-2 gap-6 pt-6 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    2025
                  </div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    15+
                  </div>
                  <div className="text-sm text-gray-600">Cities Served</div>
                </div>
              </div>
            </div>

            {/* ✅ Animate image only on mobile */}
            <div className="relative animate-on-scroll animate-mobile-only animate-fade-in delay-400">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl transform rotate-3"></div>
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl">
                <Image
                  src="/main-hero-bg.png"
                  alt="EthioAddis Office"
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Enhanced Mission & Values */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 animate-on-scroll animate-pc-only animate-fade-in delay-200">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-4">
              <FontAwesomeIcon icon={faShieldAlt} className="w-4 h-4 mr-2" />
              Our Foundation
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Mission & Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on principles that guide every interaction and decision we
              make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity First",
                desc: "We conduct business with unwavering ethical standards, ensuring complete transparency in every transaction. Your trust is our foundation.",
                icon: faHandshake,
                color: "blue",
              },
              {
                title: "Excellence Driven",
                desc: "From property selection to client service, we pursue excellence in every detail. Our commitment to quality sets the industry standard.",
                icon: faChartLine,
                color: "green",
              },
              {
                title: "Client Centered",
                desc: "Every decision we make prioritizes our clients' needs and goals. We listen, understand, and deliver beyond expectations.",
                icon: faUsers,
                color: "purple",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="group bg-white p-8 animate-on-scroll animate-mobile-only animate-fade-in delay-200 rounded-2xl shadow-lg hover:shadow-md border border-gray-100 hover:border-blue-200"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-${value.color}-100 flex items-center justify-center text-${value.color}-700 mx-auto mb-6`}
                >
                  <FontAwesomeIcon icon={value.icon} className="text-2xl" />
                </div>
                <h3 className="font-bold text-xl mb-4 text-gray-900">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Enhanced Achievements */}
      <section className="py-20 bg-white animate-on-scroll animate-pc-only animate-fade-in delay-200">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16 animate-on-scroll animate-mobile-only animate-fade-in delay-200">
            <div className="inline-flex items-center px-3 py-1 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-4">
              <FontAwesomeIcon icon={faAward} className="w-4 h-4 mr-2" />
              Our Impact
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Achievements That Matter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Numbers that reflect our commitment to excellence and client
              satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatBox
              number="1,200+"
              label="Properties Sold"
              icon={faHome}
              description="Successful transactions across Ethiopia"
            />
            <StatBox
              number="$1.2B+"
              label="Sales Volume"
              icon={faChartLine}
              description="Total value of properties handled"
            />
            <StatBox
              number="98%"
              label="Client Satisfaction"
              icon={faUsers}
              description="Based on post-transaction surveys"
            />
            <StatBox
              number="15+"
              label="Industry Awards"
              icon={faAward}
              description="Recognition for excellence"
            />
          </div>
        </div>
      </section>
      {/* Team Section*/}
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
      {/* Enhanced Testimonials */}
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
      {/* Enhanced Call to Action */}
      <section className="animate-on-scroll delay-200 relative py-18 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full translate-y-32 -translate-x-32"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-5">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you're buying your first home, selling a property, or
            looking for investment opportunities, our expert team is here to
            guide you every step of the way.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/listings" className="group">
              <button className="px-3 py-2 text-sm bg-white animate-on-scroll delay-200 text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
                <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-2" />
                Browse Properties
              </button>
            </Link>
            <Link href="/contact" className="group">
              <button className="px-3 py-2 text-sm bg-transparent animate-on-scroll delay-200 text-white font-semibold rounded-xl border border-white hover:bg-white hover:text-blue-700 transition-all duration-100 group-hover:scale-105 flex items-center justify-center">
                <FontAwesomeIcon icon={faPhone} className="w-5 h-5 mr-2" />
                Contact Our Team
              </button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-blue-200">
            <div className="flex items-center animate-slide-left delay-200">
              <FontAwesomeIcon icon={faPhone} className="w-4 h-4 mr-2" />
              <span>+251 991 868 812</span>
            </div>
            <div className="flex items-center animate-slide-right delay-200">
              <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
              <span>info@ethioaddis.com</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

// Enhanced StatBox Component
const StatBox = ({
  number,
  label,
  icon,
  description,
}: {
  number: string;
  label: string;
  icon: any;
  description: string;
}) => (
  <div className="group bg-white rounded-2xl shadow-lg p-8 animate-on-scroll animate-mobile-only animate-fade-in delay-100 text-center hover:shadow-md border border-gray-100 hover:border-blue-200">
    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-4">
      <FontAwesomeIcon icon={icon} className="text-2xl" />
    </div>
    <div className="text-4xl font-bold text-blue-700 mb-2">{number}</div>
    <div className="text-lg font-semibold text-gray-900 mb-2">{label}</div>
    <div className="text-sm text-gray-600">{description}</div>
  </div>
);
