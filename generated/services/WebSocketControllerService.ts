/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseResponse_List_MessageVo_ } from '../models/BaseResponse_List_MessageVo_';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebSocketControllerService {
    /**
     * WebSocketGetMessageByRoomId
     * @param pageNum PageNum
     * @param roomId room_id
     * @returns BaseResponse_List_MessageVo_ OK
     * @returns any Created
     * @throws ApiError
     */
    public static webSocketGetMessageByRoomIdUsingPost(
        pageNum?: number,
        roomId?: number,
    ): CancelablePromise<BaseResponse_List_MessageVo_ | any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/webSocket/getAllMessage',
            query: {
                'PageNum': pageNum,
                'room_id': roomId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }
}
