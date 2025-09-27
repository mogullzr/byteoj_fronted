/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_Course_ } from '../models/BaseResponse_Course_';
import type { BaseResponse_List_Course_ } from '../models/BaseResponse_List_Course_';
import type { BaseResponse_List_CourseProblemsVo_ } from '../models/BaseResponse_List_CourseProblemsVo_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { CourseRequest } from '../models/CourseRequest';
import type { CourseUserRequest } from '../models/CourseUserRequest';
import type { LantuPayCallbackRequest } from '../models/LantuPayCallbackRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CourseControllerService {
    /**
     * courseAdminAdd
     * @param courseRequest courseRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseAdminAddUsingPost(
        courseRequest: CourseRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/admin/add',
            body: courseRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseAdminDelete
     * @param courseId courseId
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseAdminDeleteUsingPost(
        courseId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/admin/delete',
            query: {
                'courseId': courseId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseAdminProblemSet
     * @param courseRequest courseRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseAdminProblemSetUsingPost(
        courseRequest: CourseRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/admin/problem/set',
            body: courseRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseAdminUserSet
     * @param courseUserRequest courseUserRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseAdminUserSetUsingPost(
        courseUserRequest: CourseUserRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/admin/user/set',
            body: courseUserRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseJoin
     * @param callbackRequest callbackRequest
     * @returns string OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseJoinUsingPost(
        callbackRequest: LantuPayCallbackRequest,
    ): CancelablePromise<string | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/join',
            body: callbackRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseSearchByCourseId
     * @param courseId CourseId
     * @returns BaseResponse_Course_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseSearchByCourseIdUsingPost(
        courseId?: number,
    ): CancelablePromise<BaseResponse_Course_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/search/courseId',
            query: {
                'CourseId': courseId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseSearchByPageNum
     * @param pageNum pageNum
     * @returns BaseResponse_List_Course_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseSearchByPageNumUsingPost(
        pageNum?: number,
    ): CancelablePromise<BaseResponse_List_Course_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/search/pageNum',
            query: {
                'pageNum': pageNum,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseSearchProblemsByCourseId
     * @param courseId CourseId
     * @returns BaseResponse_List_CourseProblemsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseSearchProblemsByCourseIdUsingPost(
        courseId?: number,
    ): CancelablePromise<BaseResponse_List_CourseProblemsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/search/problems',
            query: {
                'CourseId': courseId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * courseSearchRankByCourseId
     * @param courseId CourseId
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static courseSearchRankByCourseIdUsingPost(
        courseId?: number,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/course/search/rank',
            query: {
                'CourseId': courseId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
