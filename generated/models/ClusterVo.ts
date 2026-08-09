/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClusterMemberVo } from './ClusterMemberVo';
export type ClusterEdgeVo = {
    astScore?: number;
    riskLevel?: string;
    score?: number;
    source?: number;
    target?: number;
    tokenScore?: number;
};
export type ClusterVo = {
    avgSimilarity?: number;
    clusterId?: number;
    clusterSize?: number;
    competitionId?: number;
    createdAt?: string;
    members?: Array<ClusterMemberVo>;
    edges?: Array<ClusterEdgeVo>;
    problemIndex?: string;
};
