/**
 * Another Bug Hunt - Mission definitions
 *
 * Developer: fill in briefing and objectives for each scenario.
 */

import type { Mission } from "../types";

/** Scenario 1: Distress Signals */
export const distressSignalsMission: Mission = {
  id: "distress-signals",
  name: "Distress Signals",
  objectives: [
    "Rendezvous with the station's marine commander",
    "Re-establish power to the main computer",
    "Retrieve biological samples from the medical laboratory",
  ],
  briefing: `The Company has lost contact with Greta Base on Samsa VI six months ago. You are being sent to investigate. A raging tropical storm will make radio communication nearly impossible. Your objectives: rendezvous with the station's marine commander, re-establish power to the main computer, and retrieve any biological samples from the medical laboratory. Expect the unexpected.`,
  briefingPages: [
    {
      title: "Timeline",
      content: `TIMELINE — What the Company Knows

• T-0 (Colony Founding)
  Greta Base established on Samsa VI. Terraforming and research operations begin under The Company's oversight.

• T+3 years
  Heron Station commissioned as secondary research outpost. Both facilities operational and reporting regularly.

• T+4 years, 8 months
  Last routine transmission from Greta Base. All systems nominal.

• T+4 years, 9 months → T+5 years, 2 months
  Gradual degradation of communications. Missed check-ins. Patchy data. Then: complete radio silence for six months.

• Present
  You are being sent to investigate. No survivors have made contact. The tropical storm system blocks reliable comms.`,
    },
    {
      title: "Overview",
      content: `SAMSA VI — Mission Briefing

Samsa VI is a jungle planet in The Company's portfolio: a terraforming colony and research station that has gone dark. What little intelligence suggests the facility was abandoned in haste—or worse.

Known locations:
• Landing Zone — Where your shuttle will touch down. A short muddy walk to Greta Base.
• Greta Base — The primary facility. Six months of silence. Power likely offline.
• Heron Station — Secondary outpost. Currently inaccessible due to the tropical storm.

Your objectives: rendezvous with the station's marine commander, re-establish power to the main computer, and retrieve biological samples from the medical laboratory. A raging tropical storm will make radio communication nearly impossible.

Expect the unexpected.`,
    },
    {
      title: "Prologue",
      content: `PROLOGUE — The Metamorphosis

The transition from cryosleep is never gentle. One moment: the familiar hum of suspension, the slow bleed of dreams. The next: cold air in your lungs, lights strobing through your eyelids, the hiss of equalizing pressure.

You are aboard The Metamorphosis, a J2C-I Executive Transport—The Company's preferred vessel for long-haul corporate operations. The viewport shows Samsa VI below: a swath of greens and grays, storm systems churning across the terminator. You have arrived in orbit.

A figure waits by the briefing console. Maas—your corporate liaison, nominally in charge of the entire mission. Sharp suit, sharper smile, the kind of person who uses "expediency" and "cost-effective" in the same sentence. They've been awake for hours, reviewing the same files you're about to hear.`,
    },
    {
      title: "Arrival",
      content: `ARRIVAL — The Dropship to Samsa VI

You board the dropship and strap in. The craft shudders as it breaks atmosphere—Samsa VI's storm systems claw at the hull. Inside, the air is thick: human sweat, recycled oxygen, the sour tang of fear. The ship creaks and shakes. Loud alarms blare from the cockpit.

Up front, Pilot Anders—stocky, experienced—and Copilot Renfield—chatty, chewing gum—fight the controls. The tropical storm is worse than expected. [Fear Save]

---

When the Fear Saves are settled, the dropship touches down at the Greta Base Landing Zone. The ramp drops. Lush jungle presses in on all sides. Torrential rain hammers the muddy clearing. Thick mud makes every step treacherous. Visibility is poor—the storm obscures everything beyond a few metres.

What do you want to do?`,
    },
  ],
};

/** Scenario 2 - Shell (developer fills in) */
export const scenario2Mission: Mission = {
  id: "scenario-2",
  name: "Scenario 2",
  objectives: [],
  briefing: "",
};

/** Scenario 3 - Shell (developer fills in) */
export const scenario3Mission: Mission = {
  id: "scenario-3",
  name: "Scenario 3",
  objectives: [],
  briefing: "",
};

/** Scenario 4 - Shell (developer fills in) */
export const scenario4Mission: Mission = {
  id: "scenario-4",
  name: "Scenario 4",
  objectives: [],
  briefing: "",
};

export const missions: Mission[] = [
  distressSignalsMission,
  scenario2Mission,
  scenario3Mission,
  scenario4Mission,
];
