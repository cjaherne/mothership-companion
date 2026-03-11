/**
 * Mothership RPG - Skills and prerequisite graph
 * Player's Survival Guide v1.2, page 5. Prerequisite arrows from skill tree image.
 */

export type SkillTier = "trained" | "expert" | "master";

export interface Skill {
  id: string;
  name: string;
  tier: SkillTier;
  bonus: number;
  /** Skill IDs that must have at least one taken first (OR logic) */
  prerequisites: string[];
}

/** Trained skills (+10). No prerequisites. */
const TRAINED_SKILLS: Omit<Skill, "prerequisites">[] = [
  { id: "linguistics", name: "Linguistics", tier: "trained", bonus: 10 },
  { id: "zoology", name: "Zoology", tier: "trained", bonus: 10 },
  { id: "botany", name: "Botany", tier: "trained", bonus: 10 },
  { id: "geology", name: "Geology", tier: "trained", bonus: 10 },
  { id: "industrial-equipment", name: "Industrial Equipment", tier: "trained", bonus: 10 },
  { id: "jury-rigging", name: "Jury-Rigging", tier: "trained", bonus: 10 },
  { id: "chemistry", name: "Chemistry", tier: "trained", bonus: 10 },
  { id: "computers", name: "Computers", tier: "trained", bonus: 10 },
  { id: "zero-g", name: "Zero-G", tier: "trained", bonus: 10 },
  { id: "mathematics", name: "Mathematics", tier: "trained", bonus: 10 },
  { id: "art", name: "Art", tier: "trained", bonus: 10 },
  { id: "archaeology", name: "Archaeology", tier: "trained", bonus: 10 },
  { id: "theology", name: "Theology", tier: "trained", bonus: 10 },
  { id: "military-training", name: "Military Training", tier: "trained", bonus: 10 },
  { id: "rimwise", name: "Rimwise", tier: "trained", bonus: 10 },
  { id: "athletics", name: "Athletics", tier: "trained", bonus: 10 },
];

/** Expert skills (+15) with prerequisites. At least one prerequisite required. */
const EXPERT_SKILLS: Skill[] = [
  { id: "psychology", name: "Psychology", tier: "expert", bonus: 15, prerequisites: ["linguistics"] },
  { id: "pathology", name: "Pathology", tier: "expert", bonus: 15, prerequisites: ["zoology"] },
  { id: "field-medicine", name: "Field Medicine", tier: "expert", bonus: 15, prerequisites: ["zoology", "botany"] },
  { id: "ecology", name: "Ecology", tier: "expert", bonus: 15, prerequisites: ["botany"] },
  { id: "asteroid-mining", name: "Asteroid Mining", tier: "expert", bonus: 15, prerequisites: ["geology"] },
  { id: "mechanical-repair", name: "Mechanical Repair", tier: "expert", bonus: 15, prerequisites: ["industrial-equipment"] },
  { id: "explosives", name: "Explosives", tier: "expert", bonus: 15, prerequisites: ["jury-rigging"] },
  { id: "pharmacology", name: "Pharmacology", tier: "expert", bonus: 15, prerequisites: ["chemistry"] },
  { id: "hacking", name: "Hacking", tier: "expert", bonus: 15, prerequisites: ["computers"] },
  { id: "piloting", name: "Piloting", tier: "expert", bonus: 15, prerequisites: ["zero-g"] },
  { id: "physics", name: "Physics", tier: "expert", bonus: 15, prerequisites: ["mathematics"] },
  { id: "mysticism", name: "Mysticism", tier: "expert", bonus: 15, prerequisites: ["art", "archaeology"] },
  { id: "wilderness-survival", name: "Wilderness Survival", tier: "expert", bonus: 15, prerequisites: ["theology"] },
  { id: "firearms", name: "Firearms", tier: "expert", bonus: 15, prerequisites: ["military-training"] },
  { id: "hand-to-hand-combat", name: "Hand-to-Hand Combat", tier: "expert", bonus: 15, prerequisites: ["rimwise", "athletics"] },
];

/** Master skills (+20) with prerequisites. */
const MASTER_SKILLS: Skill[] = [
  { id: "sophontology", name: "Sophontology", tier: "master", bonus: 20, prerequisites: ["psychology"] },
  { id: "exobiology", name: "Exobiology", tier: "master", bonus: 20, prerequisites: ["pathology"] },
  { id: "surgery", name: "Surgery", tier: "master", bonus: 20, prerequisites: ["field-medicine"] },
  { id: "planetology", name: "Planetology", tier: "master", bonus: 20, prerequisites: ["ecology"] },
  { id: "robotics", name: "Robotics", tier: "master", bonus: 20, prerequisites: ["asteroid-mining"] },
  { id: "engineering", name: "Engineering", tier: "master", bonus: 20, prerequisites: ["mechanical-repair", "jury-rigging"] },
  { id: "cybernetics", name: "Cybernetics", tier: "master", bonus: 20, prerequisites: ["explosives", "computers"] },
  { id: "artificial-intelligence", name: "Artificial Intelligence", tier: "master", bonus: 20, prerequisites: ["hacking"] },
  { id: "hyperspace", name: "Hyperspace", tier: "master", bonus: 20, prerequisites: ["piloting", "mathematics"] },
  { id: "xenoesotericism", name: "Xenoesotericism", tier: "master", bonus: 20, prerequisites: ["mysticism"] },
  { id: "command", name: "Command", tier: "master", bonus: 20, prerequisites: ["wilderness-survival", "firearms", "military-training"] },
];

const TRAINED_WITH_PREREQS: Skill[] = TRAINED_SKILLS.map((s) => ({ ...s, prerequisites: [] }));

export const ALL_SKILLS: Skill[] = [...TRAINED_WITH_PREREQS, ...EXPERT_SKILLS, ...MASTER_SKILLS];

const SKILL_MAP = new Map(ALL_SKILLS.map((s) => [s.id, s]));

/** Prerequisite graph: skill id -> prerequisite skill ids (need at least one) */
export const SKILL_PREREQUISITES: Record<string, string[]> = Object.fromEntries(
  ALL_SKILLS.filter((s) => s.prerequisites.length > 0).map((s) => [s.id, s.prerequisites])
);

/** Skill descriptions for UI display */
export const SKILL_DESCRIPTIONS: Record<string, string> = {
  linguistics: "Knowledge of languages, translation, and communication across species.",
  zoology: "Study of animal life and alien fauna; identification and basic biology.",
  botany: "Study of plant life and alien flora; identification and cultivation.",
  geology: "Knowledge of rocks, minerals, and planetary formation.",
  "industrial-equipment": "Operation and maintenance of heavy machinery, loaders, and industrial systems.",
  "jury-rigging": "Quick fixes and improvised repairs when proper tools are unavailable.",
  chemistry: "Understanding of compounds, reactions, and chemical hazards.",
  computers: "Use of computer systems, programming, and basic diagnostics.",
  "zero-g": "Movement, orientation, and operation in microgravity environments.",
  mathematics: "Mathematical analysis, calculations, and problem-solving.",
  art: "Creative expression, forgery, and aesthetic appreciation.",
  archaeology: "Study of ruins, artifacts, and ancient or alien civilizations.",
  theology: "Religious doctrine, cult behavior, and esoteric belief systems.",
  "military-training": "Combat doctrine, tactics, and military protocols.",
  rimwise: "Street smarts and survival on the frontier; reading people and situations.",
  athletics: "Physical prowess: running, climbing, swimming, and endurance.",
  psychology: "Understanding of minds, behavior patterns, and mental states.",
  pathology: "Study of disease, causes of death, and biological malfunction.",
  "field-medicine": "Emergency treatment, triage, and stabilisation in the field.",
  ecology: "Understanding of ecosystems and how organisms interact with environments.",
  "asteroid-mining": "Prospecting, extraction, and safety in space mining operations.",
  "mechanical-repair": "Diagnosis and repair of engines, hulls, and mechanical systems.",
  explosives: "Handling, placement, and disposal of explosive ordnance.",
  pharmacology: "Drugs, dosages, and pharmaceutical effects.",
  hacking: "Bypassing security, accessing systems, and digital infiltration.",
  piloting: "Operating spacecraft, shuttles, and vehicles.",
  physics: "Principles of matter, energy, and applied scientific theory.",
  mysticism: "Paranormal phenomena and forces beyond conventional understanding.",
  "wilderness-survival": "Surviving in hostile environments; foraging and shelter.",
  firearms: "Weapon handling, accuracy, and maintenance of ranged weapons.",
  "hand-to-hand-combat": "Unarmed fighting, grappling, and close-quarters combat.",
  sophontology: "Study of non-human intelligence and alien minds.",
  exobiology: "Comprehensive study of alien life and xenobiology.",
  surgery: "Invasive medical procedures and critical care.",
  planetology: "Study of planetary systems, atmospheres, and habitability.",
  robotics: "Design, construction, and repair of robotic systems.",
  engineering: "Complex systems design and large-scale technical projects.",
  cybernetics: "Integration of biological and mechanical systems.",
  "artificial-intelligence": "Design and understanding of AI systems.",
  hyperspace: "Navigation through hyperspace and jump calculations.",
  xenoesotericism: "Esoteric knowledge of alien beliefs and cosmic phenomena.",
  command: "Leadership, coordination, and tactical oversight of a team.",
};

export function getSkill(id: string): Skill | undefined {
  return SKILL_MAP.get(id);
}

export function getSkillDescription(skillId: string): string {
  return SKILL_DESCRIPTIONS[skillId] ?? "";
}

export function getPrerequisites(skillId: string): string[] {
  return SKILL_PREREQUISITES[skillId] ?? [];
}

/** True if the skill can be taken given the set of already-taken skill IDs */
export function canTakeSkill(skillId: string, takenSkillIds: string[]): boolean {
  const prereqs = getPrerequisites(skillId);
  if (prereqs.length === 0) return true;
  return prereqs.some((p) => takenSkillIds.includes(p));
}

/** Get all skills in a tier */
export function getSkillsByTier(tier: SkillTier): Skill[] {
  return ALL_SKILLS.filter((s) => s.tier === tier);
}

/** Get the full prerequisite chain for a Master skill (transitive: Master -> Expert -> Trained) */
export function getMasterSkillChain(masterSkillId: string): string[] {
  const seen = new Set<string>();

  function collect(id: string) {
    if (seen.has(id)) return;
    seen.add(id);
    const skill = getSkill(id);
    if (!skill) return;
    for (const pId of skill.prerequisites) collect(pId);
  }

  collect(masterSkillId);
  return Array.from(seen);
}
