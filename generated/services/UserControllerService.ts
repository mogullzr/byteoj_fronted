/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminRegisterRequest } from "../models/AdminRegisterRequest";
import type { BaseResponse_boolean_ } from "../models/BaseResponse_boolean_";
import type { BaseResponse_int_ } from "../models/BaseResponse_int_";
import type { BaseResponse_List_User_ } from "../models/BaseResponse_List_User_";
import type { BaseResponse_List_WebsiteBackgroundPictures_ } from "../models/BaseResponse_List_WebsiteBackgroundPictures_";
import type { BaseResponse_long_ } from "../models/BaseResponse_long_";
import type { BaseResponse_string_ } from "../models/BaseResponse_string_";
import type { BaseResponse_UserVo_ } from "../models/BaseResponse_UserVo_";
import type { UserLoginEmailRequest } from "../models/UserLoginEmailRequest";
import type { UserLoginRequest } from "../models/UserLoginRequest";
import type { UserModifyRequest } from "../models/UserModifyRequest";
import type { UserRegisterRequest } from "../models/UserRegisterRequest";
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class UserControllerService {
  /**
   * bossAdminAddAdmin
   * @param adminRegisterRequest adminRegisterRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static bossAdminAddAdminUsingPost(
    adminRegisterRequest: AdminRegisterRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/BOSS/add",
      body: adminRegisterRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * bossAdminCancelAdmin
   * @param uuid uuid
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static bossAdminCancelAdminUsingPost(
    uuid?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/BOSS/cancel",
      query: {
        uuid: uuid,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * bossAdminGetAdminList
   * @returns BaseResponse_List_User_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static bossAdminGetAdminListUsingPost(): CancelablePromise<
    BaseResponse_List_User_ | any
  > {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/BOSS/get",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * bossAdminSetAdmin
   * @param uuid uuid
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static bossAdminSetAdminUsingPost(
    uuid?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/BOSS/set",
      query: {
        uuid: uuid,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * adminBanUserList
   * @param userList user_list
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static adminBanUserListUsingPost(
    userList: Array<number>
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/admin/ban",
      body: userList,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * adminCancelBanUser
   * @param uuid uuid
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static adminCancelBanUserUsingPost(
    uuid?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/admin/cancel",
      query: {
        uuid: uuid,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * adminGetUserList
   * @param pageNum PageNum
   * @returns BaseResponse_List_User_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static adminGetUserListUsingPost(
    pageNum?: number
  ): CancelablePromise<BaseResponse_List_User_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/admin/get",
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
   * adminGetUserPages
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static adminGetUserPagesUsingPost(): CancelablePromise<
    BaseResponse_long_ | any
  > {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/admin/getPage",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * adminLogin
   * @param userLoginRequest userLoginRequest
   * @returns BaseResponse_UserVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static adminLoginUsingPost(
    userLoginRequest: UserLoginRequest
  ): CancelablePromise<BaseResponse_UserVo_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/admin/login",
      body: userLoginRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userLoginByGithub
   * @param code code
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userLoginByGithubUsingPost(
    code?: string
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/authorize/redirect",
      query: {
        code: code,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * getCurrentUser
   * @returns BaseResponse_UserVo_ OK
   * @throws ApiError
   */
  public static getCurrentUserUsingGet(): CancelablePromise<BaseResponse_UserVo_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/user/current",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userEmailSend
   * @param receiveEmail receiveEmail
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userEmailSendUsingPost(
    receiveEmail?: string
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/email/send",
      query: {
        receiveEmail: receiveEmail,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userSetPassword
   * @param userRegisterRequest userRegisterRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userSetPasswordUsingPost(
    userRegisterRequest: UserRegisterRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/getBack",
      body: userRegisterRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userLogin
   * @param userLoginRequest userLoginRequest
   * @returns BaseResponse_UserVo_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userLoginUsingPost(
    userLoginRequest: UserLoginRequest
  ): CancelablePromise<BaseResponse_UserVo_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/login",
      body: userLoginRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userLoginByEmail
   * @param userLoginEmailRequest userLoginEmailRequest
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userLoginByEmailUsingPost(
    userLoginEmailRequest: UserLoginEmailRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/login/email",
      body: userLoginEmailRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userLogout
   * @returns BaseResponse_int_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userLogoutUsingPost(): CancelablePromise<
    BaseResponse_int_ | any
  > {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/logout",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userModify
   * @param user user
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userModifyUsingPost(
    user: UserModifyRequest
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/modify",
      body: user,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userGetPicture
   * @returns BaseResponse_List_WebsiteBackgroundPictures_ OK
   * @throws ApiError
   */
  public static userGetPictureUsingGet(): CancelablePromise<BaseResponse_List_WebsiteBackgroundPictures_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/user/picture/get",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userDeleteBackground
   * @param id id
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userDeleteBackgroundUsingPost(
    id?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/picture/user/delete",
      query: {
        id: id,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userGetPictureByUser
   * @returns BaseResponse_string_ OK
   * @throws ApiError
   */
  public static userGetPictureByUserUsingGet(): CancelablePromise<BaseResponse_string_> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/user/picture/user/get/",
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userSetPictureBackground
   * @param pictureAddress picture_address
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userSetPictureBackgroundUsingPost(
    pictureAddress?: string
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/picture/user/set",
      query: {
        picture_address: pictureAddress,
      },
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userRegister
   * @param userRegisterRequest userRegisterRequest
   * @returns BaseResponse_long_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userRegisterUsingPost(
    userRegisterRequest: UserRegisterRequest
  ): CancelablePromise<BaseResponse_long_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/register",
      body: userRegisterRequest,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }

  /**
   * userUploadPicture
   * @param base64Image base64Image
   * @param status status
   * @returns BaseResponse_boolean_ OK
   * @returns any Created
   * @throws ApiError
   */
  public static userUploadPictureUsingPost(
    base64Image: string,
    status?: number
  ): CancelablePromise<BaseResponse_boolean_ | any> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/user/upload",
      query: {
        status: status,
      },
      body: base64Image,
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
        404: `Not Found`,
      },
    });
  }
}