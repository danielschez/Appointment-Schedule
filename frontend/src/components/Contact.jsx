// src/components/Contact.jsx
import React from "react";
import { motion } from "framer-motion";

const Contact = () => (
  <section id="contact" className="py-20 bg-black text-center px-6">
    <motion.h2
      className="text-4xl font-bold mb-6 text-yellow-400"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      Contáctanos
    </motion.h2>
    <motion.p
      className="text-gray-300 mb-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      ¿Listo para tu próximo corte? ¡Agenda tu cita o visítanos directamente!
    </motion.p>
    <motion.a
      href="mailto:info@braidbarber.com"
      className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      Enviar correo
    </motion.a>
  </section>
);

export default Contact;
