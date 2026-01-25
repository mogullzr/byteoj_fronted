/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_ProblemMath408BankVo_ } from '../models/BaseResponse_ProblemMath408BankVo_';
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
}
