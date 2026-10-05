import { GraphQLScalarType, Kind } from "graphql";

/** Internamente epoch ms (number); na API, string ISO-8601 UTC. */
export const DateTimeScalar = new GraphQLScalarType<number, string>({
  name: "DateTime",
  description: "Data/hora ISO-8601 (UTC).",
  serialize(value) {
    if (typeof value === "number") return new Date(value).toISOString();
    if (value instanceof Date) return value.toISOString();
    throw new TypeError("DateTime deve ser epoch ms ou Date");
  },
  parseValue(value) {
    const ms = typeof value === "string" ? Date.parse(value) : Number.NaN;
    if (Number.isNaN(ms)) throw new TypeError("DateTime inválido: use ISO-8601");
    return ms;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) throw new TypeError("DateTime inválido: use ISO-8601");
    const ms = Date.parse(ast.value);
    if (Number.isNaN(ms)) throw new TypeError("DateTime inválido: use ISO-8601");
    return ms;
  },
});
