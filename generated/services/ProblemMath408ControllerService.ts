/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_ProblemMath408BankVo_ } from '../models/BaseResponse_List_ProblemMath408BankVo_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_ProblemMath408BankVo_ } from '../models/BaseResponse_ProblemMath408BankVo_';
import type { BaseResponse_string_ } from '../models/BaseResponse_string_';
import type { ProblemMath408Request } from '../models/ProblemMath408Request';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProblemMath408ControllerService {
    /**
     * problemMath408Add
     * @param problemMath408Request problemMath408Request
     * @param status status
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408AddUsingPost(
        problemMath408Request: ProblemMath408Request,
        status?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/admin/add',
            query: {
                'status': status,
            },
            body: problemMath408Request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408Delete
     * @param problemId problem_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408DeleteUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/admin/delete',
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
     * problemMath408Modify
     * @param problemMath408Request problemMath408Request
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408ModifyUsingPost(
        problemMath408Request: ProblemMath408Request,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/admin/modify',
            body: problemMath408Request,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408SearchAll
     * @param status status
     * @returns BaseResponse_List_ProblemMath408BankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408SearchAllUsingPost(
        status?: number,
    ): CancelablePromise<BaseResponse_List_ProblemMath408BankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/search/all',
            query: {
                'status': status,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408SearchByDifficulty
     * @param difficulty difficulty
     * @returns BaseResponse_List_ProblemMath408BankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408SearchByDifficultyUsingPost(
        difficulty?: string,
    ): CancelablePromise<BaseResponse_List_ProblemMath408BankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/search/difficulty',
            query: {
                'difficulty': difficulty,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408SearchByPage
     * @param pageNum PageNum
     * @param status status
     * @returns BaseResponse_List_ProblemMath408BankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408SearchByPageUsingPost(
        pageNum?: number,
        status?: number,
    ): CancelablePromise<BaseResponse_List_ProblemMath408BankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/search/page',
            query: {
                'PageNum': pageNum,
                'status': status,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408SearchPageSum
     * @param status status
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408SearchPageSumUsingPost(
        status?: number,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/search/page/sum',
            query: {
                'status': status,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408SearchByProblemId
     * @param problemId problem_id
     * @returns BaseResponse_ProblemMath408BankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408SearchByProblemIdUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_ProblemMath408BankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/search/problemId',
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
     * problemMath408SearchByTagId
     * @param tagId tag_id
     * @returns BaseResponse_List_ProblemMath408BankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408SearchByTagIdUsingPost(
        tagId?: number,
    ): CancelablePromise<BaseResponse_List_ProblemMath408BankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/search/tags',
            query: {
                'tag_id': tagId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemMath408GetProblemAnswer
     * @param problemId problem_id
     * @returns BaseResponse_string_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemMath408GetProblemAnswerUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_string_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/math408/submit/records',
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
