import { QueryClient } from "@tanstack/react-query";
import { GraphQLRequestError } from "./graphql-client.ts";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Erro de entrada (BAD_USER_INPUT) não melhora tentando de novo.
      retry: (failureCount, error) =>
        !(error instanceof GraphQLRequestError && error.code === "BAD_USER_INPUT") &&
        failureCount < 2,
    },
  },
});
