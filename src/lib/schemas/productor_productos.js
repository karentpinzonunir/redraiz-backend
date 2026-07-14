import { z } from "zod";

export const productorProductosQuerySchema = z.object({
    limit: z.coerce
        .number({ invalid_type_error: "El limit debe ser numérico" })
        .int()
        .positive()
        .default(200),

    offset: z.coerce
        .number({ invalid_type_error: "El offset debe ser numérico" })
        .int()
        .nonnegative()
        .default(0),

    region: z.coerce
        .number({ invalid_type_error: "El id de región debe ser numérico" })
        .int()
        .positive()
        .optional(),

    productor: z.coerce
        .number({ invalid_type_error: "El id de productor debe ser numérico" })
        .int()
        .positive()
        .optional(),

    producto: z.coerce
        .number({ invalid_type_error: "El id de producto debe ser numérico" })
        .int()
        .positive()
        .optional(),

    categoria: z.coerce
        .number({ invalid_type_error: "El id de categoría debe ser numérico" })
        .int()
        .positive()
        .optional(),
});