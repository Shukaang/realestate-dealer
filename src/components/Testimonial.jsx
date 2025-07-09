import React, { useState, useRef, useEffect } from 'react';

const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const cards = [
    { id: 1, quote: "HomeVista helped us navigate the complex world of real estate financing with ease.", author: "Darrell Steward", position: "CEO, IBM" },
    { id: 2, quote: "The neighborhood we found through HomeVista is more than just a place to live", author: "Wade Warren", position: "Manager, MasterCard" },
    { id: 3, quote: "From the moment we walked through the door of our new home, new city daunting.", author: "Arlene McCoy", position: "CEO, Apple" },
    { id: 4, quote: "HomeVista helped us navigate the complex world of real estate financing with ease.", author: "Savannah Nguyen", position: "Johnson & Johnson" },
    { id: 5, quote: "The best decision we made in our home buying journey was choosing HomeVista.", author: "Robert Fox", position: "CTO, Microsoft" },
    { id: 6, quote: "Professional service that exceeded our expectations in every way.", author: "Jenny Wilson", position: "Director, Google" },
    { id: 7, quote: "Found our dream home in record time thanks to HomeVista's expertise.", author: "Albert Flores", position: "VP, Amazon" },
    { id: 8, quote: "A seamless experience from start to finish. Highly recommended!", author: "Kathryn Murphy", position: "COO, Tesla" },
  ];

  const scrollToCard = (index) => {
    setActiveIndex(index);
    const container = containerRef.current;
    if (!container) return;
    const card = container.children[index];
    if (!card) return;
    const offset = card.offsetLeft - (container.offsetWidth / 2) + (card.offsetWidth / 2);
    container.scrollTo({ left: offset, behavior: 'smooth' });
  };

  const handleNext = () => scrollToCard((activeIndex + 1) % cards.length);
  const handlePrev = () => scrollToCard((activeIndex - 1 + cards.length) % cards.length);

  const getCardStyle = (index) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return {};
    const dist = Math.abs(activeIndex - index);
    if (dist === 0)   return { transform: 'scale(1)',      opacity: 1 };
    if (dist === 1)   return { transform: 'scale(0.85)',   opacity: 0.6 };
    return               { transform: 'scale(0.7)',    opacity: 0.3 };
  };

  useEffect(() => { scrollToCard(activeIndex); }, []);

  return (
    <div className='my-20'>
        <div className='text-center px-4 md:px-0'>
  <h1 className='text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-5 leading-tight'>
    Testimonials From Happy<br className="hidden sm:block" />
    ShuHomes Clients
  </h1>
  <p className='text-gray-700 text-sm sm:text-base mb-8 sm:mb-10 leading-relaxed'>
    Discovering the True Essence of Home through the Words of Satisfied<br className="hidden sm:block" />
    Clients, as ShuHomes Touches Lives around the Globe.
  </p>
</div>

    <div className="relative max-w-5xl mx-auto px-4">
      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        aria-label="Previous"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
      >←</button>
      <button
        onClick={handleNext}
        aria-label="Next"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
      >→</button>

      {/* Cards Container */}
      <div
        ref={containerRef}
        className={`
          flex gap-6 py-10 
          overflow-x-auto snap-x snap-mandatory 
          md:overflow-hidden md:snap-none 
          scrollbar-hide
        `}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className={`
              flex-shrink-0 
              w-72 md:w-77 
              min-h-84 bg-white 
              rounded-2xl shadow-lg p-6 
              flex flex-col cursor-pointer
              snap-center md:snap-none
            `}
            style={getCardStyle(idx)}
            onClick={() => scrollToCard(idx)}
          >
            <div className="text-indigo-600 text-[55px] leading-none mb-4 font-serif">‘‘</div>
            <p className="text-gray-800 mb-4 leading-relaxed flex-grow">{card.quote}</p>
            <div className="border-t border-gray-300 pt-4 mt-auto">
              <p className="font-semibold text-gray-900 text-[15px]">{card.author}</p>
              <p className="text-sm text-gray-500">{card.position}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollbar hiding */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
    </div>
  );
};

export default Testimonial;
