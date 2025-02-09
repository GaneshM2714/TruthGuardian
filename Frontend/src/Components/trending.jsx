import React, { useEffect, useState } from "react";
import axios from "axios";

const Trending = () => {
  // State to store the trending news
  const [misinformationItems, setMisinformationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trending claims data from the API
  useEffect(() => {
    axios
      .get("https://truthguardian.onrender.com/trending-claims")
      .then((response) => {
        setMisinformationItems(response.data); // Update state with API response data
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((err) => {
        setError("Failed to fetch data. Please try again later.");
        setLoading(false); // Set loading to false even if there is an error
      });
  }, []); // Empty dependency array ensures this runs once when the component mounts

  if (loading) {
    return (
      <div className="p-8 bg-gradient-to-b from-black to-gray-900 min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4">Loading Trending Misinformation...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gradient-to-b from-black to-gray-900 min-h-screen flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-b from-black to-gray-900 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-4">Trending Misinformation</h1>
      <p className="text-gray-300 mb-6 text-center">
        Stay informed about current misleading information and their factual corrections.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {misinformationItems.map((item, index) => (
          <div
            key={index}
            className="p-5 bg-gray-800 rounded-xl shadow-lg text-white transform transition duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <h2 className="text-xl font-semibold mb-2">{item.text}</h2>
            <p className="text-gray-300 mb-3">Claimed by: {item.claimant}</p>
            <p className="text-gray-300 mb-3">Reviewed by: {item.reviewed_by}</p>
            <p className="text-gray-300 mb-3">Rating: {item.rating}</p>
            <div className="flex justify-between items-center">
              <a href={item.review_url} className="text-blue-400 hover:text-blue-500 font-semibold">
                Read More → 
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
