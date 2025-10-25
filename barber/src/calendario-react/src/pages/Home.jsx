// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import About from "../components/About";
import Footer from "../components/Footer";
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>WALLD'S BARBER | Barbería Moderna</title>
        <meta
          name="description"
          content="Barbería moderna con cortes clásicos y estilo contemporáneo. Reserva tu cita en WALLD'S BARBER."
        />
        <meta
          name="keywords"
          content="barbería, cortes, afeitado, estilo, cabello, hombres, querétaro"
        />
      </Helmet>

      <main className="bg-black text-white overflow-x-hidden">
        <Navbar />
        <Hero />
        <Services />
        <About />
        <Footer />
      </main>
    </>
  );
};

export default Home;

