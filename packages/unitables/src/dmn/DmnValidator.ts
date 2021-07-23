import Ajv from "ajv";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";

export class DmnValidator {
  protected readonly ajv = new Ajv({ allErrors: true, schemaId: "auto", useDefaults: true });

  public createValidator(jsonSchema: any) {
    const validator = this.ajv.compile(jsonSchema);

    return (model: any) => {
      // AJV doesn't handle dates objects. This transformation converts Dates to their UTC format.
      validator(JSON.parse(JSON.stringify(model)));

      if (validator.errors && validator.errors.length) {
        return { details: validator.errors };
      }
      return null;
    };
  }

  public getBridge(formSchema: any) {
    return new DmnTableJsonSchemaBridge(formSchema, this.createValidator(formSchema));
  }
}

export class DmnTableJsonSchemaBridge extends JSONSchemaBridge {
  public getProps(name: string, props: Record<string, any> = {}) {
    const ready = super.getProps(name, props);
    ready.label = "";
    return ready;
  }
}
