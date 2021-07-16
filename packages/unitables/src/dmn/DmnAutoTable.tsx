import * as React from "react";
import { AutoTable } from "../core";
import { DmnTable } from "./DmnTable";
import { DmnValidator } from "./DmnValidator";
import { useEffect, useMemo, useState } from "react";
import JSONSchemaBridge from "uniforms-bridge-json-schema";

interface DmnAutoTableProps {
  schema: any;
}

export function DmnAutoTable(props: DmnAutoTableProps) {
  const validator = useMemo(() => new DmnValidator(), []);
  const [bridge, setBridge] = useState<JSONSchemaBridge>();

  useEffect(() => {
    setBridge(validator.getBridge(props.schema ?? {}));
  }, [props.schema]);

  return (
    <div style={{ width: "100%" }}>
      {bridge && (
        <AutoTable
          grid={<DmnTable />}
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
