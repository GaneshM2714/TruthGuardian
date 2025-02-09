import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function InputPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!text.trim()) {
      setShowModal(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://truth-guardian-8yzl.onrender.com/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim: text }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Backend response:", data);

        // Use the confidence value from the backend (or 0 if missing)
        const confidence = data.confidence || 0;

        // Extract the first line from gemini_verification to determine status.
        // For example, if gemini_verification is:
        // "**False.**\n\nGujarat is not a country; ..."
        // we split by newline, then strip the ** and the period.
        const geminiRaw = data.gemini_verification || "";
        const geminiStatusLine = geminiRaw.split("\n")[0]; // e.g., "**False.**"
        const strippedStatus = geminiStatusLine
          .replace(/\*\*/g, "") // remove ** characters
          .replace(".", "")     // remove the period
          .trim()
          .toLowerCase();
          
        // Determine prediction using the gemini_verification status.
        // If the first line says "false", then the claim is fake.
        const finalPrediction = strippedStatus === "false" ? "fake" : "real";

        // Pass along the full verification details without further processing.
        const geminiVerification = data.gemini_verification || "No verification details available.";

        navigate("/OutputPage", { 
          state: { prediction: finalPrediction, confidence, verification: geminiVerification } 
        });
      } else {
        throw new Error("Failed to fetch prediction");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 text-white">
        <h1 className="text-3xl font-bold text-center mb-6">Fake News Detector</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="5"
            className="w-full p-4 border border-gray-600 rounded-lg bg-gray-700 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter news text..."
          />
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? "Processing..." : "Check News"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-white">
            <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-300 mb-4">Please enter some text before submitting.</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputPage;
