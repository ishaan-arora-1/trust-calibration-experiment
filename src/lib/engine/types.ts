export type AgentTone = "formal" | "conversational";
export type ConfidenceFraming = "calibrated" | "overstated";
export type AgentAvatar = "system" | "human" | "expert";
export type RoleSource = "algorithm" | "trained" | "unspecified";

export interface CueConfig {
  agentName: string;
  agentTone: AgentTone;
  confidenceFraming: ConfidenceFraming;
  agentGreeting: string;
  agentAvatar: AgentAvatar;
  roleSource?: RoleSource;
  avatarColor?: string;
  [key: string]: string | undefined;
}

export interface ConditionRecord {
  id: string;
  name: string;
  description: string;
  cueConfig: CueConfig;
  isActive: boolean;
}

export interface ConditionAssignment {
  conditionId: string;
  conditionName: string;
  cueConfig: CueConfig;
}

export interface RecommendationMessage {
  greeting: string;
  recommendation: string;
  confidence: string;
  fullMessage: string;
}
