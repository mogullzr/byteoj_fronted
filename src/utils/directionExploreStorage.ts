import {
  ActiveExperience,
  CompletedExperiencePointer,
  DirectionExploreState,
  ExperienceRecord,
} from "@/types/directionExplore";

const STORAGE_KEY = "byteoj-direction-explore-v1";

function emptyState(): DirectionExploreState {
  return {
    version: 1,
    activeExperience: null,
    completedExperience: null,
    records: [],
  };
}

export function loadDirectionExploreState(): DirectionExploreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as DirectionExploreState;
    if (parsed.version !== 1 || !Array.isArray(parsed.records))
      return emptyState();
    return {
      version: 1,
      activeExperience: parsed.activeExperience || null,
      completedExperience: parsed.completedExperience || null,
      records: parsed.records,
    };
  } catch (error) {
    console.warn("方向探索本地记录无法读取，将使用空记录。", error);
    return emptyState();
  }
}

export function saveActiveExperience(
  activeExperience: ActiveExperience | null
): void {
  const state = loadDirectionExploreState();
  persist({
    ...state,
    activeExperience,
    completedExperience: activeExperience ? null : state.completedExperience,
  });
}

export function saveCompletedExperience(
  pointer: CompletedExperiencePointer
): void {
  const state = loadDirectionExploreState();
  persist({ ...state, activeExperience: null, completedExperience: pointer });
}

export function saveExperienceRecord(record: ExperienceRecord): void {
  const state = loadDirectionExploreState();
  const index = state.records.findIndex(
    (item) =>
      item.taskId === record.taskId && item.startedAt === record.startedAt
  );
  if (index >= 0) state.records.splice(index, 1, record);
  else state.records.push(record);
  persist(state);
}

export function updateExperienceRecord(
  taskId: string,
  startedAt: number,
  changes: Partial<ExperienceRecord>
): void {
  const state = loadDirectionExploreState();
  const index = state.records.findIndex(
    (item) => item.taskId === taskId && item.startedAt === startedAt
  );
  if (index < 0) return;
  state.records.splice(index, 1, { ...state.records[index], ...changes });
  persist(state);
}

export function clearDirectionExploreState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function persist(state: DirectionExploreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("方向探索进度无法保存到本地。", error);
  }
}
