/* Public summary of one of the current exam's top-three distinct users. */
export type ProblemExamTopScoreVo = {
    rank?: number;
    record_id?: number;
    username?: string;
    score?: number;
    total_score?: number;
    submitted_at?: string;
};
