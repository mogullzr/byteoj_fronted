/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LogSpecificInfo } from './LogSpecificInfo';
import type { UserRankInfo } from './UserRankInfo';
export type LogAdminInfo = {
    avg_session?: number;
    browser?: LogSpecificInfo;
    browser_info_list?: Array<LogSpecificInfo>;
    daily_exception_log_list?: Array<number>;
    daily_operation_log_list?: Array<number>;
    daily_user_active_list?: Array<number>;
    monthly_exception_log_list?: Array<number>;
    monthly_operation_log_list?: Array<number>;
    monthly_user_active_list?: Array<number>;
    opeartion_system_list?: Array<LogSpecificInfo>;
    top_end_date?: string;
    top_start_date?: string;
    userRankInfoList?: Array<UserRankInfo>;
    user_active_total?: number;
    user_add_total?: number;
    user_total?: number;
};

