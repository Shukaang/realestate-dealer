import React from 'react'

const Dwell = () => {

    const featureHome = {
        addis: {
            name: "Addis Ababa",
            price: "1200",
            url: "Addis Ababa pic1.jpg",
            location: "Bole Michael"
        },

        hawassa: {
            name: "Hawassa",
            price: "800",
            url: "Hawassa pic.jpg",
            location: "Hawassa Piassa"
        },

        jigjiga: {
            name: "Jigjiga",
            price: "1400",
            url: "Jigjiga pic.jpg",
            location: "Jigjiga International"
        },

        mekelle: {
            name: "Mekelle",
            price: "900",
            url: "Mekelle pic.jpg",
            location: "Nougade"
        },
    }
  return (
    <div className='mt-10 sm:mx-8'>
  <img src='Home pictures.jpg' className='w-full bg-cover object-cover' />
  <div className='bg-black py-10 px-4 sm:px-12'>
    <div className='flex flex-col sm:flex-row items-center sm:items-start gap-6'>
      <p className='text-white text-3xl sm:text-4xl font-semibold sm:w-1/3 text-center sm:text-left'>
        Dwelling<br/>Achievements
      </p>
      <p className='text-gray-400 text-sm sm:text-base sm:w-2/3 text-center sm:text-left'>
        Discover Your Perfect Home and Begin Your Story: Shu Homes - Where Every Dream Finds its Place,
        Every Journey Begins, and Every Achievement Shines Bright. The promise of home becomes reality,
        each moment becomes a memory, and every achievement.
      </p>
    </div>
  </div>
  <div className='pt-10 px-4 sm:px-12'>
    <div className='flex flex-col sm:flex-row items-center gap-6'>
      <h1 className='text-3xl sm:text-4xl text-gray-900 font-bold sm:w-1/3 text-center sm:text-left'>
        Featured Listing
      </h1>
      <p className='text-gray-700 text-sm sm:text-base sm:w-2/3 text-center sm:text-left'>
        Dive into the Exquisite Collection of Future Listings at Shu Homes – Every Corner Whispers Comfort,
        Every Detail is Crafted with Perfection.
      </p>
    </div>
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:flex justify-center lg:gap-5 mt-14'>
      {Object.entries(featureHome).map(([key, item]) => (
        <div key={key} className='pt-7 mx-auto sm:mx-0'>
          <div className='relative'>
            <img src={item.url} alt={item.name} className='w-64 h-48 object-cover rounded' />
            <p className='absolute top-3 left-2 bg-black/60 text-white text-sm font-semibold px-3 py-1 rounded-full'>
              ${item.price}
            </p>
          </div>
          <div className=''>
            <h2 className='text-lg font-bold'>{item.name}</h2>
            <div className='flex items-center gap-2 mt-2'>
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABb0lEQVR4nM1UTS4EQRQuTkBV98JYGmzEDdjgEOIIEkvTVrOUiH6vZYJgwQH0e92xFMIlzFyCzQyJjZaamZaJ7uq/mYQveZvKq++nXlUJ8deQnr+lkK4kUEci9QbFbQl8KSHYrExsHdOSBHpWyFFWSeQny7tdLEeOwboCessjH6lXC3itsPOS5FEsYrthPVdAIj1WII/i4yow0GrkKi6PN4wC+rYYNn4q4H3VCmr9Qm7019JTXJgTAHUMAo2EGSDHINDOEOBu2iYL/LnfvXotVQC4axZA/khN0ApqiV73bj49AfXKHxGQkzRDB+m9/JKV4Nw8ZHJ0Eu18SG4YMp0aBWY9f0UBfY1zTWe8cNUoMEzxUF2A7kUeFAbLxmFjxisGetffTK7AIIW/V9o9+LuFyH+SAGFx93wmSqPZnFbIN/nO6Vr3ikqIoikJfGR0jnyoe8S4UODv6Bc6+h1YSNtikrDdsK7/e132CS1MlPxf4xub/mn9sqC6DQAAAABJRU5ErkJggg==" 
            alt="marker"/>
              <p className='text-gray-600 text-sm'>{item.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className='mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 px-2'>
      <p className='text-gray-600 text-center sm:text-left max-w-4xl'>
        Unveiling the Epitome of Elegance and Luxury. Dive into the Exquisite Collection of Featured Listings at ShuHomes.
      </p>
      <a
        className='rounded-full border border-blue-600 px-6 py-2 text-sm text-blue-600 hover:text-white 
        font-semibold transition hover:bg-blue-700'
        href='#'
      >
        See More
      </a>
    </div>
  </div>
</div>

  )
}

export default Dwell