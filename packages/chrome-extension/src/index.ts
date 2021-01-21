/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GitHubPageType } from "./app/github/GitHubPageType";
import { renderSingleEditorApp } from "./app/components/single/singleEditorEdit";
import { renderSingleEditorReadonlyApp } from "./app/components/single/singleEditorView";
import { renderPrEditorsApp } from "./app/components/pr/prEditors";
import { mainContainer, runAfterUriChange } from "./app/utils";
import { Dependencies } from "./app/Dependencies";
import * as ReactDOM from "react-dom";
import { EditorEnvelopeLocator } from "@kogito-tooling/editor/dist/api";
import "../resources/style.css";
import { Logger } from "./Logger";
import { Globals } from "./app/components/common/Main";
import { ExternalEditorManager } from "./ExternalEditorManager";
import { ResourceContentServiceFactory } from "./app/components/common/ChromeResourceContentService";
import { addExternalEditorLinks } from "./app/components/tree/externalEditorLinkManager";
import { renderBitbucket } from "./app/bitbucket/EditorView";
import { renderBitbucketPr } from "./app/bitbucket/PrEditorView";
import { renderGitlab } from "./app/gitlab/EditorView";
import { renderGitlabPr } from "./app/gitlab/PrEditorView";
import { renderBitbucketEdit } from "./app/bitbucket/EditorViewEdit";
import { renderGitlabEdit } from "./app/gitlab/EditorViewEdit";

enum GitManager {
  GITHUB,
  BITBUCKET,
  GITLAB,
  ANY
}

/**
 * Starts a Kogito extension.
 *
 *  @param args.name The extension name. Used to differentiate logs from other extensions.
 *  @param args.extensionIconUrl The relative path to search for an image that will be the icon used for your extension.
 *  @param args.githubAuthTokenCookieName The name of the cookie that will hold a GitHub PAT for your extension.
 *  @param args.editorEnvelopeLocator The file extension mapping to the provided Editors.
 *  @param args.externalEditorManager The implementation of ExternalEditorManager for your extension.
 */
export function startExtension(args: {
  name: string;
  extensionIconUrl: string;
  githubAuthTokenCookieName: string;
  editorEnvelopeLocator: EditorEnvelopeLocator;
  externalEditorManager?: ExternalEditorManager;
}) {
  const logger = new Logger(args.name);
  const resourceContentServiceFactory = new ResourceContentServiceFactory();
  const dependencies = new Dependencies();
  const gitManager = discoverCurrentGitManager();

  if (gitManager === GitManager.BITBUCKET) {
    const runBitBucket = () =>
      initBitBucket({
        id: chrome.runtime.id,
        logger: logger,
        dependencies: dependencies,
        githubAuthTokenCookieName: args.githubAuthTokenCookieName,
        extensionIconUrl: args.extensionIconUrl,
        editorEnvelopeLocator: args.editorEnvelopeLocator,
        resourceContentServiceFactory: resourceContentServiceFactory,
        externalEditorManager: args.externalEditorManager
      });
    args.externalEditorManager!.listenToUrlUpdate(() => setTimeout(runBitBucket, 0));
    setTimeout(runBitBucket, 0);
  }
  if (gitManager === GitManager.GITHUB) {
    const runGithub = () =>
      initGithub({
        id: chrome.runtime.id,
        logger: logger,
        dependencies: dependencies,
        githubAuthTokenCookieName: args.githubAuthTokenCookieName,
        extensionIconUrl: args.extensionIconUrl,
        editorEnvelopeLocator: args.editorEnvelopeLocator,
        resourceContentServiceFactory: resourceContentServiceFactory,
        externalEditorManager: args.externalEditorManager
      });
    runAfterUriChange(logger, () => setTimeout(runGithub, 0));
    setTimeout(runGithub, 0);
  }

  if (gitManager === GitManager.GITLAB) {
    const runGitlab = () =>
      initGitlab({
        id: chrome.runtime.id,
        logger: logger,
        dependencies: dependencies,
        githubAuthTokenCookieName: args.githubAuthTokenCookieName,
        extensionIconUrl: args.extensionIconUrl,
        editorEnvelopeLocator: args.editorEnvelopeLocator,
        resourceContentServiceFactory: resourceContentServiceFactory,
        externalEditorManager: args.externalEditorManager
      });
    args.externalEditorManager!.listenToUrlUpdate(() => setTimeout(runGitlab, 0));
    setTimeout(runGitlab, 0);
  }
}

interface BitBucketFileInfo {
  user: string;
  repo: string;
  branch: string;
  path: string;
}

export interface GitLabFileInfo {
  user: string;
  repo: string;
  branch: string;
  path: string;
}

function initGithub(args: Globals) {
  args.logger.log(`---`);
  args.logger.log(`Starting GitHub extension.`);
  unmountPreviouslyRenderedFeatures(args.id, args.logger, args.dependencies);

  const fileInfo = extractFileInfoFromUrl();
  const pageType = discoverCurrentGitHubPageType();

  if (pageType === GitHubPageType.ANY) {
    args.logger.log(`This GitHub page is not supported.`);
    return;
  }

  if (pageType === GitHubPageType.EDIT) {
    renderSingleEditorApp({
      id: args.id,
      logger: args.logger,
      dependencies: args.dependencies,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      resourceContentServiceFactory: args.resourceContentServiceFactory,
      fileInfo: fileInfo
    });
  } else if (pageType === GitHubPageType.VIEW) {
    renderSingleEditorReadonlyApp({
      id: args.id,
      logger: args.logger,
      dependencies: args.dependencies,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      extensionIconUrl: args.extensionIconUrl,
      fileInfo: fileInfo,
      resourceContentServiceFactory: args.resourceContentServiceFactory,
      externalEditorManager: args.externalEditorManager
    });
  } else if (pageType === GitHubPageType.PR) {
    renderPrEditorsApp({
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      id: args.id,
      logger: args.logger,
      dependencies: args.dependencies,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      extensionIconUrl: args.extensionIconUrl,
      resourceContentServiceFactory: args.resourceContentServiceFactory,
      externalEditorManager: args.externalEditorManager,
      contentPath: fileInfo.path
    });
  } else if (pageType === GitHubPageType.TREE) {
    addExternalEditorLinks({
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      extensionIconUrl: args.extensionIconUrl,
      resourceContentServiceFactory: args.resourceContentServiceFactory,
      externalEditorManager: args.externalEditorManager,
      dependencies: args.dependencies
    });
    return;
  } else {
    throw new Error(`Unknown GitHubPageType ${pageType}`);
  }
}

function initBitBucket(args: Globals) {
  args.logger.log(`---`);
  args.logger.log(`Starting GitHub extension.`);

  const split = window.location.pathname.split("/");
  const fileInfo = {
    user: split[1],
    repo: split[2],
    branch: split[4],
    path: split.slice(5).join("/")
  };
  const pageType = discoverCurrentBitbucketPageType(fileInfo);

  if (pageType === BitBucketPageType.ANY) {
    args.logger.log(`This Bitbucket page is not supported.`);
    return;
  }

  if (pageType === BitBucketPageType.PR) {
    renderBitbucketPr({
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      contentPath: fileInfo.path
    });
  }

  if (pageType === BitBucketPageType.SINGLE) {
    renderBitbucket({
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      fileInfo: fileInfo
    });
  }

  if (pageType === BitBucketPageType.EDIT) {
    renderBitbucketEdit({
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      fileInfo: fileInfo
    });
  }
}

function initGitlab(args: Globals) {
  args.logger.log(`---`);
  args.logger.log(`Starting GitLab extension.`);

  const split = window.location.pathname.split("/");
  const fileInfo = {
    user: split[1],
    repo: split[2],
    branch: split[5],
    path: split.slice(6).join("/")
  };
  const pageType = discoverCurrentGitlabPageType(fileInfo);
  if (pageType === GitLabPageType.ANY) {
    args.logger.log(`This Gitlab page is not supported.`);
    return;
  }

  if (pageType === GitLabPageType.PR) {
    renderGitlabPr({
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      contentPath: fileInfo.path
    });
  }

  if (pageType === GitLabPageType.SINGLE) {
    renderGitlab({
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      fileInfo: fileInfo
    });
  }

  if (pageType === GitLabPageType.EDIT) {
    renderGitlabEdit({
      id: args.id,
      logger: args.logger,
      editorEnvelopeLocator: args.editorEnvelopeLocator,
      githubAuthTokenCookieName: args.githubAuthTokenCookieName,
      extensionIconUrl: args.extensionIconUrl,
      externalEditorManager: args.externalEditorManager,
      fileInfo: fileInfo
    });
  }
}

export function extractFileInfoFromUrl() {
  const split = window.location.pathname.split("/");
  return {
    gitRef: split[4],
    repo: split[2],
    org: split[1],
    path: split.slice(5).join("/")
  };
}

function unmountPreviouslyRenderedFeatures(id: string, logger: Logger, dependencies: Dependencies) {
  try {
    if (mainContainer(id, dependencies.all.body())) {
      ReactDOM.unmountComponentAtNode(mainContainer(id, dependencies.all.body())!);
      logger.log("Unmounted previous features.");
    }
  } catch (e) {
    logger.log("Ignoring exception while unmounting features.");
  }
}

function uriMatches(regex: string) {
  return !!window.location.pathname.match(new RegExp(regex));
}

export function discoverCurrentGitManager() {
  if (window.location.hostname.match(`github.com`)) {
    return GitManager.GITHUB;
  }
  if (window.location.hostname.match(`bitbucket.org`)) {
    return GitManager.BITBUCKET;
  }
  if (window.location.hostname.match(`gitlab.com`)) {
    return GitManager.GITLAB;
  }
  return GitManager.ANY;
}

enum BitBucketPageType {
  SINGLE,
  EDIT,
  PR,
  ANY
}

enum GitLabPageType {
  SINGLE,
  EDIT,
  PR,
  ANY
}

function getSearchParams() {
  return window.location.search
    .substring(1)
    .split("&")
    .map(e => {
      const a = e.split("=");
      return { [a[0]]: a[1] };
    })
    .reduce((a, e) => ({ ...a, ...e }), {});
}

function extractFileExtension(fileName: string) {
  return fileName.match(/[\.]/)
    ? fileName
        .split(".")
        ?.pop()
        ?.match(/[\w\d]+/)
        ?.pop()
    : undefined;
}

function discoverCurrentGitlabPageType(fileInfo: GitLabFileInfo) {
  const fileExtension = extractFileExtension(fileInfo.path);
  if (
    (fileExtension === "dmn" || fileExtension === "bpmn" || fileExtension === "bpmn2") &&
    uriMatches(`.*/.*/blob/.*`)
  ) {
    return GitLabPageType.SINGLE;
  }
  if (
    (fileExtension === "dmn" || fileExtension === "bpmn" || fileExtension === "bpmn2") &&
    uriMatches(`.*/.*/edit/.*`)
  ) {
    return GitLabPageType.EDIT;
  }
  if (uriMatches(`.*/.*/-/merge_requests/.*/diffs`)) {
    return GitLabPageType.PR;
  }

  return GitLabPageType.ANY;
}

function discoverCurrentBitbucketPageType(fileInfo: BitBucketFileInfo) {
  const fileExtension = extractFileExtension(fileInfo.path);
  const searchParams = getSearchParams();

  if (searchParams && Object.hasOwnProperty.call(searchParams, "mode") && searchParams.mode === "edit") {
    return BitBucketPageType.EDIT;
  }

  if (
    (fileExtension === "dmn" || fileExtension === "bpmn" || fileExtension === "bpmn2") &&
    uriMatches(`.*/.*/src/.*`)
  ) {
    return BitBucketPageType.SINGLE;
  }
  if (uriMatches(`.*/.*/pull-requests/.+`)) {
    return BitBucketPageType.PR;
  }

  return BitBucketPageType.ANY;
}

export function discoverCurrentGitHubPageType() {
  if (uriMatches(`.*/.*/edit/.*`)) {
    return GitHubPageType.EDIT;
  }

  if (uriMatches(`.*/.*/blob/.*`)) {
    return GitHubPageType.VIEW;
  }

  if (uriMatches(`.*/.*/pull/[0-9]+/files.*`)) {
    return GitHubPageType.PR;
  }

  if (uriMatches(`.*/.*/pull/[0-9]+/commits.*`)) {
    return GitHubPageType.PR;
  }

  if (uriMatches(`.*/.*/tree/.*`) || uriMatches(`/.*/.*/?$`)) {
    return GitHubPageType.TREE;
  }

  return GitHubPageType.ANY;
}

export * from "./ExternalEditorManager";
