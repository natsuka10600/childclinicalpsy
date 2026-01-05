
export enum Screen {
  HOME = 'HOME',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY',
  GROUP_LESSON_PLAN = 'GROUP_LESSON_PLAN',
  GROUP_SETUP = 'GROUP_SETUP',
  GROUP_OBSERVATION = 'GROUP_OBSERVATION',
  GROUP_REVIEW = 'GROUP_REVIEW',
  ASSESSMENT_SETUP = 'ASSESSMENT_SETUP',
  ASSESSMENT_OBSERVATION = 'ASSESSMENT_OBSERVATION',
  ASSESSMENT_REVIEW = 'ASSESSMENT_REVIEW'
}

export enum AppMode {
  GROUP = 'GROUP',
  ASSESSMENT = 'ASSESSMENT'
}

// --- Group Types ---
export interface Member {
  id: string;
  name: string;
  parentName?: string;
  feature: string;
  seatIndex: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  actorId: string | null;
  actorName: string | null;
  isParentAction?: boolean;
  action: string;
  note: string;
  type: 'behavior' | 'phase' | 'global';
}

export interface GroupSessionData {
  id: string;
  lessonPlanImage: string | null;
  lessonPlanText: string;
  groupName: string;
  date: string;
  therapist: string;
  memberCount: number;
  observer: string;
  sessionNumber: string;
  members: Member[];
  logs: LogEntry[];
  theory: string;
  layoutType?: 'MEETING' | 'CIRCLE' | 'ROWS';
  generatedContent?: string;
}

// --- Assessment Types ---
export interface AssessmentLogEntry {
  id: string;
  timestamp: Date;
  category: string; // e.g., Appearance, Attitude, Test Behavior
  note: string;
}

export interface AssessmentTool {
  id: string;
  name: string;
  result: string;
}

export interface AssessmentSessionData {
  id: string;
  date: string;
  caseName: string;
  age: string;
  gender: string;
  chiefComplaint: string; // Raw input
  provisionalDiagnosis: string;
  logs: AssessmentLogEntry[];
  assessmentTools: AssessmentTool[];
  generatedContent?: string;
}

// --- Constants ---

export const DEFAULT_THEORIES = [
  "行為治療 (Behavioral Therapy)",
  "阿德勒學派 (Adlerian)",
  "心理動力 (Psychodynamic)",
  "人本/存在主義 (Humanistic/Existential)",
  "認知行為 (CBT)"
];

export const BEHAVIOR_TAGS = [
  "離座 (Left Seat)",
  "哭鬧 (Crying)",
  "攻擊 (Aggression)",
  "幫助他人 (Helping)",
  "參與互動 (Engaged)",
  "自我刺激 (Stimming)",
  "抗拒指令 (Refusal)",
  "情緒表達 (Emotional Expr.)"
];

export const ASSESSMENT_TAGS = [
  "外觀 (Appearance)",
  "態度 (Attitude)",
  "配合度 (Cooperation)",
  "注意力 (Attention)",
  "情緒 (Emotion)",
  "測驗反應 (Test Reaction)",
  "語言 (Language)",
  "動作 (Motor)"
];
