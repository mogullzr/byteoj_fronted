/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClusterVo } from './ClusterVo';
import type { OrderItem } from './OrderItem';
export type Page_ClusterVo_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: Array<OrderItem>;
    pages?: number;
    records?: Array<ClusterVo>;
    searchCount?: boolean;
    size?: number;
    total?: number;
};

