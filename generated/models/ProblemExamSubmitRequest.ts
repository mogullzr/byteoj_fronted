/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProblemSimpleInfo } from './ProblemSimpleInfo';
export type ProblemExamSubmitRequest = {
    answers?: Array<ProblemSimpleInfo>;
    exam_id?: number;
    progress_token?: string;
    ai_model?: 'GPT_5_4' | 'DEEPSEEK' | string;
};

