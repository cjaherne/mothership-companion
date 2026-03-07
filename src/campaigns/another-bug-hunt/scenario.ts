/**
 * Another Bug Hunt - Scenario definitions (1-4)
 */

import type { Scenario } from "../types";
import { distressSignalsScenario } from "./scenarios/1-distress-signals/scenario";
import { scenario2 } from "./scenarios/2-scenario/scenario";
import { scenario3 } from "./scenarios/3-scenario/scenario";
import { scenario4 } from "./scenarios/4-scenario/scenario";

export const scenarios: Scenario[] = [
  distressSignalsScenario,
  scenario2,
  scenario3,
  scenario4,
];
