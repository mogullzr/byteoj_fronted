/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTestGenerationJobRequest } from '../models/CreateTestGenerationJobRequest';
import type { GeneratorDebugRequest } from '../models/GeneratorDebugRequest';
import type { ReferenceSolutionDebugRequest } from '../models/ReferenceSolutionDebugRequest';
import type { ReferenceSolutionUpsertRequest } from '../models/ReferenceSolutionUpsertRequest';
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type {
    BaseResponse_GeneratorDebugResultVO_, BaseResponse_List_GeneratedCasePreviewVO_,
    BaseResponse_List_ReferenceSolutionVO_, BaseResponse_List_TestGenerationJobVO_,
    BaseResponse_List_TestGenerationScaleVO_, BaseResponse_ReferenceSolutionVO_, BaseResponse_TestGenerationJobVO_
} from '../models/TestGenerationResponses';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AlgorithmTestGenerationControllerService {
    public static createJob(body: CreateTestGenerationJobRequest): CancelablePromise<BaseResponse_TestGenerationJobVO_> {
        return __request(OpenAPI, { method: 'POST', url: '/api/problem/algorithm/admin/test-generation/jobs', body, errors: {401: 'Unauthorized', 403: 'Forbidden'} });
    }
    public static getJob(jobId: number): CancelablePromise<BaseResponse_TestGenerationJobVO_> {
        return __request(OpenAPI, { method: 'GET', url: '/api/problem/algorithm/admin/test-generation/jobs/{jobId}', path: {jobId} });
    }
    public static listJobs(problemId?: number, pageNum = 1, pageSize = 20): CancelablePromise<BaseResponse_List_TestGenerationJobVO_> {
        return __request(OpenAPI, { method: 'GET', url: '/api/problem/algorithm/admin/test-generation/jobs', query: {problemId, pageNum, pageSize} });
    }
    public static cancelJob(jobId: number): CancelablePromise<BaseResponse_boolean_> {
        return __request(OpenAPI, { method: 'POST', url: '/api/problem/algorithm/admin/test-generation/jobs/{jobId}/cancel', path: {jobId} });
    }
    public static retryJob(jobId: number): CancelablePromise<BaseResponse_boolean_> {
        return __request(OpenAPI, { method: 'POST', url: '/api/problem/algorithm/admin/test-generation/jobs/{jobId}/retry', path: {jobId} });
    }
    public static getGenerators(jobId: number): CancelablePromise<BaseResponse_List_TestGenerationScaleVO_> {
        return __request(OpenAPI, { method: 'GET', url: '/api/problem/algorithm/admin/test-generation/jobs/{jobId}/generators', path: {jobId} });
    }
    public static getPreviews(jobId: number, limit = 10): CancelablePromise<BaseResponse_List_GeneratedCasePreviewVO_> {
        return __request(OpenAPI, { method: 'GET', url: '/api/problem/algorithm/admin/test-generation/jobs/{jobId}/previews', path: {jobId}, query: {limit} });
    }
    public static debugGenerator(body: GeneratorDebugRequest): CancelablePromise<BaseResponse_GeneratorDebugResultVO_> {
        return __request(OpenAPI, { method: 'POST', url: '/api/problem/algorithm/admin/test-generation/generator/debug', body });
    }
    public static listReferenceSolutions(problemId: number): CancelablePromise<BaseResponse_List_ReferenceSolutionVO_> {
        return __request(OpenAPI, { method: 'GET', url: '/api/problem/algorithm/admin/test-generation/reference-solution', query: {problemId} });
    }
    public static saveReferenceSolution(body: ReferenceSolutionUpsertRequest): CancelablePromise<BaseResponse_ReferenceSolutionVO_> {
        return __request(OpenAPI, { method: 'PUT', url: '/api/problem/algorithm/admin/test-generation/reference-solution', body });
    }
    public static debugReferenceSolution(body: ReferenceSolutionDebugRequest): CancelablePromise<BaseResponse_List_GeneratedCasePreviewVO_> {
        return __request(OpenAPI, { method: 'POST', url: '/api/problem/algorithm/admin/test-generation/reference-solution/debug', body });
    }
    public static validateReferenceSolution(id: number): CancelablePromise<BaseResponse_ReferenceSolutionVO_> {
        return __request(OpenAPI, { method: 'POST', url: '/api/problem/algorithm/admin/test-generation/reference-solution/{id}/validate', path: {id} });
    }
}
