/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_string_ } from '../models/BaseResponse_string_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RsaControllerService {
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @throws ApiError
     */
    public static getPublicKeyUsingGet(): CancelablePromise<BaseResponse_string_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @throws ApiError
     */
    public static getPublicKeyUsingHead(): CancelablePromise<BaseResponse_string_> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static getPublicKeyUsingPost(): CancelablePromise<BaseResponse_string_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static getPublicKeyUsingPut(): CancelablePromise<BaseResponse_string_ | any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @throws ApiError
     */
    public static getPublicKeyUsingDelete(): CancelablePromise<BaseResponse_string_> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @throws ApiError
     */
    public static getPublicKeyUsingOptions(): CancelablePromise<BaseResponse_string_> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * getPublicKey
     * @returns BaseResponse_string_ OK
     * @throws ApiError
     */
    public static getPublicKeyUsingPatch(): CancelablePromise<BaseResponse_string_> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/getPublicKey',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
}
