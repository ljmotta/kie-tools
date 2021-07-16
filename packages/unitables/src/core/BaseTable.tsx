import * as React from "react";
import { BaseForm, BaseFormProps, BaseFormState, context } from "uniforms";

interface Props<Model> extends BaseFormProps<Model> {
  grid: React.ReactNode;
}

export class BaseTable<Model> extends BaseForm<Model, Props<Model>, BaseFormState<Model>> {
  constructor(props: Props<Model>) {
    super(props);
  }

  render() {
    return (
      <context.Provider value={this.getContext()}>
        <form {...this.getNativeFormProps()}>{this.props.grid}</form>
      </context.Provider>
    );
  }
}
