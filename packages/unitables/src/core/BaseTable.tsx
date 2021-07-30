import * as React from "react";
import { BaseForm, BaseFormProps, BaseFormState, context } from "uniforms";

interface Props<Model> extends BaseFormProps<Model> {
  children: React.ReactElement;
}

export class BaseTable<Model> extends BaseForm<Model, Props<Model>, BaseFormState<Model>> {
  constructor(props: Props<Model>) {
    super(props);
  }

  render() {
    return (
      <context.Provider value={{ ...this.getContext() }}>
        <table style={{ display: "contents" }}>{this.props.children}</table>
      </context.Provider>
    );
  }
}
