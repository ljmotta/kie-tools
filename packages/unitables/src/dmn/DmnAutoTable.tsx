import * as React from "react";
import { AutoTable } from "../core";
import { DmnGrid } from "./DmnGrid";
import { DmnValidator } from "./DmnValidator";
import { useEffect, useMemo, useState } from "react";
import JSONSchemaBridge from "uniforms-bridge-json-schema";
import { Grid } from "../core/Grid";

interface DmnAutoTableProps {
  schema: any;
}

export function DmnAutoTable(props: DmnAutoTableProps) {
  const validator = useMemo(() => new DmnValidator(), []);
  const [bridge, setBridge] = useState<JSONSchemaBridge>();
  const [grid, setGrid] = useState<Grid>();

  useEffect(() => {
    setBridge(validator.getBridge(props.schema ?? {}));
    setGrid(new DmnGrid(validator, props.schema ?? {}));
  }, [props.schema, validator]);

  return (
    <div style={{ width: "100%" }}>
      {bridge && grid && (
        <AutoTable
          grid={grid}
          schema={bridge}
          autosave={true}
          autosaveDelay={1000}
          error={false}
          label={false}
          model={{}}
          noValidate={false}
          onSubmit={undefined}
        />
      )}
    </div>
  );
}
