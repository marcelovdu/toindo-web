import * as z from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(3, {message: "O título deve ter pelo menos 3 caracteres.",}),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
  description: z.string()
    .min(3, { message: "A descrição deve ter pelo menos 3 caracteres." })
    .max(400, { message: "A descrição não pode passar de 400 caracteres." })
    .optional()
    .or(z.literal('')),
  location: z.string()
    .min(3, { message: "A localização deve ter pelo menos 3 caracteres." })
    .max(400, { message: "A localização não pode passar de 400 caracteres." })
    .optional(),
  startDateTime: z.date()
  .refine((date) => date > new Date(), { message: "A data do evento deve ser no futuro." }),
  price: z.string().optional(),
  isFree: z.boolean(),
  capacity: z.number().int().positive({ message: "A capacidade deve ser um número positivo." }),
  imageUrl: z.string().optional().or(z.literal('')),
});