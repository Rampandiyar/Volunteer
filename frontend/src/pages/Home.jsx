import { Link } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function Home() {
  localStorage.clear();
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 flex flex-col justify-center items-center">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute animate-[blob_15s_infinite] top-10 right-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-overlay filter blur-2xl"></div>
        <div className="absolute animate-[blob_15s_infinite] delay-2000 bottom-10 left-20 w-64 h-64 bg-cyan-400 rounded-full mix-blend-overlay filter blur-2xl"></div>
        <div className="absolute animate-[blob_15s_infinite] delay-4000 top-1/3 left-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-overlay filter blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1
          className="text-6xl font-black text-transparent bg-clip-text p-1 bg-gradient-to-r from-pink-400 via-red-500 to-yellow-600 mb-6 drop-shadow-lg"
          data-aos="fade-down"
        >
          Event Management System
        </h1>

        <p
          className="text-2xl text-white font-semibold mb-8 max-w-2xl mx-auto opacity-90"
          data-aos="fade-up"
        >
          Revolutionize event organization with seamless tracking and dynamic
          participation
        </p>

        <Link
          to="/login"
          className="px-10 py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold rounded-full hover:scale-110 transition duration-[0.3s] shadow-2xl hover:shadow-pink-500/50 animate-bounce"
          data-aos="zoom-in"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
}

export default Home;
