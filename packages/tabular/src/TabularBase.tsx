import * as React from "react";
import { BaseForm, BaseFormProps, BaseFormState, context } from "uniforms";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { MyApp } from "./Tabular";
import Ajv from "ajv";
import { useMemo } from "react";

export class MyCustomBase<Model> extends BaseForm<Model, BaseFormProps<Model>, BaseFormState<Model>> {
  constructor(props: BaseFormProps<Model>) {
    super(props);
  }

  render() {
    return (
      <context.Provider value={this.getContext()}>
        <form {...this.getNativeFormProps()}>
          <MyApp />
        </form>
      </context.Provider>
    );
  }
}

const ajv = new Ajv({ allErrors: true, useDefaults: true });

function createValidator(schema: any) {
  const validator = ajv.compile(schema);

  return (model: any) => {
    validator(model);
    return validator.errors?.length ? { details: validator.errors } : null;
  };
}

class MyCustomBridge extends JSONSchemaBridge {
  public getField(name: string): Record<string, any> {
    return super.getField(name);
  }
}

interface TabularProps {
  schema: any;
}

export function Tabular(props: TabularProps) {
  const bridge = useMemo(
    () => new JSONSchemaBridge(props.schema ?? {}, createValidator(props.schema ?? {})),
    [props.schema]
  );

  return (
    <div style={{ width: "100%" }}>
      <MyCustomBase
        schema={bridge}
        autosave={true}
        autosaveDelay={1000}
        error={false}
        label={false}
        model={{}}
        noValidate={false}
        onSubmit={undefined}
      />
    </div>
  );
}
