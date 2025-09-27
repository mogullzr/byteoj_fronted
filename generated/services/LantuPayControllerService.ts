/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_LantuPayVo_ } from '../models/BaseResponse_LantuPayVo_';
import type { BaseResponse_List_string_ } from '../models/BaseResponse_List_string_';
import type { LantuPayOtherRequest } from '../models/LantuPayOtherRequest';
import type { LantuPayRequest } from '../models/LantuPayRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LantuPayControllerService {
    /**
     * lantuPay
     * @param lantuPayRequest lantuPayRequest
     * @returns BaseResponse_LantuPayVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static lantuPayUsingPost(
        lantuPayRequest: LantuPayRequest,
    ): CancelablePromise<BaseResponse_LantuPayVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lantu/pay',
            body: lantuPayRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * lantuPayBack
     * @param lantuPayBackRequest lantuPayBackRequest
     * @returns BaseResponse_List_string_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static lantuPayBackUsingPost(
        lantuPayBackRequest: Array<LantuPayOtherRequest>,
    ): CancelablePromise<BaseResponse_List_string_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lantu/pay/back',
            body: lantuPayBackRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * lantuPayStatus
     * @param lantuPayOtherRequest lantuPayOtherRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static lantuPayStatusUsingPost(
        lantuPayOtherRequest: LantuPayOtherRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lantu/pay/status',
            body: lantuPayOtherRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
