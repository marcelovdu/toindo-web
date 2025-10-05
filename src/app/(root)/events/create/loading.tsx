'use client';

import { motion } from 'framer-motion';
import { FilePenLine } from 'lucide-react';

const CreateEventLoading = () => {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6">
      
      {/* Animação do Ícone */}
      <motion.div
        animate={{
          y: [0, -15, 0],       // Um movimento suave para cima e para baixo
          rotate: [-8, 8, -8],  // Uma leve rotação, como se estivesse escrevendo/desenhando
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        <FilePenLine className="h-24 w-24 text-green-500" />
      </motion.div>
      
      <h2 className="text-2xl font-semibold text-white text-center px-4">
        Preparando a prancheta para a sua grande ideia...
      </h2>
    </div>
  );
};

export default CreateEventLoading;