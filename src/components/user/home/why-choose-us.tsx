import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGem,
  faUserTie,
  faFileInvoiceDollar,
  faHeadset,
} from "@fortawesome/free-solid-svg-icons";

export default function WhyChooseUs() {
  return (
    <section className="bg-gray-100 py-10 animate-on-scroll animate-pc-only delay-200">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Image */}
        <div className="w-full animate-on-scroll animate-mobile-only delay-200">
          <Image
            src="/OurDealers.jpg"
            alt="Why Choose EstateElite"
            width={600}
            height={400}
            className="rounded-lg w-full h-full lg:h-119 object-cover"
          />
        </div>

        {/* Right Content */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 animate-on-scroll animate-mobile-only delay-200">
            Why Choose <span className="text-blue-700">EthioAddis</span>
          </h2>

          <div className="space-y-6">
            {/* Item 1 */}
            <div className="flex items-start gap-4 animate-on-scroll animate-mobile-only delay-100">
              <div className="w-10 h-10 rounded-full p-3 bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-6">
                <i className="text-lg">
                  <FontAwesomeIcon icon={faGem} />
                </i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Premium Properties
                </h4>
                <p className="text-gray-600 text-sm">
                  We curate only the finest properties in the most desirable
                  locations, ensuring quality and value.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-4 animate-on-scroll animate-mobile-only delay-100">
              <div className="w-10 h-10 rounded-full p-3 bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-6">
                <i className="text-lg">
                  <FontAwesomeIcon icon={faUserTie} />
                </i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Expert Agents</h4>
                <p className="text-gray-600 text-sm">
                  Our team of experienced professionals provides personalized
                  guidance throughout your real estate journey.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-4 animate-on-scroll animate-mobile-only delay-100">
              <div className="w-10 h-10 rounded-full p-3 bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-6">
                <i className="text-lg">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} />
                </i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Transparent Pricing
                </h4>
                <p className="text-gray-600 text-sm">
                  No hidden fees or surprises. We believe in complete
                  transparency throughout the buying or selling process.
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-start gap-4 animate-on-scroll animate-mobile-only delay-100">
              <div className="w-10 h-10 rounded-full p-3 bg-blue-100 flex items-center justify-center text-blue-700 mx-auto mb-6">
                <i className="text-lg">
                  <FontAwesomeIcon icon={faHeadset} />
                </i>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">24/7 Support</h4>
                <p className="text-gray-600 text-sm">
                  Our dedicated customer service team is always available to
                  address your questions and concerns.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-4 animate-on-scroll animate-mobile-only delay-100">
              <a
                href="/about"
                className="mt-5 inline-block bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded font-medium text-sm transition"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
