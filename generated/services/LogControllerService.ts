/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_LogAdminBasicInfo_ } from '../models/BaseResponse_LogAdminBasicInfo_';
import type { BaseResponse_LogAdminInfo_ } from '../models/BaseResponse_LogAdminInfo_';
import type { BaseResponse_LogVo_ } from '../models/BaseResponse_LogVo_';
import type { LogGetSingleInfo } from '../models/LogGetSingleInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogControllerService {
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
     * logDetailInfoGet
     * @param logGetSingleInfo logGetSingleInfo
     * @returns BaseResponse_LogVo_ OK
     * @throws ApiError
     */
    public static logDetailInfoGetUsingGet(
        logGetSingleInfo: LogGetSingleInfo,
    ): CancelablePromise<BaseResponse_LogVo_> {
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
}
