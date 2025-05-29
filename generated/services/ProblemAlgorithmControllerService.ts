/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlgorithmQueryRequest } from '../models/AlgorithmQueryRequest';
import type { BaseResponse_AliyunVodVo_ } from '../models/BaseResponse_AliyunVodVo_';
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_Judge_ } from '../models/BaseResponse_Judge_';
import type { BaseResponse_List_CompetitionProblemsVo_ } from '../models/BaseResponse_List_CompetitionProblemsVo_';
import type { BaseResponse_List_Judge_ } from '../models/BaseResponse_List_Judge_';
import type { BaseResponse_List_ProblemAlgorithmBankVo_ } from '../models/BaseResponse_List_ProblemAlgorithmBankVo_';
import type { BaseResponse_List_ProblemAlgorithmTestCaseRequest_ } from '../models/BaseResponse_List_ProblemAlgorithmTestCaseRequest_';
import type { BaseResponse_List_ProblemDailyNumVo_ } from '../models/BaseResponse_List_ProblemDailyNumVo_';
import type { BaseResponse_List_ProblemTagsVo_ } from '../models/BaseResponse_List_ProblemTagsVo_';
import type { BaseResponse_List_string_ } from '../models/BaseResponse_List_string_';
import type { BaseResponse_List_SubmissionsAlgorithmRecordsVo_ } from '../models/BaseResponse_List_SubmissionsAlgorithmRecordsVo_';
import type { BaseResponse_long_ } from '../models/BaseResponse_long_';
import type { BaseResponse_ProblemAlgorithmBankVo_ } from '../models/BaseResponse_ProblemAlgorithmBankVo_';
import type { BaseResponse_ProblemUserLastVo_ } from '../models/BaseResponse_ProblemUserLastVo_';
import type { BaseResponse_ResponseEntity_Array_byte_ } from '../models/BaseResponse_ResponseEntity_Array_byte_';
import type { BaseResponse_SubmissionsAlgorithmRecordsVo_ } from '../models/BaseResponse_SubmissionsAlgorithmRecordsVo_';
import type { JudgeRequest } from '../models/JudgeRequest';
import type { ProblemAlgorithmRequest } from '../models/ProblemAlgorithmRequest';
import type { ProblemAlgorithmTestCaseRequest } from '../models/ProblemAlgorithmTestCaseRequest';
import type { UserLastEnter } from '../models/UserLastEnter';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProblemAlgorithmControllerService {
    /**
     * problemAlgorithmAdd
     * @param problemAlgorithmRequest problemAlgorithmRequest
     * @param status status
     * @param username username
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmAddUsingPost(
        problemAlgorithmRequest: ProblemAlgorithmRequest,
        status?: number,
        username?: string,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/add',
            query: {
                'status': status,
                'username': username,
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
     * problemAlgorithmDelete
     * @param problemId problem_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmDeleteUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/delete',
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
     * problemAlgorithmModify
     * @param problemAlgorithmRequest problemAlgorithmRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmModifyUsingPost(
        problemAlgorithmRequest: ProblemAlgorithmRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/modify',
            body: problemAlgorithmRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmTestCaseAdd
     * @param problemAlgorithmTestCaseRequestList problemAlgorithmTestCaseRequestList
     * @param problemId problem_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmTestCaseAddUsingPost(
        problemAlgorithmTestCaseRequestList: Array<ProblemAlgorithmTestCaseRequest>,
        problemId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/testCase/add',
            query: {
                'problem_id': problemId,
            },
            body: problemAlgorithmTestCaseRequestList,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmTestCaseGet
     * @param problemId problem_id
     * @returns BaseResponse_List_ProblemAlgorithmTestCaseRequest_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmTestCaseGetUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_List_ProblemAlgorithmTestCaseRequest_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/testCase/get',
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
     * problemAlgorithmTestCasesAdd
     * @param file file
     * @param problemId problem_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmTestCasesAddUsingPost(
        file: Blob,
        problemId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/testCaseFile/add',
            query: {
                'problem_id': problemId,
            },
            body: file,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmTestCaseFileGet
     * @param problemId problem_id
     * @returns BaseResponse_ResponseEntity_Array_byte_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmTestCaseFileGetUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_ResponseEntity_Array_byte_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/admin/testCaseFile/get',
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
     * AliyunVodGet
     * @param problemId problem_id
     * @returns BaseResponse_AliyunVodVo_ OK
     * @throws ApiError
     */
    public static aliyunVodGetUsingGet(
        problemId: number,
    ): CancelablePromise<BaseResponse_AliyunVodVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/algorithm/aliyun/vod',
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
     * problemAlgorithmGetTags
     * @returns BaseResponse_List_string_ OK
     * @throws ApiError
     */
    public static problemAlgorithmGetTagsUsingGet(): CancelablePromise<BaseResponse_List_string_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/algorithm/get/tags',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmGetTagsPlusCategory
     * @returns BaseResponse_List_ProblemTagsVo_ OK
     * @throws ApiError
     */
    public static problemAlgorithmGetTagsPlusCategoryUsingGet(): CancelablePromise<BaseResponse_List_ProblemTagsVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/algorithm/get/tagsPlusCategory',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmJudgeSubmit
     * @param judgeRequest judgeRequest
     * @returns BaseResponse_Judge_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmJudgeSubmitUsingPost(
        judgeRequest: JudgeRequest,
    ): CancelablePromise<BaseResponse_Judge_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/judge/submit',
            body: judgeRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmJudge
     * @param judgeRequest judgeRequest
     * @returns BaseResponse_List_Judge_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmJudgeUsingPost(
        judgeRequest: JudgeRequest,
    ): CancelablePromise<BaseResponse_List_Judge_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/judge/test',
            body: judgeRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmRecordAdd
     * @param judgeRequest judgeRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmRecordAddUsingPost(
        judgeRequest: JudgeRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/record/add',
            body: judgeRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmRecordsByUUidByPage
     * @param pageNum pageNum
     * @param problemId problem_id
     * @returns BaseResponse_List_SubmissionsAlgorithmRecordsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmRecordsByUUidByPageUsingPost(
        pageNum?: number,
        problemId?: number,
    ): CancelablePromise<BaseResponse_List_SubmissionsAlgorithmRecordsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/records',
            query: {
                'pageNum': pageNum,
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
     * problemAlgorithmRecordsSumByUuidByPage
     * @param problemId problem_id
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmRecordsSumByUuidByPageUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/records/page/sum',
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
     * problemAlgorithmRecordByRecordId
     * @param competitionId competition_id
     * @param submissionId submission_id
     * @returns BaseResponse_SubmissionsAlgorithmRecordsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmRecordByRecordIdUsingPost(
        competitionId?: number,
        submissionId?: number,
    ): CancelablePromise<BaseResponse_SubmissionsAlgorithmRecordsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/records/recordId',
            query: {
                'competition_id': competitionId,
                'submission_id': submissionId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmRecordsAllByUuidByPage
     * @param pageNum pageNum
     * @returns BaseResponse_List_SubmissionsAlgorithmRecordsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmRecordsAllByUuidByPageUsingPost(
        pageNum?: number,
    ): CancelablePromise<BaseResponse_List_SubmissionsAlgorithmRecordsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/records/user/page',
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
     * problemAlgorithmRecordsAllSumByUuidByPage
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmRecordsAllSumByUuidByPageUsingPost(): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/records/user/sum',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * ListAlgorithmVoByPage
     * @param algorithmQueryRequest algorithmQueryRequest
     * @returns BaseResponse_List_ProblemAlgorithmBankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listAlgorithmVoByPageUsingPost(
        algorithmQueryRequest: AlgorithmQueryRequest,
    ): CancelablePromise<BaseResponse_List_ProblemAlgorithmBankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/search',
            body: algorithmQueryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmSearchSumByDifficulty
     * @param difficulty difficulty
     * @returns BaseResponse_long_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmSearchSumByDifficultyUsingPost(
        difficulty?: string,
    ): CancelablePromise<BaseResponse_long_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/search/difficulty/sum',
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
     * competitionSearchProblem
     * @param competitionId competition_id
     * @param index index
     * @returns BaseResponse_ProblemAlgorithmBankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static competitionSearchProblemUsingPost(
        competitionId?: number,
        index?: string,
    ): CancelablePromise<BaseResponse_ProblemAlgorithmBankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/search/problem',
            query: {
                'competition_id': competitionId,
                'index': index,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmSearchByProblemId
     * @param problemId problem_id
     * @returns BaseResponse_ProblemAlgorithmBankVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmSearchByProblemIdUsingPost(
        problemId?: number,
    ): CancelablePromise<BaseResponse_ProblemAlgorithmBankVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/search/problemId',
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
     * problemAlgorithmUserLast
     * @returns BaseResponse_ProblemUserLastVo_ OK
     * @throws ApiError
     */
    public static problemAlgorithmUserLastUsingGet(): CancelablePromise<BaseResponse_ProblemUserLastVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/problem/algorithm/search/problemLast',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * competitionSearchProblems
     * @param competitionId competition_id
     * @returns BaseResponse_List_CompetitionProblemsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static competitionSearchProblemsUsingPost(
        competitionId?: number,
    ): CancelablePromise<BaseResponse_List_CompetitionProblemsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/search/problems',
            query: {
                'competition_id': competitionId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * getProblemDailyNum
     * @returns BaseResponse_List_ProblemDailyNumVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static getProblemDailyNumUsingPost(): CancelablePromise<BaseResponse_List_ProblemDailyNumVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/search/user/daily',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * problemAlgorithmSetUserLast
     * @param userLastEnter userLastEnter
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static problemAlgorithmSetUserLastUsingPost(
        userLastEnter: UserLastEnter,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/problem/algorithm/set/problemLast',
            body: userLastEnter,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
