/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_SearchVo_ } from '../models/BaseResponse_SearchVo_';
import type { SearchRequest } from '../models/SearchRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchControllerService {
    /**
     * SearchAll
     * @param searchRequest searchRequest
     * @returns BaseResponse_SearchVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static searchAllUsingPost(
        searchRequest: SearchRequest,
    ): CancelablePromise<BaseResponse_SearchVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/search/all/vo',
            body: searchRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
