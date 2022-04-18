import { editor, Position } from "monaco-editor";
import * as React from "react";
import { openWidget } from "../widgets";
import { ServerlessWorkflowEditorChannelApi } from "../../../editor";
import { MessageBusClientApi } from "@kie-tools-core/envelope-bus/dist/api";
import { SwfServiceCatalogService } from "@kie-tools/serverless-workflow-service-catalog/dist/api";
import * as ReactDOM from "react-dom";
import { EmbeddedForm } from "@kie-tools/form/dist/view/embedded";
import { EmbeddedFormRef } from "@kie-tools/form/src/view/embedded";
import { formEnvelopeViewDiv } from "@kie-tools/form/dist/view/channel";

// Part of an example
//
// const formChannelApiImpl = {
//   formView__updateFormSchema(schema: object) {
//     console.info(`Received PING from`);
//   },
// };

export type SwfMonacoEditorCommandTypes =
  | "LogInToRhhcc"
  | "SetupServiceRegistryUrl"
  | "RefreshServiceCatalogFromRhhcc"
  | "ImportFunctionFromCompletionItem"
  | "OpenFunctionsWidget"
  | "OpenStatesWidget"
  | "OpenFunctionsCompletionItems";

export type SwfMonacoEditorCommandArgs = {
  LogInToRhhcc: {};
  SetupServiceRegistryUrl: {};
  RefreshServiceCatalogFromRhhcc: {};
  ImportFunctionFromCompletionItem: { containingService: SwfServiceCatalogService };
  OpenFunctionsWidget: { position: Position };
  OpenStatesWidget: { position: Position };
  OpenFunctionsCompletionItems: { newCursorPosition: Position };
};

export type SwfMonacoEditorCommandIds = Record<SwfMonacoEditorCommandTypes, string>;

export function initAugmentationCommands(
  editorInstance: editor.IStandaloneCodeEditor,
  channelApi: MessageBusClientApi<ServerlessWorkflowEditorChannelApi>
): SwfMonacoEditorCommandIds {
  const ref = React.createRef<EmbeddedFormRef>();

  return {
    SetupServiceRegistryUrl: editorInstance.addCommand(
      0,
      async (ctx, args: SwfMonacoEditorCommandArgs["SetupServiceRegistryUrl"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_setupServiceRegistryUrl.send();
      }
    )!,
    ImportFunctionFromCompletionItem: editorInstance.addCommand(
      0,
      async (ctx, args: SwfMonacoEditorCommandArgs["ImportFunctionFromCompletionItem"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_importFunctionFromCompletionItem.send(args.containingService);
      }
    )!,
    LogInToRhhcc: editorInstance.addCommand(0, async (ctx, args: SwfMonacoEditorCommandArgs["LogInToRhhcc"]) => {
      channelApi.notifications.kogitoSwfServiceCatalog_logInToRhhcc.send();
    })!,
    RefreshServiceCatalogFromRhhcc: editorInstance.addCommand(
      0,
      async (ctx, args: SwfMonacoEditorCommandArgs["RefreshServiceCatalogFromRhhcc"]) => {
        channelApi.notifications.kogitoSwfServiceCatalog_refresh.send();
      }
    )!,
    OpenFunctionsCompletionItems: editorInstance.addCommand(
      0,
      async (ctx, args: SwfMonacoEditorCommandArgs["OpenFunctionsCompletionItems"]) => {
        editorInstance.setPosition(args.newCursorPosition);
        editorInstance.trigger("OpenFunctionsCompletionItemsAtTheBottom", "editor.action.triggerSuggest", {});
      }
    )!,
    OpenFunctionsWidget: editorInstance.addCommand(
      0,
      async (ctx, args: SwfMonacoEditorCommandArgs["OpenFunctionsWidget"]) => {
        openWidget(editorInstance, {
          position: args.position,
          widgetId: "swf.functions.widget",
          backgroundColor: "lightgreen",
          domNodeHolder: {},
          onReady: ({ container }) => {
            console.info("Opening functions widget..");
            // Part of an example
            //
            ReactDOM.render(
              <EmbeddedForm
                ref={ref}
                apiImpl={{}}
                targetOrigin={window.location.origin}
                renderView={formEnvelopeViewDiv}
                initArgs={{
                  notificationsPanel: false,
                  removeRequired: true,
                }}
              />,
              container
            );
          },
          onClose: ({ container }) => {
            // Part of an example
            //
            return ReactDOM.unmountComponentAtNode(container);
          },
        });
      }
    )!,
    OpenStatesWidget: editorInstance.addCommand(
      0,
      async (ctx, args: SwfMonacoEditorCommandArgs["OpenStatesWidget"]) => {
        openWidget(editorInstance, {
          position: args.position,
          widgetId: "swf.states.widget",
          backgroundColor: "lightblue",
          domNodeHolder: {},
          onReady: ({ container }) => {
            console.info("Opening states widget..");
          },
          onClose: ({ container }) => {},
        });
      }
    )!,
  };
}
