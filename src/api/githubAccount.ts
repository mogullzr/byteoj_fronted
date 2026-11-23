import { OpenAPI } from "../../generated/core/OpenAPI";
import { request } from "../../generated/core/request";

export const completeGithubAccount = (body: {
  uuid: number;
  email: string;
  password: string;
  confirm_password: string;
  confirmNumber: string;
}) =>
  request<{ code: number; message: string }>(OpenAPI, {
    method: "POST",
    url: "/api/user/modify",
    body,
    mediaType: "application/json",
  });
