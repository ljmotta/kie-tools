import * as React from "react";
import { BaseForm, BaseFormProps, BaseFormState } from "uniforms";
import { Table } from "./Table";
import { Grid } from "./Grid";
import { tableContext } from "./Context";

interface Props<Model> extends BaseFormProps<Model> {
  grid: Grid;
}

export class BaseTable<Model> extends BaseForm<Model, Props<Model>, BaseFormState<Model>> {
  constructor(props: Props<Model>) {
    super(props);
  }

  render() {
    return (
      <tableContext.Provider value={{ ...this.getContext(), grid: this.props.grid }}>
        <form {...this.getNativeFormProps()}>
          <Table />
        </form>
      </tableContext.Provider>
    );
  }
}
