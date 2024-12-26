/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_List_PostsCommentVo_ } from '../models/BaseResponse_List_List_PostsCommentVo_';
import type { BaseResponse_List_PostsVo_ } from '../models/BaseResponse_List_PostsVo_';
import type { BaseResponse_PostsVo_ } from '../models/BaseResponse_PostsVo_';
import type { PostsCommentRequest } from '../models/PostsCommentRequest';
import type { PostsQueryRequest } from '../models/PostsQueryRequest';
import type { PostsRequest } from '../models/PostsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PostsControllerService {
    /**
     * PostAdd
     * @param postsRequest postsRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postAddUsingPost(
        postsRequest: PostsRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/add',
            body: postsRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostDelete
     * @param postId post_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postDeleteUsingPost(
        postId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/delete',
            query: {
                'post_id': postId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostModify
     * @param postsRequest postsRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postModifyUsingPost(
        postsRequest: PostsRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/modify',
            body: postsRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostGetPostByProblemId
     * @param pageNum pageNum
     * @param problemId problem_id
     * @param status status
     * @returns BaseResponse_List_PostsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postGetPostByProblemIdUsingPost(
        pageNum?: number,
        problemId?: number,
        status?: number,
    ): CancelablePromise<BaseResponse_List_PostsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/post/answer/problemId',
            query: {
                'pageNum': pageNum,
                'problem_id': problemId,
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
     * PostCommentAdd
     * @param postsCommentRequest postsCommentRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postCommentAddUsingPost(
        postsCommentRequest: PostsCommentRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/post/comment/add',
            body: postsCommentRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostCommentDelete
     * @param commentId comment_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postCommentDeleteUsingPost(
        commentId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/post/comment/delete',
            query: {
                'comment_id': commentId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostCommentAddOrCancel
     * @param commentId comment_id
     * @param postId post_id
     * @param status status
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postCommentAddOrCancelUsingPost(
        commentId?: number,
        postId?: number,
        status?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/post/comment/thumbs',
            query: {
                'comment_id': commentId,
                'post_id': postId,
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
     * PostThumbsStatus
     * @param postId post_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postThumbsStatusUsingPost(
        postId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/post/thumbStatus',
            query: {
                'post_id': postId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostThumbsAddOrCancel
     * @param postId post_id
     * @param status status
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postThumbsAddOrCancelUsingPost(
        postId?: number,
        status?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/post/thumbs',
            query: {
                'post_id': postId,
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
     * ListPostVoByPage
     * @param postsQueryRequest postsQueryRequest
     * @returns BaseResponse_List_PostsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static listPostVoByPageUsingPost(
        postsQueryRequest: PostsQueryRequest,
    ): CancelablePromise<BaseResponse_List_PostsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/search',
            body: postsQueryRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostSearchCommentByPostId
     * @param postId post_id
     * @returns BaseResponse_List_List_PostsCommentVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postSearchCommentByPostIdUsingPost(
        postId?: number,
    ): CancelablePromise<BaseResponse_List_List_PostsCommentVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/search/comment',
            query: {
                'post_id': postId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostSearchByPage
     * @param pageNum pageNum
     * @param uuid uuid
     * @returns BaseResponse_List_PostsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postSearchByPageUsingPost(
        pageNum?: number,
        uuid?: number,
    ): CancelablePromise<BaseResponse_List_PostsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/search/page',
            query: {
                'pageNum': pageNum,
                'uuid': uuid,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostSearchByPostsId
     * @param postId post_id
     * @returns BaseResponse_PostsVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postSearchByPostsIdUsingPost(
        postId?: number,
    ): CancelablePromise<BaseResponse_PostsVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/search/postsId',
            query: {
                'post_id': postId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostTop
     * @param postId post_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postTopUsingPost(
        postId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/top',
            query: {
                'post_id': postId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * PostTopCancel
     * @param postId post_id
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static postTopCancelUsingPost(
        postId?: number,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/posts/top/cancel',
            query: {
                'post_id': postId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
