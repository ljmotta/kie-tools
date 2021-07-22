// create useTable without invanraint

// create createAutoTable... using createAutoField as base

// create AutoFieldTable... using AutoField

import {
  ComponentType,
  createContext,
  createElement,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { TableContext, tableContext } from "./Context";
import { GuaranteedProps, Override, useField } from "uniforms";
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
import { joinName } from "uniforms/es6";
import { get, mapValues } from "lodash";

export function useTable() {
  return useContext(tableContext);
}

export type ConnectFieldOptions = {
  initialValue?: boolean;
  kind?: "leaf" | "node";
};

export type ConnectedFieldProps<Props extends Record<string, unknown>, Value = Props["value"]> = Override<
  Props,
  Override<
    Partial<GuaranteedProps<Value>>,
    {
      label?: Props["label"] | boolean | null | string;
      name: string;
      placeholder?: Props["placeholder"] | boolean | null | string;
    }
  >
>;

export type ConnectedField<Props extends Record<string, unknown>, Value = Props["value"]> = FunctionComponent<
  ConnectedFieldProps<Props, Value>
> & {
  Component: ComponentType<Props>;
  options?: ConnectFieldOptions;
};

function connectTableField<Props extends Record<string, unknown>, Value = Props["value"]>(
  Component: ComponentType<Props>,
  options?: ConnectFieldOptions
): ConnectedField<Props, Value> {
  function Field(props: ConnectedFieldProps<Props, Value>) {
    const [fieldProps, context] = useTableField(props.name, props, options);

    const hasChainName = props.name !== "";
    const anyFlowingPropertySet = Object.keys(context?.state ?? {}).some((key) => {
      const next = props[key];
      return next !== null && next !== undefined;
    });

    if (!anyFlowingPropertySet && !hasChainName) {
      return <Component {...(props as unknown as Props)} {...fieldProps} />;
    }

    const nextContext = { ...context };
    if (anyFlowingPropertySet) {
      nextContext.state = mapValues(nextContext.state, (prev, key) => {
        const next = props[key];
        return next !== null && next !== undefined ? !!next : prev;
      });
    }

    if (hasChainName) {
      nextContext.name = (nextContext?.name ?? [""]).concat(props.name);
    }

    return (
      <tableContext.Provider value={nextContext as any}>
        <Component {...(props as unknown as Props)} {...fieldProps} />
      </tableContext.Provider>
    );
  }

  Field.displayName = `${Component.displayName || Component.name}Field`;

  return Object.assign(Field, { Component, options });
}

function propagate(prop: ReactNode, schema: ReactNode, state: boolean, fallback: ReactNode): [ReactNode, ReactNode] {
  const forcedFallbackInProp = prop === true || prop === undefined;
  const forcedFallbackInSchema = schema === true || schema === undefined;

  const schemaValue = forcedFallbackInSchema ? fallback : schema;
  const value =
    prop === "" || prop === false || prop === null || (forcedFallbackInProp && (forcedFallbackInSchema || !state))
      ? ""
      : forcedFallbackInProp
      ? schemaValue
      : prop;

  return [value, schemaValue];
}

function useTableField<Props extends Record<string, any>, Value = Props["value"], Model = Record<string, any>>(
  fieldName: string,
  props: Props,
  options?: { absoluteName?: boolean; initialValue?: boolean }
) {
  const context = useTable();

  const name = joinName(options?.absoluteName ? "" : context?.name, fieldName);
  const state = mapValues(context?.state, (prev, key) => {
    const next = props[key];
    return next !== null && next !== undefined ? !!next : prev;
  });

  const changed = !!get(context?.changedMap, name);
  const error = context?.schema.getError(name, context.error);
  const errorMessage = context?.schema.getErrorMessage(name, context.error);
  const field = context?.schema.getField(name);
  const fieldType = context?.schema.getType(name);
  const fields = context?.schema.getSubfields(name);
  const schemaProps = context?.schema.getProps(name, { ...state, ...props });

  const [label, labelFallback] = propagate(props.label, schemaProps?.label, state.label, "");
  const [placeholder] = propagate(
    props.placeholder,
    schemaProps?.placeholder,
    state.placeholder,
    label || labelFallback
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const id = useMemo(() => context?.randomId(), []);
  const onChange = useCallback(
    (value?: Value, key: string = name) => {
      context?.onChange(key, value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context?.onChange, name]
  );

  const valueFromModel: Value | undefined = get(context?.model, name);
  let initialValue: Value | undefined;
  let value: Value | undefined = props.value ?? valueFromModel;

  if (value === undefined) {
    value = context?.schema.getInitialValue(name, props);
    initialValue = value;
  } else if (props.value !== undefined && props.value !== valueFromModel) {
    initialValue = props.value;
  }

  if (options?.initialValue !== false) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const required = props.required ?? schemaProps?.required;
      if (required && initialValue !== undefined) {
        onChange(initialValue);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  }

  const fieldProps: GuaranteedProps<Value> & Props = {
    id,
    ...state,
    changed,
    error,
    errorMessage,
    field,
    fieldType,
    fields,
    onChange,
    value,
    ...schemaProps,
    ...props,
    label,
    name,
    // TODO: Should we assert `typeof placeholder === 'string'`?
    placeholder: placeholder as string,
  };

  return [fieldProps, context] as [typeof fieldProps, typeof context];
}

type AutoFieldProps = {
  component?: Component;
  name: string;
  [prop: string]: unknown;
};

type Component = ComponentType<any> | ReturnType<typeof connectTableField>;

type ComponentDetector = (props: ReturnType<typeof useField>[0], uniforms: TableContext<unknown>) => Component;

export function createAutoFieldTable(defaultComponentDetector: ComponentDetector) {
  const context = createContext<ComponentDetector>(defaultComponentDetector);

  function AutoField(rawProps: AutoFieldProps): ReactElement {
    const [props, uniforms] = useTableField(rawProps.name, rawProps);
    const componentDetector = useContext(context);
    const component = props.component ?? componentDetector(props, uniforms as any);

    return "options" in component && component.options?.kind === "leaf"
      ? createElement(component.Component, props)
      : createElement(component, rawProps);
  }

  return Object.assign(AutoField, {
    componentDetectorContext: context,
    defaultComponentDetector,
  });
}

export const AutoField = createAutoFieldTable((props) => {
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
