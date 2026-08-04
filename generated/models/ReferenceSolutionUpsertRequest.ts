/* generated using openapi-typescript-codegen -- do not edit */
export type ReferenceSolutionUpsertRequest = {
    id?: number;
    problemId: number;
    language: string;
    sourceCode: string;
    sourceType?: 'ADMIN_PROVIDED' | 'ACCEPTED_SUBMISSION' | 'AI_PROPOSED';
    note?: string;
};
