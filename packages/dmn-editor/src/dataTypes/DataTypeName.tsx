import * as React from "react";
import { useCallback, useRef } from "react";
import { DMN15__tItemDefinition } from "@kie-tools/dmn-marshaller/dist/schemas/dmn-1_5/ts-gen/types";
import { Flex } from "@patternfly/react-core/dist/js/layouts/Flex";
import { EditableNodeLabel, useEditableNodeLabel } from "../diagram/nodes/EditableNodeLabel";
import { TypeRefLabel } from "./TypeRefLabel";
import { useDmnEditorStoreApi } from "../store/Store";
import { renameItemDefinition } from "../mutations/renameItemDefinition";
import { useDmnEditorDerivedStore } from "../store/DerivedStore";
import { buildFeelQNameFromNamespace } from "../feel/buildFeelQName";

export function DataTypeName({
  isReadonly,
  itemDefinition,
  isActive,
  editMode,
  relativeToNamespace,
}: {
  isReadonly: boolean;
  editMode: "hover" | "double-click";
  itemDefinition: DMN15__tItemDefinition;
  isActive: boolean;
  relativeToNamespace: string;
}) {
  const { isEditingLabel, setEditingLabel, triggerEditing, triggerEditingIfEnter } = useEditableNodeLabel();

  const dmnEditorStoreApi = useDmnEditorStoreApi();
  const { dataTypesById, importsByNamespace } = useDmnEditorDerivedStore();

  const onRenamed = useCallback(
    (newName: string | undefined) => {
      if (isReadonly) {
        return;
      }

      if (!newName?.trim()) {
        return;
      }

      dmnEditorStoreApi.setState((state) => {
        renameItemDefinition({
          definitions: state.dmn.model.definitions,
          newName,
          itemDefinitionId: itemDefinition["@_id"]!,
          dataTypesById,
        });
      });
    },
    [dataTypesById, dmnEditorStoreApi, isReadonly, itemDefinition]
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const previouslyFocusedElement = useRef<Element | undefined>();

  const restoreFocus = useCallback(() => {
    // We only restore the focus to the previously focused element if we're still holding focus. If focus has changed, we let it be.
    setTimeout(() => {
      if (document.activeElement === inputRef.current) {
        (previouslyFocusedElement.current as any)?.focus?.();
      }
    }, 0);
  }, []);

  const dataType = dataTypesById.get(itemDefinition["@_id"]!);

  const displayName = buildFeelQNameFromNamespace({
    namedElement: itemDefinition,
    importsByNamespace,
    namespace: dataType!.namespace,
    relativeToNamespace,
  });

  return (
    <>
      {editMode === "hover" && (
        <input
          ref={inputRef}
          key={itemDefinition["@_id"] + itemDefinition["@_name"]}
          style={{
            border: 0,
            flexGrow: 1,
            outline: "none",
            display: "inline",
            background: "transparent",
            width: "100%",
          }}
          disabled={isReadonly}
          defaultValue={displayName.full}
          onFocus={(e) => {
            previouslyFocusedElement.current = document.activeElement ?? undefined; // Save potential focused element.
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              e.preventDefault();
              e.currentTarget.value = e.currentTarget.value.trimStart();
              onRenamed(e.currentTarget.value);
            } else if (e.key === "Escape") {
              e.stopPropagation();
              e.preventDefault();
              e.currentTarget.value = itemDefinition["@_name"];
              e.currentTarget.blur();
            }
          }}
          onBlur={(e) => {
            onRenamed(e.currentTarget.value);
            restoreFocus();
          }}
        />
      )}
      {editMode === "double-click" && (
        <Flex
          tabIndex={-1}
          style={isEditingLabel ? { flexGrow: 1 } : {}}
          flexWrap={{ default: "nowrap" }}
          spaceItems={{ default: "spaceItemsNone" }}
          justifyContent={{ default: "justifyContentFlexStart" }}
          alignItems={{ default: "alignItemsCenter" }}
          onDoubleClick={triggerEditing}
          onKeyDown={triggerEditingIfEnter}
        >
          {/* Using this component here is not ideal, as we're not dealing with Node names, but it works well enough */}
          <EditableNodeLabel
            truncate={true}
            grow={true}
            isEditing={isEditingLabel}
            setEditing={setEditingLabel}
            onChange={onRenamed}
            saveOnBlur={true}
            value={itemDefinition["@_name"]}
            key={itemDefinition["@_id"]}
            position={"top-left"}
            namedElement={itemDefinition}
            namedElementQName={{
              type: "xml-qname",
              localPart: itemDefinition["@_name"],
              prefix: displayName.prefix,
            }}
          />
          {!isEditingLabel && (
            <TypeRefLabel
              typeRef={itemDefinition.typeRef}
              isCollection={itemDefinition["@_isCollection"]}
              relativeToNamespace={relativeToNamespace}
            />
          )}
        </Flex>
      )}
    </>
  );
}