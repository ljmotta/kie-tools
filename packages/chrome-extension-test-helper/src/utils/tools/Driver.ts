/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Browser, Builder, Capabilities, WebDriver } from "selenium-webdriver";
import { Options, ServiceBuilder } from "selenium-webdriver/chrome";
import { existsSync, mkdirSync } from "fs";
import ErrorProcessor from "./ErrorProcessor";
import { resolve } from "path";

export default class Driver {
  public static async init(): Promise<WebDriver> {
    // get path to unzipped extension or set to default 'dist' directory
    const chromeExtensionPath: string = process.env.UNZIPPED_CHROME_EXTENSION_PATH
      ? resolve(process.env.UNZIPPED_CHROME_EXTENSION_PATH)
      : resolve("dist");

    // check the path exists
    if (!existsSync(chromeExtensionPath)) {
      throw new Error(
        "Please set UNZIPPED_CHROME_EXTENSION_PATH variable to unzipped Chrome extension directory. " +
          "For example: export UNZIPPED_CHROME_EXTENSION_PATH=/path/to/dist. " +
          "Directory " +
          chromeExtensionPath +
          " does not exist."
      );
    }

    // create directory for chrome browser data
    const CHROME_DIR: string = resolve("dist-tests-e2e", "chrome_data");
    if (!existsSync(CHROME_DIR)) {
      mkdirSync(CHROME_DIR, { recursive: true });
    }

    // init chrome options
    const chromeOptions: Options = new Options();
    chromeOptions.addArguments(
      "--user-data-dir=" + CHROME_DIR,
      "--load-extension=" + chromeExtensionPath,
      // This flag enables --load-extension, required for testing Chrome extensions
      "--disable-features=DisableLoadExtensionCommandLineSwitch",
      "--enable-features=UnexpireFlagsM118",
      "--allow-insecure-localhost",
      "--disable-web-security",
      "--remote-allow-origins=*",
      "--disable-gpu"
    );

    // init chrome driver log
    const LOGS_DIR: string = resolve("dist-tests-e2e", "logs");
    if (!existsSync(LOGS_DIR)) {
      mkdirSync(LOGS_DIR, { recursive: true });
    }
    const chromeServiceBuilder: ServiceBuilder = new ServiceBuilder();
    chromeServiceBuilder.loggingTo(LOGS_DIR + "/chromedriver.log").enableVerboseLogging();

    // init chrome driver
    const driver: WebDriver = await new Builder()
      .withCapabilities(Capabilities.chrome())
      .setChromeService(chromeServiceBuilder)
      .forBrowser(Browser.CHROME)
      .setChromeOptions(chromeOptions)
      .build();

    // maximize chrome browser window
    await ErrorProcessor.run(
      async () => await driver.manage().window().maximize(),
      "Error while maximizing browser window."
    );

    return driver;
  }

  public static async openUrl(driver: WebDriver, url: string): Promise<void> {
    return await ErrorProcessor.run(async () => await driver.get(url), "Error while opening url: " + url);
  }

  public static async quit(driver: WebDriver): Promise<void> {
    return await ErrorProcessor.run(async () => await driver.quit(), "Error while quiting driver.");
  }
}
