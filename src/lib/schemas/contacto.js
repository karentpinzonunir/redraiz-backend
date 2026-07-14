import { z } from "zod";

export const contactoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido"),
  apellido: z.string().trim().optional().nullable(),
  nombre_finca: z.string().trim().optional().nullable(),
  ciudad: z.string().trim().min(1, "La ciudad es requerida"),
  telefono: z.string().trim().min(1, "El teléfono es requerido"),
  correo: z.string().trim().min(1, "El correo es requerido").email("Correo inválido"),
  tipo_producto: z.coerce.number().int(),
  historia: z.string().trim().min(1, "La historia es requerida"),
});