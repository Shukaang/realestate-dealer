import React from 'react'

const Vision = () => {
  return (
<div className='bg-gray-100 mt-16 grid grid-cols-1 lg:grid-cols-2 pb-10'>
    <div className='mx-6 sm:mx-10 lg:mx-20 pt-10'>
        <h1 className='text-3xl sm:text-4xl font-semibold pb-5'>Our Vision</h1>
        <p className='mb-10 text-gray-600 text-sm sm:text-base my-font'>
            Fostering a Future Where Every Individual Finds Their Perfect Home, Every Family Creates Lasting Memories, 
            and Every Community Flourishes - Our Vision at ShuHomes is to Redefine the Real Estate Experience, 
            Guided by Integrity, Innovation, and a Commitment to Excellence, Ensuring Every Step of Your Journey.
        </p>
        <img src='Vis pic1.jpg' className='rounded-full opacity-90 w-full max-w-md mx-auto lg:mx-0' />
    </div>
        
    <div className='mx-6 sm:mx-10 lg:mx-20 pt-10'>
        <img src='Vis pic2.jpg' className='rounded-full opacity-90 w-full h-55 sm:h-72 lg:h-80 object-cover' />
        <h1 className='text-3xl sm:text-4xl font-semibold pt-10 pb-5'>Our Mission</h1>
        <p className='text-gray-600 text-sm sm:text-base my-font'>
            Fostering a Future Where Every Individual Finds Their Perfect Home, 
            Every Family Creates Lasting Memories, and Every Community Flourishes - 
            Our Vision at ShuHomes is to Redefine the Real Estate Experience.
        </p>
    </div>
</div>
  )
}

export default Vision