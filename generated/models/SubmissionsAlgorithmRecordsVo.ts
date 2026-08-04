/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubmissionAlgorithmDetailRecordVo } from './SubmissionAlgorithmDetailRecordVo';
export type SubmissionsAlgorithmRecordsVo = {
    avatar?: string;
    chinese_name?: string;
    code_length?: number;
    language?: any;
    memory_used?: number;
    page_num?: number;
    /** 仅 Pending 状态返回，范围为 0-9。 */
    sandbox_index?: number;
    /** 所属沙箱队列中排在当前任务前方的任务数量。 */
    queue_ahead?: number;
    /** 当前用户的 Pending 提交总数。 */
    pending_total?: number;
    rated?: number;
    result?: any;
    score?: number;
    source_code?: string;
    submission_id?: number;
    problem_id?: number;
    competition_id?: number;
    submission_list?: Array<SubmissionAlgorithmDetailRecordVo>;
    submit_time?: string;
    test_num?: number;
    time_used?: number;
    user_name?: string;
    uuid?: number;
};

