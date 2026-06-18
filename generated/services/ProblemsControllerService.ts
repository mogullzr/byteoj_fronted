/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_ProblemMath408BankVo_ } from '../models/BaseResponse_List_ProblemMath408BankVo_';
import type { BaseResponse_List_ProblemSimilarityVo_ } from '../models/BaseResponse_List_ProblemSimilarityVo_';
import type { BaseResponse_ProblemExamSubmitVo_ } from '../models/BaseResponse_ProblemExamSubmitVo_';
import type { BaseResponse_ProblemExamVo_ } from '../models/BaseResponse_ProblemExamVo_';
import type { BaseResponse_ProblemMath408BankVo_ } from '../models/BaseResponse_ProblemMath408BankVo_';
import type { ProblemExamEditRequest } from '../models/ProblemExamEditRequest';
import type { ProblemExamSubmitRequest } from '../models/ProblemExamSubmitRequest';
import type { ProblemRequest } from '../models/ProblemRequest';
import type { CancelablePromise } from '../../../generated/core/CancelablePromise';
import { OpenAPI } from '../../../generated/core/OpenAPI';
import { request as __request } from '../../../generated/core/request';
export class ProblemsControllerService {
    /**
     * ProblemSearchExamId
     * @param examId exam_id
     * @returns BaseResponse_ProblemExamVo_ OK
     * @throws ApiError
     */
    public static problemSearchExamIdUsingGet(
        examId?: number,
    ): CancelablePromise<BaseResponse_ProblemExamVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/other/exam',
            query: {
                'exam_id': examId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * ProblemExamEdit
     * @param problemExamRequest problemExamRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemExamEditUsingPost(
        problemExamRequest: ProblemExamEditRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/other/exam/edit',
            body: problemExamRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * ProblemExamSearchDetail
     * @param examId exam_id
     * @returns BaseResponse_List_ProblemMath408BankVo_ OK
     * @throws ApiError
     */
    public static problemExamSearchDetailUsingGet(
        examId?: number,
    ): CancelablePromise<BaseResponse_List_ProblemMath408BankVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/other/exam/problem',
            query: {
                'exam_id': examId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * ProblemExamSubmit
     * @param problemExamRequest problemExamRequest
     * @returns BaseResponse_ProblemExamSubmitVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemExamSubmitUsingPost(
        problemExamRequest: ProblemExamSubmitRequest,
    ): CancelablePromise<BaseResponse_ProblemExamSubmitVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/other/exam/submit',
            body: problemExamRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
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
     * ProblemSearchSimilarity
     * @param problemIdList problem_id_list
     * @returns BaseResponse_List_ProblemSimilarityVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemSearchSimilarityUsingPost(
        problemIdList: Array<number>,
    ): CancelablePromise<BaseResponse_List_ProblemSimilarityVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/other/similar',
            body: problemIdList,
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
