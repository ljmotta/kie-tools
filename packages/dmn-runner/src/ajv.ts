/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
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

import Ajv from "ajv";
import {
  DAYS_AND_TIME_DURATION_FORMAT,
  DAYS_AND_TIME_DURATION_REGEXP,
  X_DMN_ALLOWED_VALUES,
  X_DMN_DESCRIPTIONS,
  X_DMN_TYPE,
  YEARS_AND_MONTHS_DURATION_FORMAT,
  YEARS_AND_MONTHS_DURATION_REGEXP,
} from "./constants";

export class DmnRunnerAjv {
  private ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, useDefaults: true, strictTypes: true });
    this.ajv.addKeyword({
      keyword: X_DMN_TYPE,
    });
    this.ajv.addKeyword({
      keyword: X_DMN_ALLOWED_VALUES,
    });
    this.ajv.addKeyword({
      keyword: X_DMN_DESCRIPTIONS,
    });
    this.ajv.addFormat(DAYS_AND_TIME_DURATION_FORMAT, {
      type: "string",
      validate: (data: string) => !!data.match(DAYS_AND_TIME_DURATION_REGEXP),
    });

    this.ajv.addFormat(YEARS_AND_MONTHS_DURATION_FORMAT, {
      type: "string",
      validate: (data: string) => !!data.match(YEARS_AND_MONTHS_DURATION_REGEXP),
    });
  }

  public getAjv() {
    return this.ajv;
  }
}