/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompetitionRecordsRequest } from './CompetitionRecordsRequest';
export type SearchRequest = {
    category?: string;
    code?: Array<number>;
    competitionRecordsRequest?: CompetitionRecordsRequest;
    current?: number;
    difficulty?: string;
    endMilliSeconds?: number;
    is_date_order?: number;
    keyword?: string;
    module?: string;
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    size?: number;
    sourceList?: Array<string>;
    startMilliSeconds?: number;
    status?: number;
    tagsList?: Array<number>;
    type?: Array<string>;
};

