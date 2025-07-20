/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_boolean_ } from '../models/BaseResponse_boolean_';
import type { BaseResponse_List_RBACRolesVo_ } from '../models/BaseResponse_List_RBACRolesVo_';
import type { BaseResponse_List_RBACUserApiVo_ } from '../models/BaseResponse_List_RBACUserApiVo_';
import type { BaseResponse_List_RBACUserAuthVo_ } from '../models/BaseResponse_List_RBACUserAuthVo_';
import type { BaseResponse_List_RBACUserInfoVo_ } from '../models/BaseResponse_List_RBACUserInfoVo_';
import type { RBACApiRequest } from '../models/RBACApiRequest';
import type { RBACAuthCreateRequest } from '../models/RBACAuthCreateRequest';
import type { RBACAuthUserRequest } from '../models/RBACAuthUserRequest';
import type { RBACInfoSearchRequest } from '../models/RBACInfoSearchRequest';
import type { RBACRoleCreateRequest } from '../models/RBACRoleCreateRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RbacControllerService {
    /**
     * AdminSetApi
     * @param rbacApiRequest rbacApiRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static adminSetApiUsingPost(
        rbacApiRequest: RBACApiRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/RBAC/api/create',
            body: rbacApiRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminGetApi
     * @param rbacInfoSearchRequest rbacInfoSearchRequest
     * @returns BaseResponse_List_RBACUserApiVo_ OK
     * @throws ApiError
     */
    public static adminGetApiUsingGet(
        rbacInfoSearchRequest: RBACInfoSearchRequest,
    ): CancelablePromise<BaseResponse_List_RBACUserApiVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/RBAC/api/get',
            body: rbacInfoSearchRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminAuthUser
     * @param rbacAuthUserRequest rbacAuthUserRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static adminAuthUserUsingPost(
        rbacAuthUserRequest: RBACAuthUserRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/RBAC/auth',
            body: rbacAuthUserRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminSetAuth
     * @param rbacAuthCreateRequest rbacAuthCreateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static adminSetAuthUsingPost(
        rbacAuthCreateRequest: RBACAuthCreateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/RBAC/auth/create',
            body: rbacAuthCreateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminGetAuth
     * @param rbacInfoSearchRequest rbacInfoSearchRequest
     * @returns BaseResponse_List_RBACUserAuthVo_ OK
     * @throws ApiError
     */
    public static adminGetAuthUsingGet(
        rbacInfoSearchRequest: RBACInfoSearchRequest,
    ): CancelablePromise<BaseResponse_List_RBACUserAuthVo_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/RBAC/auth/get',
            body: rbacInfoSearchRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminSetRole
     * @param rbacRoleCreateRequest rbacRoleCreateRequest
     * @returns BaseResponse_boolean_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static adminSetRoleUsingPost(
        rbacRoleCreateRequest: RBACRoleCreateRequest,
    ): CancelablePromise<BaseResponse_boolean_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/RBAC/role/create',
            body: rbacRoleCreateRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminGetRoles
     * @returns BaseResponse_List_RBACRolesVo_ OK
     * @throws ApiError
     */
    public static adminGetRolesUsingGet(): CancelablePromise<BaseResponse_List_RBACRolesVo_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/RBAC/role/get',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
    /**
     * AdminGetUserInfo
     * @param rbacUserInfoSearchRequest rbacUserInfoSearchRequest
     * @returns BaseResponse_List_RBACUserInfoVo_ OK
     * @throws ApiError
     */
    public static adminGetUserInfoUsingGet(
        rbacUserInfoSearchRequest: RBACInfoSearchRequest,
    ): CancelablePromise<BaseResponse_List_RBACUserInfoVo_> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/RBAC/user/info',
            body: rbacUserInfoSearchRequest,
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
