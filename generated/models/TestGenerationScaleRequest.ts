/* generated using openapi-typescript-codegen -- do not edit */
export type TestGenerationScaleRequest = {
    scale: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTREME' | 'CUSTOM';
    count: number;
    constraints: string;
    seed?: number;
};
