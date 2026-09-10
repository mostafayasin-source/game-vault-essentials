import { queryOptions } from "@tanstack/react-query";
import { listProducts } from "./products.functions";

export const productsQueryOptions = queryOptions({
  queryKey: ["products"],
  queryFn: () => listProducts(),
  staleTime: 5 * 60 * 1000,
});
