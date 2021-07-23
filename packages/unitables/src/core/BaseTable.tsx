import * as React from "react";
import { BaseForm, BaseFormProps, BaseFormState, context } from "uniforms";
import { Grid } from "./Grid";

interface Props<Model> extends BaseFormProps<Model> {
  grid: Grid;
}

export class BaseTable<Model> extends BaseForm<Model, Props<Model>, BaseFormState<Model>> {
  constructor(props: Props<Model>) {
    super(props);
  }

  render() {
    return (
      <context.Provider value={{ ...this.getContext() }}>
        <form {...this.props.grid.myComponent(this.getContext().schema)} />
      </context.Provider>
    );
  }
}
