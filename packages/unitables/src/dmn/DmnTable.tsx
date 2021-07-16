import * as React from "react";
import { joinName, useForm } from "uniforms";

/**
 * create table. make api to append to final element
 * create cell, option to pass component inside cell, access cell
 * @constructor
 */

export function DmnTable() {
  const emptyColumn = React.useMemo(() => ({ readOnly: true, value: "" }), []);
  const inputColumn = React.useCallback((input: number) => [{ readOnly: true, value: `Input ${input}` }], []);
  const [inputSize, setInputSize] = React.useState<number>(1);
  const [outputSize, setOutputSize] = React.useState<number>(1);

  const header = React.useMemo(
    () => [
      [
        { readOnly: true, value: "#" },
        { readOnly: true, colSpan: inputSize + outputSize, value: "DMN Runner" },
      ],
      [
        { readOnly: true, value: "" },
        { readOnly: true, colSpan: inputSize, value: "Input" },
        { readOnly: true, colSpan: outputSize, value: "Output" },
      ],
    ],
    [inputSize, outputSize]
  );

  const { schema } = useForm();

  const determineField = React.useCallback(
    (fieldName, parentName = ""): any => {
      const joinedName = joinName(parentName, fieldName);
      const field = schema.getField(joinedName);

      if (field.type === "object") {
        const subFields = schema.getSubfields(joinedName);
        const insideFields = subFields.reduce((acc: any[], subField: string) => {
          const field = determineField(subField, joinedName);
          return [...acc, field];
        }, []);
        const headerSize = insideFields.length - 1 ? insideFields.length - 1 : 1;
        const objectHeader = { readOnly: true, colSpan: headerSize, value: joinedName };
        return [[objectHeader], insideFields];
      }

      return { readOnly: true, value: fieldName };
    },
    [schema]
  );

  // React.useEffect(() => {
  //   const subfields = schema.getSubfields();
  //   const inputs = subfields.reduce((acc: any[], fieldName: string) => {
  //     return [...acc, determineField(fieldName)];
  //   }, []);
  //   const something = inputs.reduce((acc, input) => acc.concat(input), []);
  //   if (something.find((e: any) => Array.isArray(e))) {
  //     const newGrid = [...header, ...something].map((row) => {
  //       if (row.length > 0) {
  //         return [{ readOnly: true, value: "" }, ...row];
  //       }
  //       return [...row];
  //     });
  //     console.log(newGrid);
  //     setGrid(newGrid);
  //   } else {
  //     console.log([...header, something]);
  //     const newGrid = [...header, something].map((row) => {
  //       if (row.length > 0) {
  //         return [{ readOnly: true, value: "" }, ...row];
  //       }
  //       return [...row];
  //     });
  //     console.log(newGrid);
  //     setGrid(newGrid);
  //   }
  //   console.log(something.length);
  //   const inputSize = something.length - 1 > 0 ? something.length : 1;
  //   console.log("input size ", inputSize);
  //   setInputSize(inputSize);
  // }, [schema, header, determineField]);
  //
  // // add header
  // React.useEffect(() => {}, [grid]);

  return (
    <div style={{ width: "100%" }}>
      {/* table component here */}
      <p>here</p>
    </div>
  );
}
