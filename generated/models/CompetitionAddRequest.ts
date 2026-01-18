/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompetitionProblems } from './CompetitionProblems';
export type CompetitionAddRequest = {
    algorithm_problem_list?: Array<CompetitionProblems>;
    avatar?: string;
    competition_id?: number;
    competition_name?: string;
    created_by?: number;
    description?: string;
    end_time?: string;
    math408_problem_list?: Array<CompetitionProblems>;
    password?: string;
    pattern?: number;
    start_time?: string;
    status?: number;
    type?: number;
    is_procter?: number;
};

