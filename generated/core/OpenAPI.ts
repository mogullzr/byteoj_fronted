import type { ApiRequestOptions } from "./ApiRequestOptions";
import { request as originalRequest } from "./request"; // 确保导入原始 request

type Resolver<T> = (options: ApiRequestOptions) => Promise<T>;
type Headers = Record<string, string>;

export type OpenAPIConfig = {
  BASE: string;
  VERSION: string;
  WITH_CREDENTIALS: boolean;
  CREDENTIALS: "include" | "omit" | "same-origin";
  TOKEN?: string | Resolver<string>;
  USERNAME?: string | Resolver<string>;
  PASSWORD?: string | Resolver<string>;
  HEADERS?: Headers | Resolver<Headers>;
  ENCODE_PATH?: (path: string) => string;
  request?: (options: ApiRequestOptions) => Promise<any>; // 新增 request 方法
};

// 自定义请求方法（添加代理逻辑）
const requestWithProxy = async (options: ApiRequestOptions) => {
  return originalRequest(options); // 调用原始请求
};

export const OpenAPI: OpenAPIConfig = {
  BASE: "", // 开发环境用空 BASE
  VERSION: "1.0",
  WITH_CREDENTIALS: true,
  CREDENTIALS: "include",
  TOKEN: undefined,
  USERNAME: undefined,
  PASSWORD: undefined,
  HEADERS: undefined,
  ENCODE_PATH: undefined,
};

// 赋值 request 方法（类型安全）
OpenAPI.request = requestWithProxy;