import {
  BoolField,
  DateField,
  ListField,
  NestField,
  NumField,
  RadioField,
  SelectField,
  TextField,
} from "uniforms-patternfly";
import { ComponentType, createContext, createElement, ReactElement, useContext } from "react";
import { useField, connectField, Context } from "uniforms";
import omit from "lodash/omit";

type Component = ComponentType<any> | ReturnType<typeof connectField>;

export type AutoFieldProps = {
  component?: Component;
  name: string;
  [prop: string]: unknown;
};

type ComponentDetector = (props: ReturnType<typeof useField>[0], uniforms: Context<unknown>) => Component;

function createAutoField(defaultComponentDetector: ComponentDetector) {
  const context = createContext<ComponentDetector>(defaultComponentDetector);

  function AutoField(rawProps: AutoFieldProps): ReactElement {
    const [props, uniforms] = useField(rawProps.name, rawProps);
    const componentDetector = useContext(context);
    const component = props.component ?? componentDetector(props, uniforms);

    return "options" in component && component.options?.kind === "leaf"
      ? createElement(component.Component, { ...props, title: "" })
      : createElement(component, { ...rawProps, title: "" });
  }

  return Object.assign(AutoField, {
    componentDetectorContext: context,
    defaultComponentDetector,
  });
}

export const AutoField = createAutoField((props) => {
  if (props.allowedValues) {
    return props.checkboxes && props.fieldType !== Array ? RadioField : SelectField;
  }

  switch (props.fieldType) {
    case Array:
      return ListField;
    case Boolean:
      return BoolField;
    case Date:
      return DateField;
    case Number:
      return NumField;
    case Object:
      return NestField;
    case String:
    default:
      return TextField;
  }
});
