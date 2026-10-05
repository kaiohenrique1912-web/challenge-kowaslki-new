import { describe, expect, test } from "bun:test";
import { createTestApp, gql, TEST_NOW } from "../../testing/test-app.ts";

const app = createTestApp();
const USER = { "x-user-id": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee" };
const OTHER = { "x-user-id": "99999999-8888-4777-8666-555555555555" };

const CREATE = `mutation($input: CreateSearchAlertInput!) {
  createSearchAlert(input: $input) { id searchUrl channels createdAt }
}`;
const LIST = `{ searchAlerts { id searchUrl channels } }`;

type Alert = { id: string; searchUrl: string; channels: string[]; createdAt?: string };

const create = (input: unknown, headers: Record<string, string> = USER) =>
  gql<{ createSearchAlert: Alert }>(app, CREATE, { input }, headers);
const list = async (headers: Record<string, string>) =>
  (await gql<{ searchAlerts: Alert[] }>(app, LIST, {}, headers)).data?.searchAlerts ?? [];

describe("alertas de busca", () => {
  test("cria o alerta da busca com os canais escolhidos", async () => {
    const body = await create({
      searchUrl: "/comprar/imovel/pinheiros?quartos=3",
      channels: ["APP", "EMAIL"],
    });
    expect(body.errors).toBeUndefined();
    expect(body.data?.createSearchAlert).toMatchObject({
      searchUrl: "/comprar/imovel/pinheiros?quartos=3",
      channels: ["APP", "EMAIL"],
      createdAt: new Date(TEST_NOW).toISOString(),
    });
  });

  test("a mesma busca de novo só troca os canais; cada usuário vê só os seus", async () => {
    await create({ searchUrl: "/comprar/imovel?tipos=casa", channels: ["APP"] });
    await create({ searchUrl: "/comprar/imovel?tipos=casa", channels: ["WHATSAPP"] });
    const mine = await list(USER);
    expect(mine.filter((a) => a.searchUrl === "/comprar/imovel?tipos=casa")).toEqual([
      expect.objectContaining({ channels: ["WHATSAPP"] }),
    ]);
    expect(await list(OTHER)).toEqual([]);
    expect(await list({})).toEqual([]);
  });

  test("entrada inválida e falta de usuário são BAD_USER_INPUT", async () => {
    const noChannel = await create({ searchUrl: "/comprar/imovel", channels: [] });
    expect(noChannel.errors?.[0]?.extensions).toMatchObject({
      code: "BAD_USER_INPUT",
      field: "channels",
    });
    const rent = await create({ searchUrl: "/alugar/imovel", channels: ["APP"] });
    expect(rent.errors?.[0]?.message).toBe("O alerta precisa ser de uma busca de imóveis à venda.");
    const anonymous = await create({ searchUrl: "/comprar/imovel", channels: ["APP"] }, {});
    expect(anonymous.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });
});
