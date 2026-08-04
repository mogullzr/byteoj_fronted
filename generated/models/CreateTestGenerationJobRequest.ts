/* generated using openapi-typescript-codegen -- do not edit */
import type { TestGenerationScaleRequest } from './TestGenerationScaleRequest';
export type CreateTestGenerationJobRequest = {
    problemId: number;
    model: string;
    writeMode?: 'APPEND' | 'REPLACE';
    generateExpectedOutput?: boolean;
    confirmEmptyOutput?: boolean;
    referenceSolutionId?: number;
    previewChars?: number;
    scales: Array<TestGenerationScaleRequest>;
};
