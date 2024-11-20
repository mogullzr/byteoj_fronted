/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import type { BaseResponse_Course_ } from "../models/BaseResponse_Course_";
import type { BaseResponse_List_Course_ } from "../models/BaseResponse_List_Course_";
import type { BaseResponse_List_CourseProblemsVo_ } from "../models/BaseResponse_List_CourseProblemsVo_";
import type { CourseRequest } from "../models/CourseRequest";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
import { CourseUserRequest } from "../models/CourseUserRequest.ts";

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
      method: "POST",
      url: "/api/course/admin/add",
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
      method: "POST",
      url: "/api/course/admin/delete",
      query: {
        courseId: courseId,
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
      method: "POST",
      url: "/api/course/admin/problem/set",
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
   * @param courseUserRequest CourseUserRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static courseAdminUserSetUsingPost(
    courseUserRequest: CourseUserRequest,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/course/admin/user/set",
      body: courseUserRequest,
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
      method: "POST",
      url: "/api/course/search/courseId",
      query: {
        CourseId: courseId,
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
   * @param pageNum PageNum
   * @returns BaseResponse_List_Course_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static courseSearchByPageNumUsingPost(
    pageNum?: number,
  ): CancelablePromise<BaseResponse_List_Course_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/course/search/pageNum",
      query: {
        PageNum: pageNum,
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
      method: "POST",
      url: "/api/course/search/problems",
      query: {
        CourseId: courseId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
