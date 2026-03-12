import { Goal } from "../types";

export type ResearchStackParams = {
  ResearchHub: undefined;
  PeptideDetail: { peptideId: string };
};

export type CycleStackParams = {
  CycleTracker: undefined;
  NewCycle: { templateId?: string };
  LogDose: { cycleId: string; peptideId: string };
};

export type JournalStackParams = {
  Journal: undefined;
  NewEntry: { entryId?: string };
};

export type ProtocolStackParams = {
  ProtocolBuilder: undefined;
  ProtocolResult: { goals: Goal[]; level: string };
  NewCycle: { templateId?: string };
};

export type ProfileStackParams = {
  Profile: undefined;
};
