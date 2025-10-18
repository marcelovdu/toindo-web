import * as z from "zod";

// Schema simples para dados de localização
const locationDataSchema = z.object({
  address: z.string().min(1, "Endereço é obrigatório"),
  placeId: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  formattedAddress: z.string().optional(),
  addressComponents: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional()
}).nullable();

export const eventFormSchema = z.object({
  title: z.string().min(3, {message: "O título deve ter pelo menos 3 caracteres.",}),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
  description: z.string()
    .min(3, { message: "A descrição deve ter pelo menos 3 caracteres." })
    .max(400, { message: "A descrição não pode passar de 400 caracteres." })
    .optional()
    .or(z.literal('')),
  // Manter location como string para compatibilidade com eventos existentes
  location: z.string()
    .min(3, { message: "A localização deve ter pelo menos 3 caracteres." })
    .max(400, { message: "A localização não pode passar de 400 caracteres." })
    .optional(),
  // Novos campos para dados estruturados de localização
  locationData: locationDataSchema.optional(),
  startDateTime: z.date()
  .refine((date) => date > new Date(), { message: "A data do evento deve ser no futuro." }),
  price: z.string().optional(),
  isFree: z.boolean(),
  capacity: z.number().int().positive({ message: "A capacidade deve ser um número positivo." }),
  imageUrl: z.string().optional().or(z.literal('')),
});

// Exportar o tipo da locationData para usar no componente
export type LocationData = {
  address: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
  formattedAddress?: string;
  addressComponents?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
};