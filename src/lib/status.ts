/**
 * Labels for every status shown on the public site and in the CMS.
 *
 * ABC is at the proposal stage, so being exact about what is proposed,
 * planned, under way and finished matters. Each status has one label and one
 * plain-language meaning, used everywhere.
 */
import type { LabStatus, MilestoneStatus, ProjectStatus, StatisticStatus } from "./types.ts";

export type Tone = "outline" | "progress" | "solid";

export const STATISTIC_STATUS: Record<StatisticStatus, { label: string; meaning: string; tone: Tone }> = {
  target: { label: "Proposed target", meaning: "A goal that ABC has set. Nothing has been achieved against it yet.", tone: "outline" },
  ongoing: { label: "Ongoing", meaning: "Work is under way. The figure shows progress so far and may change.", tone: "progress" },
  achieved: { label: "Achieved", meaning: "A result ABC has recorded for completed work.", tone: "solid" },
  verified: { label: "Verified", meaning: "An achieved result that has been checked against records or by a third party.", tone: "solid" },
};

export const PROJECT_STATUS: Record<ProjectStatus, { label: string; tone: Tone }> = {
  proposed: { label: "Proposed", tone: "outline" },
  planned: { label: "Planned", tone: "outline" },
  active: { label: "Under way", tone: "progress" },
  completed: { label: "Completed", tone: "solid" },
};

export const LAB_STATUS: Record<LabStatus, { label: string; tone: Tone }> = {
  proposed: { label: "Proposed", tone: "outline" },
  establishing: { label: "Being established", tone: "progress" },
  active: { label: "Active", tone: "solid" },
  paused: { label: "Paused", tone: "outline" },
};

export const MILESTONE_STATUS: Record<MilestoneStatus, { label: string; tone: Tone }> = {
  planned: { label: "Planned", tone: "outline" },
  in_progress: { label: "In progress", tone: "progress" },
  done: { label: "Done", tone: "solid" },
};

/** IUCN Red List categories. */
export const IUCN_STATUS: Record<string, { label: string; color: string }> = {
  LC: { label: "Least Concern", color: "#4f8a5b" },
  NT: { label: "Near Threatened", color: "#8a9a3c" },
  VU: { label: "Vulnerable", color: "#c79a2b" },
  EN: { label: "Endangered", color: "#c9702c" },
  CR: { label: "Critically Endangered", color: "#b8402f" },
  EW: { label: "Extinct in the Wild", color: "#5c4a5e" },
  EX: { label: "Extinct", color: "#2b2b2b" },
  DD: { label: "Data Deficient", color: "#7b8480" },
  NE: { label: "Not Evaluated", color: "#9aa39d" },
};

export const IUCN_OPTIONS = [
  { value: "", label: "Not stated" },
  ...Object.entries(IUCN_STATUS).map(([value, v]) => ({ value, label: `${value}: ${v.label}` })),
];

export const OBSERVATION_CATEGORIES = [
  { value: "bird", label: "Bird" },
  { value: "plant", label: "Plant" },
  { value: "insect", label: "Insect" },
  { value: "mammal", label: "Mammal" },
  { value: "amphibian_reptile", label: "Amphibian or reptile" },
  { value: "fungus", label: "Fungus" },
  { value: "habitat", label: "Habitat or landscape" },
  { value: "other", label: "Something else" },
] as const;

export const observationCategoryLabel = (value: string) => OBSERVATION_CATEGORIES.find((c) => c.value === value)?.label ?? value;
