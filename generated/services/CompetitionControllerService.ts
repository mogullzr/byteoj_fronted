/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import type { BaseResponse_CompetitionInfoVo_ } from "../models/BaseResponse_CompetitionInfoVo_";
import type { BaseResponse_CompetitionRankVo_ } from "../models/BaseResponse_CompetitionRankVo_";
import type { BaseResponse_List_CompetitionInfoVo_ } from "../models/BaseResponse_List_CompetitionInfoVo_";
import type { BaseResponse_List_SubmissionsAlgorithmRecordsVo_ } from "../models/BaseResponse_List_SubmissionsAlgorithmRecordsVo_";
import type { BaseResponse_List_UserVo_ } from "../models/BaseResponse_List_UserVo_";
import type { BaseResponse_long_ } from "../models/BaseResponse_long_";
import type { BaseResponse_Void_ } from "../models/BaseResponse_Void_";
import type { CompetitionAddRequest } from "../models/CompetitionAddRequest";
import type { ProblemAlgorithmRequest } from "../models/ProblemAlgorithmRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";
export class CompetitionControllerService {
  /**
   * competitionAlgorithmAddByAdmin
   * @param problemAlgorithmRequest problemAlgorithmRequest
   * @param status status
   * @param username username
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionAlgorithmAddByAdminUsingPost(
    problemAlgorithmRequest: ProblemAlgorithmRequest,
    status?: number,
    username?: string
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/admin/algorithm/add",
      query: {
        status: status,
        username: username,
      },
      body: problemAlgorithmRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionDeleteByAdmin
   * @param competitionId competition_id
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionDeleteByAdminUsingPost(
    competitionId?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/admin/delete",
      query: {
        competition_id: competitionId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionAdminGetRankExcel
   * @param competitionId competition_id
   * @returns BaseResponse_Void_ OK
   * @throws ApiError
   */
  public static competitionAdminGetRankExcelUsingGet(
    competitionId?: number
  ): CancelablePromise<BaseResponse_Void_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/competition/get/rank/excel",
      query: {
        competition_id: competitionId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionUserJoin
   * @param competitionId competition_id
   * @param password password
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionUserJoinUsingPost(
    competitionId?: number,
    password?: string
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/join",
      query: {
        competition_id: competitionId,
        password: password,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionUserJoinCancel
   * @param competitionId competition_id
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionUserJoinCancelUsingPost(
    competitionId?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/join/cancel",
      query: {
        competition_id: competitionId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionSearchByCompetitionId
   * @param competitionId competition_id
   * @returns BaseResponse_CompetitionInfoVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionSearchByCompetitionIdUsingPost(
    competitionId?: number
  ): CancelablePromise<BaseResponse_CompetitionInfoVo_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/search/competitionId",
      query: {
        competition_id: competitionId,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionSearchByPage
   * @param pageNum PageNum
   * @returns BaseResponse_List_CompetitionInfoVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionSearchByPageUsingPost(
    pageNum?: number
  ): CancelablePromise<BaseResponse_List_CompetitionInfoVo_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/search/page",
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
   * competitionSearchRank
   * @param competitionId competition_id
   * @param pageNum PageNum
   * @param status
   * @returns BaseResponse_CompetitionRankVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionSearchRankUsingPost(
    competitionId?: number,
    pageNum?: number,
    status?: number
  ): CancelablePromise<BaseResponse_CompetitionRankVo_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/search/rank/pageNum",
      query: {
        competition_id: competitionId,
        PageNum: pageNum,
        status: status,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionSearchRecord
   * @param competitionId competition_id
   * @param pageNum PageNum
   * @returns BaseResponse_List_SubmissionsAlgorithmRecordsVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionSearchRecordUsingPost(
    competitionId?: number,
    pageNum?: number
  ): CancelablePromise<BaseResponse_List_SubmissionsAlgorithmRecordsVo_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/search/records/pageNum",
      query: {
        competition_id: competitionId,
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
   * competitionSearchRankTop10
   * @returns BaseResponse_List_UserVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionSearchRankTop10UsingPost(): CancelablePromise<
    BaseResponse_List_UserVo_ | any
  > {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/search/top",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionAddByUser
   * @param competitionAddRequest competitionAddRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionAddByUserUsingPost(
    competitionAddRequest: CompetitionAddRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/user/add",
      body: competitionAddRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
  /**
   * competitionModifyByUser
   * @param competitionAddRequest competitionAddRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static competitionModifyByUserUsingPost(
    competitionAddRequest: CompetitionAddRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/competition/user/modify",
      body: competitionAddRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}
