/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_ProblemMath408BankVo_ } from '../models/BaseResponse_ProblemMath408BankVo_';
import type { ProblemRequest } from '../models/ProblemRequest.ts';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProblemsControllerService {
    /**
     * ProblemSearchByProblemId
     * @param problemId problem_id
     * @returns BaseResponse_ProblemMath408BankVo_ OK
     * @throws ApiError
     */
    public static problemSearchByProblemIdUsingGet(
        problemId?: number,
    ): CancelablePromise<BaseResponse_ProblemMath408BankVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/other/search/problemId',
            query: {
                'problem_id': problemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * ProblemUpdate
     * @param problemRequest problemRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemUpdateUsingPost(
        problemRequest: ProblemRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/other/update',
            body: problemRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
