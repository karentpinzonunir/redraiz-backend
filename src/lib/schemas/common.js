import { z } from "zod";

export const idParamSchema = z.object({
    id: z.coerce
        .number({ invalid_type_error: "El ID debe ser numérico" })
        .int()
        .positive("El ID debe ser un número positivo"),
});