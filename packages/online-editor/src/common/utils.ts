/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function extractFileExtension(fileName: string) {
  return fileName.match(/[\.]/)
    ? fileName
        .split(".")
        ?.pop()
        ?.match(/[\w\d]+/)
        ?.pop()
    : undefined;
}

export function extractEditorFileExtensionFromUrl(supportedFileExtensions: string[]): string | undefined {
  const typeFromUrl = window.location.href
    .split("?")[0]
    .split("#")
    ?.pop()
    ?.split("/")
    ?.pop();

  return supportedFileExtensions.indexOf(typeFromUrl!) !== -1 ? typeFromUrl : undefined;
}

export function getFileUrl(): string {
  return window.location.search.split("?file=")[1];
}

export function removeFileExtension(fileName: string) {
  const fileExtension = extractFileExtension(fileName);

  if (!fileExtension) {
    return fileName;
  }

  return fileName.substr(0, fileName.length - fileExtension.length - 1);
}

export function removeDirectories(filePath: string) {
  return filePath.split("/").pop();
}

// FIXME: remove duplications
export enum OperatingSystem {
  MACOS = "MACOS",
  WINDOWS = "WINDOWS",
  LINUX = "LINUX"
}

export function getOperatingSystem() {
  if (navigator.appVersion.indexOf("Win") !== -1) {
    return OperatingSystem.WINDOWS;
  }

  if (navigator.appVersion.indexOf("Mac") !== -1) {
    return OperatingSystem.MACOS;
  }

  if (navigator.appVersion.indexOf("X11") !== -1) {
    return OperatingSystem.LINUX;
  }

  if (navigator.appVersion.indexOf("Linux") !== -1) {
    return OperatingSystem.LINUX;
  }

  return undefined;
}

export function getCookie(name: string) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");

  if (parts.length === 2) {
    return parts
      .pop()!
      .split(";")
      .shift();
  }
}

export function setCookie(name: string, value: string) {
  const date = new Date();

  date.setTime(date.getTime() + 10 * 365 * 24 * 60 * 60); // expires in 10 years

  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
}

const SOURCE = "https://paulovmr.github.io/kogito-online/bpmn/index.js";
type EmbeddableClass = "BpmnEditor" | "DmnEditor";

export function getEmbeddableEditorFromGist(editor: EmbeddableClass, readOnly: boolean, gistId: string) {
  return `
    <script type="module">
      import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
      const octokit = new Octokit()
      octokit.gists.get({ gist_id: "${gistId}" })
        .then(response => response.data.files[Object.keys(response.data.files)[0]].raw_url)
        .then(url => fetch(url))
        .then(response => response.text())
        .then(content => ${editor}.open({container: document.body, initialContent: content, readOnly: ${readOnly}, origin: "*" }))
    </script>`;
}

export function getEmbeddableEditorFromContent(editor: EmbeddableClass, readOnly: boolean, content: string) {
  return `
    <script>
      ${editor}.open({container: document.body, initialContent: '${content}', readOnly: ${readOnly}, origin: "*" })
    </script>`;
}

export function getEmbeddableEditorTemplate(script: string) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <script src="${SOURCE}"></script>
      <title></title>
      <style>
        html,
        body,
        iframe {
          margin: 0;
          border: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
      </style>
    </head>
    <body>
      ${script}
    </body>
    </html>`;
}
