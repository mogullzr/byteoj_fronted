/* generated using openapi-typescript-codegen -- do not edit */
import type { TestGenerationScaleVO } from './TestGenerationScaleVO';
export type TestGenerationJobVO = {
    jobId?: number; problemId?: number; status?: string; currentStage?: string; progressPercent?: number;
    writeMode?: string; generateExpectedOutput?: boolean; referenceSolutionId?: number; requestedCases?: number;
    generatedCases?: number; outputCompletedCases?: number; publishedCases?: number; duplicateCases?: number;
    retryCount?: number; errorCode?: string; errorMessage?: string; createdAt?: string; startedAt?: string;
    finishedAt?: string; webSocketTopic?: string; scales?: Array<TestGenerationScaleVO>;
};
