/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeepSeekRequest } from '../models/DeepSeekRequest';
import type { SseEmitter } from '../models/SseEmitter';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DeepSeekAiControllerService {
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @throws ApiError
     */
    public static deepSeekChatUsingGet(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @throws ApiError
     */
    public static deepSeekChatUsingHead(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @returns any Created
     * @throws ApiError
     */
    public static deepSeekChatUsingPost(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @returns any Created
     * @throws ApiError
     */
    public static deepSeekChatUsingPut(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter | any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @throws ApiError
     */
    public static deepSeekChatUsingDelete(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @throws ApiError
     */
    public static deepSeekChatUsingOptions(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter> {
        return __request(OpenAPI, {
            method: 'OPTIONS',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * deepSeekChat
     * @param deepSeekRequest deepSeekRequest
     * @returns SseEmitter OK
     * @throws ApiError
     */
    public static deepSeekChatUsingPatch(
        deepSeekRequest: DeepSeekRequest,
    ): CancelablePromise<SseEmitter> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/ai/ask',
            body: deepSeekRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
}
