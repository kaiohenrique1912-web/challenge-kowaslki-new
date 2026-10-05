import { describe, expect, test } from "bun:test";
import { searchAlertInputSchema } from "./search-alert.ts";

describe("searchAlertInputSchema", () => {
  test("aceita uma busca de compra com pelo menos um canal", () => {
    const input = { searchUrl: "/comprar/imovel/pinheiros?quartos=3", channels: ["APP", "EMAIL"] };
    expect(searchAlertInputSchema.safeParse(input).success).toBe(true);
    expect(
      searchAlertInputSchema.safeParse({ ...input, searchUrl: "/comprar/imovel" }).success,
    ).toBe(true);
  });

  test("recusa URL que não é da busca, nenhum canal ou canal repetido", () => {
    const issue = (value: unknown) => searchAlertInputSchema.safeParse(value).error?.issues[0];
    expect(issue({ searchUrl: "/alugar/imovel", channels: ["APP"] })?.message).toBe(
      "O alerta precisa ser de uma busca de imóveis à venda.",
    );
    expect(issue({ searchUrl: "/comprar/imovel", channels: [] })?.message).toBe(
      "Escolha pelo menos uma forma de receber o alerta.",
    );
    expect(issue({ searchUrl: "/comprar/imovel", channels: ["APP", "APP"] })?.message).toBe(
      "Canais repetidos.",
    );
  });
});
