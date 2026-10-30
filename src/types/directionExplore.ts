export type DirectionStatus = "available" | "planned" | "disabled";

export type InteractionType =
  | "choice"
  | "sort"
  | "parameter"
  | "code-gap"
  | "result-check"
  | "chart-choice";

export interface Direction {
  id: string;
  name: string;
  summary: string;
  estimatedMinutes: number;
  status: DirectionStatus;
  taskId?: string;
}

export interface TaskOption {
  id: string;
  label: string;
}

export interface TaskStep {
  id: string;
  title: string;
  content: string;
  interactionType: InteractionType;
  options?: TaskOption[];
  correctOptionId?: string;
  correctOrderIds?: string[];
  expectedAnswer?: string;
  acceptAnyNonEmpty?: boolean;
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  targetValue?: number;
  tolerance?: number;
  errorHint: string;
  completionFeedback: string;
}

export interface ExperienceTask {
  id: string;
  directionId: string;
  title: string;
  estimatedMinutes: number;
  steps: TaskStep[];
  completionFeedback: string;
  nextStep: string;
  selfAssessmentOptions: string[];
}

export interface ExperienceRecord {
  taskId: string;
  directionId: string;
  startedAt: number;
  completedAt: number | null;
  durationSeconds: number;
  retryCount: number;
  completed: boolean;
  selfAssessment?: string;
}

export interface ActiveExperience {
  taskId: string;
  stepIndex: number;
  startedAt: number;
  retryCount: number;
  answers: Record<string, string | number | string[]>;
  completedStepIds: string[];
}

export interface CompletedExperiencePointer {
  taskId: string;
  startedAt: number;
}

export interface DirectionExploreState {
  version: 1;
  activeExperience: ActiveExperience | null;
  completedExperience?: CompletedExperiencePointer | null;
  records: ExperienceRecord[];
}
