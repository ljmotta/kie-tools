import * as React from "react";

interface CellProps {
  children: any;
}

export function Cell(props: CellProps) {
  return (
    <div>
      <p>{JSON.stringify(props.children)}</p>
    </div>
  );
}
