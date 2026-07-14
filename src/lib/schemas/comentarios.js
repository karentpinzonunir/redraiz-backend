import { z } from "zod";

export const comentarioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || "Anónimo"),

  comentario: z
    .string()
    .trim()
    .min(1, "El comentario es requerido."),
});