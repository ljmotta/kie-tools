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

const { chromium, webkit } = require("@playwright/test");

(async () => {
  const chromiumWs = await chromium.launchServer({ headless: true, port: 10001, wsPath: "chromium" });
  console.log(chromiumWs.wsEndpoint());

  const chromeWs = await chromium.launchServer({ headless: true, port: 10010, wsPath: "chrome", channel: "chrome" });
  console.log(chromeWs.wsEndpoint());

  const webkitWs = await webkit.launchServer({ headless: true, port: 10100, wsPath: "webkit" });
  console.log(webkitWs.wsEndpoint());
})();
