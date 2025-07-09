import React from 'react'

const Experience = () => {

    const homeCards = {
        card1: {
            title: "Finance a Home",
            description: "Some quick example text that uywg to build on the card title and make up the bulk of the card's content.",
            imageUrl: "Sweet Home.png",
        },

        card2: {
            title: "Sell a Home",
            description: "Some quick example text dghyuwe uywg to build on the card title and make up the bulk of the card's content.",
            imageUrl: "Sweet Home2.png",
        },

        card3: {
            title: "Rent a Home",
            description: "Some quick example text dghyuwe uywg to build on the card title and make up the bulk of the card's content.",
            imageUrl: "Sweet Home3.png",
        },
    }

  return (
    <div>
        <div className="text-center py-15 mb-5">
            <h1 className="font-bold text-3xl mb-5">Your Complete RealEstate Experience</h1>
            <p className="text-sm text-gray-600">
                 Unlocking Opportunities, Empowering Choices and Simplifying Your<br />
                 Real Estate Journey With ShuHomes
            </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
            {Object.entries(homeCards).map(([key, item]) => (
                <div
                key={key}
                className="p-6 rounded hover:shadow-xl max-w-xs cursor-pointer shadow-sm bg-gray-100"
                >
                    <img src={item.imageUrl} alt={item.title} className="w-20 h-16 mb-10" />
                    <h2 className="text-2xl mb-3 font-semibold">{item.title}</h2>
                    <p className="mb-3 text-gray-700">{item.description}</p>
                    <a href="#"
                       className="text-blue-700 font-semibold hover:underline inline-block">Learn more ---
                    </a>
                </div>
                ))}
        </div>
    </div>
  )
}

export default Experience