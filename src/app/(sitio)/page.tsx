import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServiciosTaller from "@/components/ServiciosTaller";
import HorarioYContacto from "@/components/HorarioYContacto";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ServiciosTaller />
      <HorarioYContacto />
      <Footer />
    </>
  );
}
