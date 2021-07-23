import * as React from "react";
import { AutoTable } from "../core";
import { DmnGrid } from "./DmnGrid";
import { DmnValidator } from "./DmnValidator";
import { useEffect, useMemo, useState } from "react";
import JSONSchemaBridge from "uniforms-bridge-json-schema";
import { Grid } from "../core/Grid";

interface DmnTableProps {
  schema: any;
}

export function DmnTable(props: DmnTableProps) {
  const validator = useMemo(() => new DmnValidator(), []);
  const [bridge, setBridge] = useState<JSONSchemaBridge>();
  const [grid, setGrid] = useState<Grid>();
  const [inputSize, setInputSzie] = useState<number>(1);

  useEffect(() => {
    setBridge(validator.getBridge(props.schema ?? {}));
    setGrid(new DmnGrid(validator.getBridge(props.schema ?? {})));
  }, [props.schema, validator]);

  if (bridge && grid) {
    return (
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "auto auto" }}>
        <AutoTable grid={grid} header={true} schema={bridge} />
        <AutoTable grid={grid} schema={bridge} />
      </div>
    );
  }

  return <></>;
}
