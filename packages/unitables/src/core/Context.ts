import { Context } from "uniforms";
import { createContext } from "react";
import { Grid } from "./Grid";

export type TableContext<Model> = Context<Model> & {
  grid: Grid;
};

export const context = createContext<TableContext<any> | null>(null);
