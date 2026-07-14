import { z } from "zod";

export const historiasQuerySchema = z.object({
  limit: z.coerce
    .number({ invalid_type_error: "El limit debe ser numérico" })
    .int()
    .positive("El limit debe ser un número positivo")
    .optional(),
});