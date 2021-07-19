import { Grid } from "../core/Grid";
import { DmnValidator } from "./DmnValidator";

export class DmnGrid extends Grid {
  constructor(private readonly validator = new DmnValidator(), private readonly schema = {}) {
    super(validator.getBridge(schema));
  }
}
