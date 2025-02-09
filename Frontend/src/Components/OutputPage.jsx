import React from "react";
import { useLocation } from "react-router-dom";


function OutputPage() {
  const location = useLocation();
  const { prediction, confidence, verification } = location.state || { 
    prediction: "Unknown", 
    confidence: 0, 
    verification: "No details available." 
  };

  // Function to render the verification text with simple markdown-like bold formatting.
  const renderVerification = (text) => {
    return text.split("\n\n").map((paragraph, pIndex) => (
      <p key={pIndex} className="text-gray-300 mb-2">
        {paragraph.split("**").map((segment, sIndex) =>
          // Every odd-index segment is between ** markers.
          sIndex % 2 === 1 ? <strong key={sIndex}>{segment}</strong> : segment
        )}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center py-8">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 p-8">
        <header className="border-b border-gray-700 pb-4 mb-6">
          <h1 className="text-4xl font-bold text-center text-white">
            News Verification Result
          </h1>
        </header>
        <section className="mb-6 text-center">
          <div className="text-2xl font-semibold mb-2">
            {prediction.toLowerCase() === "fake" 
              ? <span className="text-red-400">🚨 FAKE NEWS 🚨</span>

              : <span className="text-green-400">✅ REAL NEWS ✅</span>}
          </div>
          {/* Optionally, if you wish to show the confidence score as well:
          <p className="text-lg text-gray-200">
            Confidence Score: <span className="font-bold">{confidence}%</span>
          </p>
          */}
        </section>
        <section className="bg-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Verification Details</h2>
          <div className="text-base">
            {renderVerification(verification)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default OutputPage;



