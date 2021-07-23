import * as React from "react";
import { BaseForm, BaseFormProps, BaseFormState, context } from "uniforms";
import { Grid } from "./Grid";

interface Props<Model> extends BaseFormProps<Model> {
  grid: Grid;
  header: boolean;
}

export class BaseTable<Model> extends BaseForm<Model, Props<Model>, BaseFormState<Model>> {
  constructor(props: Props<Model>) {
    super(props);
  }

  render() {
    return (
      <context.Provider value={{ ...this.getContext() }}>
        {this.props.header ? (
          <form style={{ display: "contents" }} {...this.props.grid.getInputsHeader()} />
        ) : (
          <form style={{ display: "contents" }} {...this.props.grid.getInputsFields()} />
        )}
      </context.Provider>
    );
  }
}
