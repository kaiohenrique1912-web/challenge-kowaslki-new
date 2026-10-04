import { z } from "zod";
import { AMENITY_CODES, isAmenityApplicable } from "../domain/amenities.ts";
import { PROPERTY_LIMITS as L, SAO_PAULO_BOUNDS, SAO_PAULO_CEP_RANGE } from "../domain/limits.ts";
import { PROPERTY_TYPES, TYPES_WITH_FLOOR } from "../domain/property.ts";

/**
 * Validação dos dados informados de um imóvel (cadastro/edição e seed).
 * Fonte: docs/business-rules.md §2.1 e §3. Mensagens em pt-BR.
 */

const int = (label: string, { min, max }: { min: number; max: number }) =>
  z
    .number({ error: `${label} é obrigatório.` })
    .int(`${label} deve ser um número inteiro.`)
    .min(min, `${label} deve ser no mínimo ${min.toLocaleString("pt-BR")}.`)
    .max(max, `${label} deve ser no máximo ${max.toLocaleString("pt-BR")}.`);

const text = (label: string, { min, max }: { min: number; max: number }) =>
  z
    .string({ error: `${label} é obrigatório.` })
    .trim()
    .min(min, `${label} deve ter no mínimo ${min} caracteres.`)
    .max(max, `${label} deve ter no máximo ${max} caracteres.`);

const cepSchema = z
  .string({ error: "CEP é obrigatório." })
  .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000.")
  .refine((cep) => {
    const digits = Number(cep.replace("-", ""));
    return digits >= SAO_PAULO_CEP_RANGE.min && digits <= SAO_PAULO_CEP_RANGE.max;
  }, "CEP fora do município de São Paulo.");

export const propertyInputSchema = z
  .object({
    type: z.enum(PROPERTY_TYPES, { error: "Tipo de imóvel inválido." }),
    cep: cepSchema,
    street: text("Rua", L.street),
    number: text("Número", L.number),
    complement: text("Complemento", L.complement).nullable(),
    neighborhoodId: z.number().int().positive("Bairro é obrigatório."),
    latitude: z
      .number()
      .min(SAO_PAULO_BOUNDS.south, "Localização fora de São Paulo.")
      .max(SAO_PAULO_BOUNDS.north, "Localização fora de São Paulo."),
    longitude: z
      .number()
      .min(SAO_PAULO_BOUNDS.west, "Localização fora de São Paulo.")
      .max(SAO_PAULO_BOUNDS.east, "Localização fora de São Paulo."),
    salePrice: int("Valor de venda", L.salePrice),
    condoFee: int("Condomínio", L.condoFee),
    iptu: int("IPTU", L.iptu),
    area: int("Área", L.area),
    bedrooms: int("Quartos", L.bedrooms),
    suites: int("Suítes", { min: 0, max: L.bedrooms.max }),
    bathrooms: int("Banheiros", L.bathrooms),
    parkingSpaces: int("Vagas", L.parkingSpaces),
    floor: int("Andar", L.floor).nullable(),
    isFurnished: z.boolean(),
    acceptsPets: z.boolean(),
    nearSubway: z.boolean(),
    isExclusive: z.boolean(),
    isRented: z.boolean(),
    monthlyRent: int("Aluguel atual", L.monthlyRent).nullable(),
    description: text("Descrição", L.description),
    amenities: z.array(z.enum(AMENITY_CODES, { error: "Comodidade inválida." })),
    photos: z
      .array(z.string().min(1).max(500))
      .min(L.photos.min, "Envie pelo menos 1 foto.")
      .max(L.photos.max, `Envie no máximo ${L.photos.max} fotos.`),
  })
  .superRefine((p, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (p.type === "STUDIO") {
      if (p.area > L.studioArea.max) {
        issue("area", `Studio deve ter no máximo ${L.studioArea.max} m².`);
      }
      if (p.bedrooms > L.studioBedrooms.max) issue("bedrooms", "Studio tem no máximo 1 quarto.");
    } else if (p.bedrooms < 1) {
      issue("bedrooms", "O imóvel deve ter pelo menos 1 quarto.");
    }

    if (p.suites > p.bedrooms) issue("suites", "Suítes não podem passar do número de quartos.");
    if (p.bathrooms < p.suites) {
      issue("bathrooms", "Banheiros não podem ser menos que as suítes.");
    }
    if (p.type === "HOUSE" && p.condoFee !== 0) issue("condoFee", "Casa não tem condomínio.");

    const hasFloor = TYPES_WITH_FLOOR.includes(p.type);
    if (!hasFloor && p.floor !== null) issue("floor", "Casas não têm andar.");

    if (p.isRented && p.monthlyRent === null) {
      issue("monthlyRent", "Informe o aluguel atual do imóvel alugado.");
    }
    if (!p.isRented && p.monthlyRent !== null) {
      issue("monthlyRent", "Aluguel atual só vale para imóvel já alugado.");
    }

    if (new Set(p.amenities).size !== p.amenities.length) {
      issue("amenities", "Comodidades repetidas.");
    }
    for (const code of p.amenities) {
      if (!isAmenityApplicable(code, p.type)) {
        issue("amenities", `Comodidade "${code}" não se aplica a este tipo de imóvel.`);
      }
    }
  });

export type PropertyInput = z.infer<typeof propertyInputSchema>;
