import React from 'react'

const BannerAndFooter = () => {
  return (
<div className='pb-10'>
  <div className='relative text-center'>
    <img src='Big img.jpg' className='w-full h-[300px] sm:h-[400px] object-cover' />
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 sm:px-0 w-full max-w-md'>
      <h1 className='text-xl sm:text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight'>
        Your Getway to Tailored <br className="hidden sm:block" />
        Real Estate Solutions
      </h1>
      <p className='text-sm sm:text-base text-gray-300 mb-10 max-w-md mx-auto'>
        Embark on Your Real Estate Journey with Confidence and Ease: ShuHomes
        Delivers Personalized Solutions Tailored to Your Unique Needs.
      </p>
      <a
        href='#'
        className='bg-white text-sm sm:text-base rounded-full px-5 py-2 font-semibold hover:bg-gray-200 inline-block'
      >
        Learn More
      </a>
    </div>
  </div>
  <div className='border-t border-gray-300 mt-10 px-4'>
    <div className='flex flex-col md:flex-row md:justify-around gap-8 pt-10'>
      <div className='md:w-1/5'>
        <img src='Shu-Home-logo.png' className='h-12 cursor-pointer mb-3' />
        <p className='text-gray-700 text-sm'>
          Embark on a Journey of Discovery with
          <span>
            <a href='#' className='text-blue-700 font-semibold'>
              {' '}
              ShuHomes'{' '}
            </a>
          </span>
          Comprehensive Overview. Dive into Our Commitment to Excellence.
        </p>
      </div>
      <div>
        <h4 className='font-semibold mb-3'>Useful Links</h4>
        <p className='text-gray-700 cursor-pointer mb-2 hover:text-black text-sm'>Listing</p>
        <p className='text-gray-700 cursor-pointer mb-2 hover:text-black text-sm'>About Us</p>
        <p className='text-gray-700 cursor-pointer mb-2 hover:text-black text-sm'>Contact Us</p>
        <p className='text-gray-700 cursor-pointer hover:text-black text-sm'>Our Team</p>
      </div>
      <div>
        <h4 className='font-semibold mb-3'>Get in Touch</h4>
        <div className='flex gap-2 mb-2 items-start'>
          <img src='Loc-icon.png' className='h-6 mt-1' />
          <p className='text-gray-700 text-sm'>Bole Micael, Addis Ababa</p>
        </div>
        <div className='flex gap-2 mb-2 items-start'>
          <img src='Mail-icon.png' className='h-6 mt-1' />
          <p className='text-gray-700 text-sm'>shuhomes@gmail.com</p>
        </div>
        <div className='flex gap-2 mb-2 items-start'>
          <img src='Call-icon.png' className='h-6 mt-1' />
          <p className='text-gray-700 text-sm'>+251 912 345 678</p>
        </div>
      </div>
      <div>
        <h4 className='font-semibold mb-3'>Subscribe</h4>
        <input
          type='text'
          className='rounded-full mb-4 block w-full px-4 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700/50 text-sm'
          placeholder='Your Email'
        />
        <p className='bg-blue-700 hover:bg-blue-600 px-4 py-2 text-center text-white font-semibold rounded-full text-sm cursor-pointer'>
          Submit
        </p>
      </div>
    </div>
  </div>
</div>

  )
}

export default BannerAndFooter