import { z } from "zod";

export const suscripcionSchema = z.object({
    nombre: z.string().trim().min(1, "Por favor completa ambos campos."),
    email: z
        .string()
        .trim()
        .min(1, "Por favor completa ambos campos.")
        .email("Ingresa un correo válido.")
        .transform((val) => val.toLowerCase()),
});