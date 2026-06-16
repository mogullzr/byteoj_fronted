/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { VideoUploadRequest } from '../models/VideoUploadRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VideoControllerService {
    /**
     * VideoUpload
     * @param videoUploadRequest videoUploadRequest
     * @returns BaseResponse_boolean_ OK
     * @throws ApiError
     */
    public static videoUploadUsingGet(
        videoUploadRequest: VideoUploadRequest,
    ): CancelablePromise<BaseResponse_boolean_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/video/upload',
            body: videoUploadRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
