/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_MonitorUserVo_ } from '../models/BaseResponse_List_MonitorUserVo_';
import type { MonitorUserRegisterRequest } from '../models/MonitorUserRegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HeartbeatControllerService {
    /**
     * heartbeat
     * @param clientId clientId
     * @param seq seq
     * @param xAuthToken X-Auth-Token
     * @returns any OK
     * @throws ApiError
     */
    public static heartbeatUsingPost(
        clientId: string,
        seq: number,
        xAuthToken: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/heartbeat/',
            headers: {
                'X-Auth-Token': xAuthToken,
            },
            query: {
                'clientId': clientId,
                'seq': seq,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * register
     * @param monitorUserRegisterRequest monitorUserRegisterRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static registerUsingPost(
        monitorUserRegisterRequest: MonitorUserRegisterRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/heartbeat/register',
            body: monitorUserRegisterRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * monitorUserListVo
     * @param pageNum pageNum
     * @param clientId clientId
     * @param username username
     * @param status status
     * @returns BaseResponse_List_MonitorUserVo_ OK
     * @throws ApiError
     */
    public static monitorUserListVoUsingGet(
        pageNum: number,
        clientId?: string,
        username?: string,
        status?:number
    ): CancelablePromise<BaseResponse_List_MonitorUserVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/heartbeat/vo',
            query: {
                'clientId': clientId,
                'pageNum': pageNum,
                'username': username,
                'status':status
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
