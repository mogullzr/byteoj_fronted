/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProblemExamProblemInfo } from '../../../generated/models/ProblemExamProblemInfo';
export type ProblemExamEditRequest = {
    end_date?: number;
    exam_id?: number;
    exam_name?: string;
    password?: string;
    picture?: string;
    problemExamProblemInfos?: Array<ProblemExamProblemInfo>;
    start_date?: number;
    status?: number;
    time?: number;
};

