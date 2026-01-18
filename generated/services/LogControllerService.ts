/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_LogAdminBasicInfo_ } from '../models/BaseResponse_LogAdminBasicInfo_';
import type { BaseResponse_LogAdminInfo_ } from '../models/BaseResponse_LogAdminInfo_';
import type { BaseResponse_LogVo_ } from '../models/BaseResponse_LogVo_';
import type { LogGetSingleInfo } from '../models/LogGetSingleInfo';
import type { LogWebSiteUpdateRequest } from '../models/LogWebSiteUpdateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogControllerService {
    /**
     * logDetailInfoGet
     * @param logGetSingleInfo logGetSingleInfo
     * @returns BaseResponse_LogVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static logDetailInfoGetUsingPost(
        logGetSingleInfo: LogGetSingleInfo,
    ): CancelablePromise<BaseResponse_LogVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/log/detail',
            body: logGetSingleInfo,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * logAnalysisBasic
     * @returns BaseResponse_LogAdminBasicInfo_ OK
     * @throws ApiError
     */
    public static logAnalysisBasicUsingGet(): CancelablePromise<BaseResponse_LogAdminBasicInfo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/log/info_basic_daily',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * logAnalysisDetailGet
     * @returns BaseResponse_LogAdminInfo_ OK
     * @throws ApiError
     */
    public static logAnalysisDetailGetUsingGet(): CancelablePromise<BaseResponse_LogAdminInfo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/log/info_detail_complex',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * logWebInfoUpdate
     * @param logWebSiteUpdateRequest logWebSiteUpdateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static logWebInfoUpdateUsingPost(
        logWebSiteUpdateRequest: LogWebSiteUpdateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/log/web/update',
            body: logWebSiteUpdateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
