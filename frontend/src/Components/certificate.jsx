import React, { useState } from "react";
import axios from "axios";

const CertificateGenerator = () => {
  const [name, setName] = useState("");
  const [certificateURL, setCertificateURL] = useState(null);

  const generateCertificate = async () => {
    if (!name.trim()) {
      alert("Please enter a name!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/generate-certificate",
        { name },
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(new Blob([response.data]));
      setCertificateURL(url);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Volunteer Certificate Generator
      </h1>

      <input
        type="text"
        placeholder="Enter volunteer's name"
        className="border p-2 rounded w-80 text-center"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={generateCertificate}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Generate Certificate
      </button>

      {certificateURL && (
        <div className="mt-6 flex flex-col items-center">
          <img
            src={certificateURL}
            alt="Certificate"
            className="border rounded-lg shadow-lg w-96"
          />
          <a
            href={certificateURL}
            download="Volunteer_Certificate.png"
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Download Certificate
          </a>
        </div>
      )}
    </div>
  );
};

export default CertificateGenerator;
