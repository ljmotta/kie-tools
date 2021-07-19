import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Tr, Td, TableComposable, Tbody } from "@patternfly/react-table";
import { useForm } from "uniforms";
import { Grid } from "./Grid";
import { Cell } from "./Cell";

interface TableProps {
  grid?: Grid;
}

export function Table(props: TableProps) {
  const { schema } = useForm();
  const [grid, setGrid] = useState<Grid>();

  useEffect(() => {
    const aaaa = props.grid ?? new Grid(schema);
    aaaa.test();
    setGrid(aaaa);
  }, [schema, props.grid]);

  return (
    <TableComposable id={"auto-table"}>
      {grid?.getGrid().map((row, index) => (
        <Tbody key={`auto-table-row-${index}`}>
          <Tr>
            {row.map((cell, jndex) => (
              <Td key={`auto-table-row-${index}-${jndex}`}>
                <Cell>{cell}</Cell>
              </Td>
            ))}
          </Tr>
        </Tbody>
      ))}
    </TableComposable>
  );
}
