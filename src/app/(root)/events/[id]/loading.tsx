'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const FunnyEventLoading = () => {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6">
      
      {/* Animação da Lupa */}
      <motion.div
        animate={{
          x: [-25, 25, -25],       // Move para os lados
          y: [0, -40, 0],         // Move para cima e para baixo
          rotate: [0, 15, -15, 0], // Gira levemente
        }}
        transition={{
          duration: 3,            // Duração de cada ciclo da animação
          ease: "easeInOut",
          repeat: Infinity,       // Repete para sempre
          repeatType: "mirror",   // Faz a animação ir e voltar suavemente
        }}
      >
        <Search className="h-24 w-24 text-yellow-500" />
      </motion.div>
      
      <h2 className="text-2xl font-semibold text-white">
        Procurando o evento...
      </h2>
    </div>
  );
};

export default FunnyEventLoading;