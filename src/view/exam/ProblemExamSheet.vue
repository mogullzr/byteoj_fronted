<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
    <div
        v-if="showAnswerPreview"
        class="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-[2px] sm:p-6"
        @click.self="showAnswerPreview = false"
    >
      <section class="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="全部答案速览">
        <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <div class="text-lg font-bold text-slate-900">答案速览</div>
            <p class="mt-1 text-sm text-slate-500">只列答案，不显示题目内容与解析</p>
          </div>
          <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              aria-label="关闭答案速览"
              @click="showAnswerPreview = false"
          >
            关闭
          </button>
        </header>

        <div class="overflow-y-auto p-4 sm:p-6">
          <div class="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>共 {{ questions.length }} 题</span>
            <span>{{ answerPreviewCount }} 题有标准答案</span>
          </div>
          <div class="space-y-2">
            <div
                v-for="(question, index) in questions"
                :key="question.problem_id || index"
                class="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 sm:gap-4 sm:px-4"
            >
              <div class="flex min-w-[72px] flex-col gap-1">
                <span class="text-sm font-bold tabular-nums text-slate-800">第 {{ index + 1 }} 题</span>
                <span class="text-[11px] text-slate-500">{{ getQuestionTypeLabel(question) }}</span>
              </div>
              <div class="min-w-0 border-l border-slate-200 pl-3 text-sm leading-6 text-slate-800 sm:pl-4">
                <Markdown v-if="getAnswerPreview(question)" :generate-data="getAnswerPreview(question)" />
                <span v-else class="text-slate-400">暂无标准答案</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="mx-auto max-w-[1600px]">
      <div class="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0 flex-1 space-y-3">
          <div class="inline-flex w-fit items-center rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {{ isPublicTopSheet ? '公开前三答卷' : '答题卡详情' }}
          </div>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="text-xs font-medium text-slate-500">总览</div>
              <Markdown :generate-data="'**答题卡概览**'" class="mt-1" />
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="text-xs font-medium text-slate-500">题量</div>
              <Markdown :generate-data="String(questions.length) + ' 题'" class="mt-1 font-semibold text-slate-800" />
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div class="text-xs font-medium text-slate-500">已作答</div>
              <Markdown :generate-data="String(answeredCount) + ' 题'" class="mt-1 font-semibold text-slate-800" />
            </div>
            <div class="rounded-xl border border-slate-900 bg-slate-900 px-4 py-4 text-white shadow-sm">
              <div class="text-xs font-medium text-slate-300">得分 / 考试总分</div>
              <Markdown
                  :generate-data="String(totalAwardedScore) + ' / ' + String(totalExamScore) + ' 分'"
                  class="mt-1 font-semibold text-white"
              />
            </div>
          </div>
        </div>
        <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <button
              v-if="questions.length"
              type="button"
              class="w-full rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-2.5 font-semibold text-cyan-800 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-100 sm:w-auto"
              @click="showAnswerPreview = true"
          >
            答案速览
          </button>
          <button
              type="button"
              class="w-full rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
              @click="router.back()"
          >
            返回
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-24 text-center">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600"></div>
        <Markdown :generate-data="'加载答题卡中...'" />
      </div>

      <div v-else-if="questionLoadError" class="rounded-2xl border border-rose-200 bg-white py-16 text-center shadow-sm">
        <p class="font-semibold text-rose-700">{{ questionLoadError }}</p>
        <button
            type="button"
            class="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            @click="fetchSheet"
        >重新加载</button>
      </div>

      <div v-else-if="questions.length === 0" class="rounded-2xl border border-slate-200 bg-white py-20 text-center">
        <Markdown :generate-data="'**未找到试题信息**'" />
      </div>

      <div v-else class="space-y-8">
        <div v-if="sheetLoading" class="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900" role="status">
          题目已加载，正在读取作答记录和标注…
        </div>
        <div v-else-if="sheetLoadError" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          题目内容已加载，但作答记录和标注暂时无法显示：{{ sheetLoadError }}
          <button type="button" class="ml-2 font-semibold underline" @click="fetchSheet">重试</button>
        </div>

        <section
            v-if="!isPublicTopSheet"
            class="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm sm:p-8"
        >
          <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="text-lg font-bold text-cyan-950">我的整卷复习建议</div>
              <p class="mt-1 text-sm leading-6 text-cyan-900/75">结合你的作答、得分和 AI 首次判卷意见定位具体问题，优先复盘概念题；大题只总结有依据的概念性失分。内容先作为草稿，可自行修改并保存。</p>
            </div>
            <div class="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                  v-if="!reviewGuideEditing"
                  type="button"
                  class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  @click="startReviewGuideEdit"
              >
                {{ reviewGuideDraft.trim() ? '编辑建议' : '手动填写' }}
              </button>
              <button
                  type="button"
                  class="rounded-xl border border-cyan-300 bg-white px-4 py-2.5 text-sm font-semibold text-cyan-900 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="generatingReviewGuide || questions.length === 0"
                  @click="generateReviewGuide"
              >
                {{ generatingReviewGuide ? '生成中…' : reviewGuideDraft.trim() ? '重新生成' : 'AI 生成建议' }}
              </button>
            </div>
          </div>
          <div v-if="!reviewGuideEditing" class="min-h-40 rounded-xl border border-cyan-100 bg-white px-5 py-4 text-slate-800 shadow-sm">
            <template v-if="standardReviewSections.length || reviewGuideDraft.trim()">
              <h1 v-if="standardReviewSections.length" class="mb-4 text-2xl font-bold text-slate-900">标注集合</h1>
              <section v-for="section in standardReviewSections" :key="section.key" class="mb-6 last:mb-0">
                <h2 class="mb-2 border-b border-slate-100 pb-2 text-xl font-semibold text-slate-800">题{{ section.questionNumber }}</h2>
                <Markdown :generate-data="section.annotation" />
              </section>
              <section v-if="reviewGuideDraft.trim()" class="mt-6 border-t border-slate-200 pt-5">
                <h1 class="mb-3 text-2xl font-bold text-slate-900">综合AI建议</h1>
                <Markdown :generate-data="reviewGuideDraft" />
              </section>
            </template>
            <span v-else class="text-sm text-slate-500">还没有题目标注或整卷复习建议。可以先让 AI 生成，也可以点击“手动填写”。</span>
          </div>
          <div v-else class="grid gap-4 xl:grid-cols-2">
            <label class="block">
              <span class="mb-2 block text-xs font-semibold text-slate-600">编辑建议（支持 Markdown）</span>
              <textarea
                  v-model="reviewGuideDraft"
                  maxlength="12000"
                  rows="12"
                  class="w-full resize-y rounded-xl border border-cyan-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="AI 会根据你的作答和首次判卷意见生成针对性复盘，你也可以自行修改。"
                  @input="reviewGuideSaved = false"
              ></textarea>
              <span class="mt-1 block text-right text-xs text-slate-500">{{ reviewGuideDraft.length }} / 12000</span>
            </label>
            <div>
              <div class="mb-2 text-xs font-semibold text-slate-600">实时预览</div>
              <div class="min-h-64 max-h-[24rem] overflow-y-auto rounded-xl border border-cyan-100 bg-white px-5 py-4 text-slate-800 shadow-sm">
                <Markdown v-if="reviewGuideDraft.trim()" :generate-data="reviewGuideDraft" />
                <span v-else class="text-sm text-slate-400">填写内容后可预览</span>
              </div>
            </div>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span v-if="reviewGuideSaved" class="text-sm font-medium text-emerald-700">已保存到你的答题卡</span>
            <span v-else class="text-sm text-slate-500">当前建议尚未保存。</span>
            <div class="flex gap-2">
              <button
                  v-if="reviewGuideEditing"
                  type="button"
                  class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  @click="cancelReviewGuideEdit"
              >
                取消
              </button>
              <button
                  v-if="reviewGuideEditing || (!reviewGuideSaved && reviewGuideDraft.trim())"
                  type="button"
                  class="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="savingReviewGuide"
                  @click="saveReviewGuide"
              >
                {{ savingReviewGuide ? '保存中…' : '保存复习建议' }}
              </button>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold text-slate-900">筛选答题卡</div>
              <div class="mt-1 text-xs text-slate-500">
                当前显示 {{ filteredQuestions.length }} / {{ questions.length }} 题
              </div>
            </div>
            <button
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                @click="resetFilters"
            >
              重置筛选
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <div class="mb-2 text-xs font-semibold text-slate-500">按题型筛选</div>
              <div class="flex flex-wrap gap-2">
                <button
                    v-for="item in questionTypeFilters"
                    :key="item.value"
                    class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                    :class="typeFilter === item.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'"
                    @click="typeFilter = item.value"
                >
                  {{ item.label }}
                  <span class="ml-1 text-xs opacity-70">{{ getTypeFilterCount(item.value) }}</span>
                </button>
              </div>
            </div>

            <div>
              <div class="mb-2 text-xs font-semibold text-slate-500">按结果筛选</div>
              <div class="flex flex-wrap gap-2">
                <button
                    v-for="item in resultFilters"
                    :key="item.value"
                    class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
                    :class="resultFilter === item.value ? getActiveResultFilterClass(item.value) : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'"
                    @click="resultFilter = item.value"
                >
                  {{ item.label }}
                  <span class="ml-1 text-xs opacity-70">{{ getResultFilterCount(item.value) }}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="filteredQuestions.length === 0" class="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
          <Markdown :generate-data="'**当前筛选条件下没有题目**'" />
        </section>

        <section
            v-for="(question, index) in filteredQuestions"
            :key="question.problem_id || index"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div :class="['h-1', accentBarClass(index)]"></div>

          <div class="border-b border-slate-100 px-6 py-6 sm:px-7">
            <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div class="space-y-3 xl:max-w-[calc(100%-380px)]">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    第 {{ index + 1 }} 题
                  </span>
                  <span class="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {{ getQuestionTypeLabel(question) }}
                  </span>
                  <span
                      v-if="getNeedsManualReview(question)"
                      class="rounded-md bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                  >
                    需要人工复查
                  </span>
                  <span
                      v-if="isQuestionWrong(question)"
                      class="rounded-md bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200"
                  >
                    失分
                  </span>
                  <span
                      v-if="isAlgorithmAccepted(question)"
                      class="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                  >
                    算法通过
                  </span>
                </div>
                <Markdown
                    :generate-data="question.problem_name || '未命名题目'"
                    class="text-2xl font-bold text-slate-900"
                />
              </div>

              <div class="grid min-w-[280px] grid-cols-2 gap-3">
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div class="text-xs text-slate-500">题目分值</div>
                  <Markdown
                      :generate-data="String(question.score ?? 0) + ' 分'"
                      class="mt-1 font-semibold text-slate-800"
                  />
                </div>
                <div
                    class="rounded-xl border p-4"
                    :class="getScoreCardClass(question)"
                >
                  <div class="text-xs text-slate-500">实际得分</div>
                  <Markdown
                      :generate-data="String(getSheet(question)?.score ?? 0) + ' 分'"
                      :class="[
                      'mt-1 font-semibold',
                      isQuestionWrong(question) ? 'text-rose-700' : isAlgorithmAccepted(question) ? 'text-emerald-700' : 'text-slate-800'
                    ]"
                  />
                  <div
                      v-if="isAlgorithmAccepted(question)"
                      class="mt-2 inline-flex rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                  >
                    Accepted
                  </div>
                  <div
                      v-if="isQuestionWrong(question)"
                      class="mt-2 inline-flex rounded-md bg-rose-600 px-2 py-0.5 text-xs font-medium text-white"
                  >
                    未满分
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid gap-6 px-6 py-6 sm:px-7 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div class="space-y-6">
              <div v-if="question.description" class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-400 pl-3 text-sm font-semibold text-slate-800">题目描述</div>
                <Markdown :generate-data="question.description" />
              </div>

              <div v-if="getOptions(question).length" class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-400 pl-3 text-sm font-semibold text-slate-800">选项</div>
                <div class="grid gap-3 md:grid-cols-2">
                  <div
                      v-for="(option, optionIndex) in getOptions(question)"
                      :key="optionIndex"
                      class="rounded-xl border p-3"
                      :class="getChoiceOptionClass(question, getLetter(optionIndex))"
                  >
                    <div class="mb-2 flex items-center justify-between gap-3">
                      <div class="text-xs font-semibold text-slate-500">{{ getLetter(optionIndex) }}</div>
                      <div class="flex flex-wrap justify-end gap-2">
                        <span
                            v-if="isCorrectChoice(question, getLetter(optionIndex))"
                            class="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                        >
                          正确答案
                        </span>
                        <span
                            v-if="isSelected(question, getLetter(optionIndex))"
                            :class="[
                            'rounded-md px-2 py-0.5 text-xs font-medium text-white',
                            isCorrectChoice(question, getLetter(optionIndex)) ? 'bg-slate-900' : 'bg-rose-600'
                          ]"
                        >
                          {{ isCorrectChoice(question, getLetter(optionIndex)) ? '学生选对' : '学生误选' }}
                        </span>
                      </div>
                    </div>
                    <Markdown :generate-data="option" />
                  </div>
                </div>
              </div>

              <div class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-700 pl-3 text-sm font-semibold text-slate-900">学生作答</div>
                <template v-if="isChoiceQuestion(question)">
                  <div v-if="getSelectedOptionDetails(question).length" class="space-y-3">
                    <div
                        v-for="selected in getSelectedOptionDetails(question)"
                        :key="selected.letter"
                        class="rounded-xl border p-4"
                        :class="isCorrectChoice(question, selected.letter) ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'"
                    >
                      <div
                          class="mb-2 inline-flex rounded-md px-2 py-0.5 text-xs font-medium text-white"
                          :class="isCorrectChoice(question, selected.letter) ? 'bg-emerald-600' : 'bg-rose-600'"
                      >
                        {{ selected.letter }} · {{ isCorrectChoice(question, selected.letter) ? '选对' : '选错' }}
                      </div>
                      <Markdown :generate-data="selected.content" />
                    </div>
                  </div>
                  <Markdown v-else :generate-data="'*未作答*'" />
                </template>
                <template v-else-if="getSheet(question)?.answer">
                  <img
                      v-if="isImageUrl(getSheet(question)?.answer)"
                      :src="getSheet(question)?.answer"
                      alt="学生作答图片"
                      class="max-h-[580px] w-auto max-w-full rounded-xl border border-slate-200 bg-white object-contain"
                  />
                  <div v-else-if="isAlgorithmQuestion(question)" class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div
                        v-if="isAlgorithmAccepted(question)"
                        class="mb-3 inline-flex rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white"
                    >
                      算法通过 · Accepted
                    </div>
                    <Markdown
                        :generate-data="'```\\n' + formatAnswer(getSheet(question)?.answer) + '\\n```'"
                    />
                  </div>
                  <Markdown
                      v-else
                      :generate-data="formatAnswer(getSheet(question)?.answer)"
                      class="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  />
                </template>
                <Markdown v-else :generate-data="'*未作答*'" />
              </div>

              <div
                  v-if="getStandardAnswerMarkdown(question)"
                  class="rounded-xl border bg-white p-5"
                  :class="isQuestionWrong(question) ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'"
              >
                <div
                    class="mb-3 border-l-4 pl-3 text-sm font-semibold"
                    :class="isQuestionWrong(question) ? 'border-emerald-600 text-emerald-800' : 'border-slate-700 text-slate-900'"
                >
                  标准答案
                </div>
                <Markdown
                    :generate-data="getStandardAnswerMarkdown(question)"
                    class="rounded-xl border p-4"
                    :class="isQuestionWrong(question) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'"
                />
              </div>

              <div v-if="question.analysis" class="rounded-xl border border-slate-200 bg-white p-5">
                <div class="mb-3 border-l-4 border-slate-400 pl-3 text-sm font-semibold text-slate-800">题目解析</div>
                <Markdown :generate-data="question.analysis" />
              </div>

            </div>

            <div class="space-y-6">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div class="mb-3 border-l-4 border-slate-700 pl-3 text-sm font-semibold text-slate-900">判题速览</div>
                <Markdown :generate-data="buildQuickSummaryMarkdown(question)" />
              </div>
            </div>
          </div>

          <div v-if="!isPublicTopSheet" class="mx-6 mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:mx-7 sm:p-6">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="border-l-4 border-amber-500 pl-3 text-sm font-semibold text-amber-900">个人复习标注</div>
                <p class="mt-1 pl-3 text-xs text-amber-800">可用 Markdown 记录易错点、思路提醒或下次复习重点</p>
              </div>
              <div class="flex items-center gap-3">
                <span
                    v-if="!annotationEditing[question.problem_id] && annotationSaveStates[question.problem_id] === 'saved'"
                    class="text-xs font-medium text-emerald-700"
                >已保存</span>
                <span
                    v-if="annotationSaveStates[question.problem_id] === 'error'"
                    class="text-xs font-medium text-rose-700"
                >保存失败，请重试</span>
                <button
                    v-if="!annotationEditing[question.problem_id]"
                    type="button"
                    class="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                    @click="startAnnotationEdit(question)"
                >
                  {{ getSavedAnnotation(question) ? '编辑标注' : '添加标注' }}
                </button>
              </div>
            </div>

            <div v-if="!annotationEditing[question.problem_id]">
              <div v-if="getSavedAnnotation(question)" class="rounded-xl border border-amber-100 bg-white px-5 py-4 text-slate-800 shadow-sm">
                <Markdown :generate-data="getSavedAnnotation(question)" />
              </div>
              <div v-else class="rounded-xl border border-dashed border-amber-300 bg-white/70 px-5 py-6 text-center text-sm text-slate-500">
                还没有复习标注，点击“添加标注”记录这道题的复习重点。
              </div>
            </div>

            <div v-else class="space-y-4">
              <div class="grid gap-4 lg:grid-cols-2">
                <label class="block">
                  <span class="mb-2 block text-xs font-semibold text-slate-600">Markdown 编辑</span>
                  <textarea
                      :value="annotationDrafts[question.problem_id] ?? ''"
                      maxlength="5000"
                      rows="8"
                      class="w-full resize-y rounded-xl border border-amber-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      placeholder="例如：# 易错点；- 容易漏掉定义域条件；**复习提醒：** 先检查边界情况。"
                      @input="updateAnnotationDraft(question.problem_id, $event)"
                  ></textarea>
                </label>
                <div>
                  <div class="mb-2 text-xs font-semibold text-slate-600">实时预览</div>
                  <div class="min-h-[12rem] rounded-xl border border-amber-100 bg-white px-5 py-4 text-slate-800 shadow-sm">
                    <Markdown :generate-data="annotationDrafts[question.problem_id] || '*输入内容后将在这里实时预览*'" />
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="text-xs text-slate-500">{{ (annotationDrafts[question.problem_id] ?? '').length }} / 5000</span>
                <div class="flex gap-2">
                  <button
                      type="button"
                      class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="annotationSaveStates[question.problem_id] === 'saving'"
                      @click="cancelAnnotationEdit(question)"
                  >取消</button>
                  <button
                      type="button"
                      class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="annotationSaveStates[question.problem_id] === 'saving'"
                      @click="saveAnnotation(question)"
                  >
                    {{ annotationSaveStates[question.problem_id] === 'saving' ? '保存中…' : '保存标注' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 px-6 py-6 sm:px-7">
            <details class="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <summary class="cursor-pointer text-sm font-semibold text-slate-700">展开更多信息</summary>

              <div class="mt-5 space-y-4">
                <div v-if="getStructuredResult(question)" class="space-y-4">
                  <div class="grid gap-4 xl:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">判分总结</div>
                      <Markdown :generate-data="getStructuredResult(question)?.summary || ''" />
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">修改建议</div>
                      <Markdown :generate-data="getStructuredResult(question)?.advice || ''" />
                    </div>
                  </div>

                  <div class="grid gap-4 xl:grid-cols-2">
                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">识别作答与可接受答案</div>
                      <Markdown :generate-data="buildAnswerMarkdown(question)" />
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-5">
                      <div class="mb-2 text-sm font-semibold text-slate-800">错误点与评分细则</div>
                      <Markdown :generate-data="buildMistakeRubricMarkdown(question)" />
                    </div>
                  </div>

                </div>

                <details
                    v-if="getSheet(question)?.ai_advise"
                    class="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <summary class="cursor-pointer text-sm font-semibold text-slate-700">查看原始判题信息</summary>
                  <Markdown
                      :generate-data="getSheet(question)?.ai_advise || ''"
                      class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  />
                </details>
              </div>
            </details>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Markdown from '@/view/Markdown/MarkdownView.vue'
import { useMessageBox } from '@/view/components/alert/useMessageBox'
import { ProblemsControllerService } from '../../../generated/services/ProblemsControllerService'
import type { ProblemExamSheetVo } from '../../../generated/models/ProblemExamSheetVo'
import type { ProblemMath408BankVo } from '../../../generated/models/ProblemMath408BankVo'

type GradingMistake = {
  type?: string
  description?: string
  severity?: string
  related_rubric_item_id?: string
}

type GradingRubric = {
  id?: string
  name?: string
  reason?: string
  evidence?: string
  confidence?: number
  max_score?: number
  awarded_score?: number
}

type StructuredGradingResult = {
  confidence?: number
  mistakes?: GradingMistake[]
  summary?: string
  advice?: string
  question_type?: string
  total_score?: number
  awarded_score?: number
  score_rate?: number
  is_correct?: boolean
  is_partially_correct?: boolean
  needs_manual_review?: boolean
  grading_mode?: string
  accepted_answers?: string[]
  student_normalized_answer?: string
  rubric_used?: GradingRubric[]
}

type QuestionTypeFilter = 'all' | 'single' | 'multiple' | 'fill' | 'short' | 'algorithm'
type ResultFilter = 'all' | 'correct' | 'wrong' | 'unanswered'

const route = useRoute()
const router = useRouter()
const { error, success } = useMessageBox()

const loading = ref(false)
const questionLoadError = ref('')
const sheetLoading = ref(false)
const sheetLoadError = ref('')
const showAnswerPreview = ref(false)
const questions = ref<ProblemMath408BankVo[]>([])
const sheets = ref<ProblemExamSheetVo[]>([])
const reviewGuideDraft = ref('')
const reviewGuideEditing = ref(false)
const reviewGuideEditBaseline = ref('')
const reviewGuideEditSavedBaseline = ref(false)
const generatingReviewGuide = ref(false)
const savingReviewGuide = ref(false)
const reviewGuideSaved = ref(false)
const annotationDrafts = ref<Record<number, string>>({})
const annotationEditing = ref<Record<number, boolean>>({})
const annotationSaveStates = ref<Record<number, 'saving' | 'saved' | 'error'>>({})
const typeFilter = ref<QuestionTypeFilter>('all')
const resultFilter = ref<ResultFilter>('all')

const questionTypeFilters: Array<{ label: string; value: QuestionTypeFilter }> = [
  { label: '全部题型', value: 'all' },
  { label: '单选题', value: 'single' },
  { label: '多选题', value: 'multiple' },
  { label: '填空题', value: 'fill' },
  { label: '简答题', value: 'short' },
  { label: '算法题', value: 'algorithm' },
]

const resultFilters: Array<{ label: string; value: ResultFilter }> = [
  { label: '全部结果', value: 'all' },
  { label: '正确', value: 'correct' },
  { label: '错误', value: 'wrong' },
  { label: '未作答', value: 'unanswered' },
]

const examId = Number(route.query.exam_id)
const recordId = Number(route.query.recordId)
const isPublicTopSheet = route.query.publicTop === '1'

const sheetMap = computed(() => {
  const map = new Map<number, ProblemExamSheetVo>()
  sheets.value.forEach((sheet) => {
    if (sheet.problem_id) {
      map.set(sheet.problem_id, sheet)
    }
  })
  return map
})

const structuredResultMap = computed(() => {
  const map = new Map<number, StructuredGradingResult>()
  sheets.value.forEach((sheet) => {
    if (!sheet.problem_id) return
    const result = parseStructuredResult(sheet.ai_advise)
    if (result) {
      map.set(sheet.problem_id, result)
    }
  })
  return map
})

const answeredCount = computed(() => {
  return questions.value.filter((question) => Boolean(getSheet(question)?.answer)).length
})

const totalAwardedScore = computed(() => {
  return sheets.value.reduce((sum, sheet) => sum + (sheet.score || 0), 0)
})

const totalExamScore = computed(() => {
  return questions.value.reduce((sum, question) => sum + (question.score || 0), 0)
})

const answerPreviewCount = computed(() => {
  return questions.value.filter((question) => Boolean(getAnswerPreview(question))).length
})

const filteredQuestions = computed(() => {
  return questions.value.filter((question) => {
    const typeMatched = typeFilter.value === 'all' || getQuestionTypeKey(question) === typeFilter.value
    if (!typeMatched) return false

    if (resultFilter.value === 'all') return true
    if (resultFilter.value === 'correct') return isQuestionCorrect(question)
    if (resultFilter.value === 'wrong') return isQuestionWrong(question)
    if (resultFilter.value === 'unanswered') return !hasAnswered(question)
    return true
  })
})

const filteredAnsweredCount = computed(() => {
  return filteredQuestions.value.filter((question) => hasAnswered(question)).length
})

const filteredAwardedScore = computed(() => {
  return filteredQuestions.value.reduce((sum, question) => sum + (getSheet(question)?.score || 0), 0)
})

const filteredExamScore = computed(() => {
  return filteredQuestions.value.reduce((sum, question) => sum + (question.score || 0), 0)
})

onMounted(() => {
  void fetchSheet()
})

const fetchSheet = async () => {
  if (!Number.isSafeInteger(examId) || examId <= 0 || !Number.isSafeInteger(recordId) || recordId <= 0) {
    loading.value = false
    questionLoadError.value = '缺少有效的考试ID或答卷ID参数'
    error(questionLoadError.value)
    return
  }

  loading.value = true
  questionLoadError.value = ''
  questions.value = []
  sheets.value = []
  sheetLoading.value = true
  sheetLoadError.value = ''

  const loadQuestions = async () => {
    try {
      const res = await ProblemsControllerService.problemExamSheetQuestionDetailsUsingGet(examId, recordId)
      if (res.code !== 0 || !Array.isArray(res.data)) {
        throw new Error(res.message || '获取考试题目失败')
      }
      questions.value = res.data
    } catch (err) {
      console.error('获取答题卡题目失败', err)
      questionLoadError.value = err instanceof Error ? err.message : '获取考试题目失败，请稍后重试'
      error(questionLoadError.value)
    } finally {
      loading.value = false
    }
  }

  const loadAnswerSheet = async () => {
    try {
      const res = isPublicTopSheet
        ? await ProblemsControllerService.problemExamTopScoreSheetUsingGet(examId, recordId)
        : await ProblemsControllerService.problemExamSheetUsingGet(recordId)
      if (res.code !== 0 || !Array.isArray(res.data)) {
        throw new Error(res.message || '获取答题记录失败')
      }
      sheets.value = res.data
      annotationDrafts.value = Object.fromEntries(
          questions.value
              .filter((question) => question.problem_id)
              .map((question) => [question.problem_id as number, sheetMap.value.get(question.problem_id as number)?.annotation || '']),
      )
    } catch (err) {
      console.error('获取答题记录失败', err)
      sheetLoadError.value = err instanceof Error ? err.message : '获取答题记录失败，请稍后重试'
      error(sheetLoadError.value)
    } finally {
      sheetLoading.value = false
    }
  }

  const loadReviewGuide = async () => {
    if (isPublicTopSheet) return
    try {
      const res = await ProblemsControllerService.problemExamReviewGuideUsingGet(recordId)
      if (res.code === 0) {
        reviewGuideDraft.value = res.data || ''
        reviewGuideSaved.value = Boolean(res.data)
        reviewGuideEditing.value = false
        reviewGuideEditBaseline.value = reviewGuideDraft.value
        reviewGuideEditSavedBaseline.value = reviewGuideSaved.value
      }
    } catch (err) {
      // The saved review guide is optional and must not prevent the answer sheet from rendering.
      console.warn('获取整卷复习建议失败', err)
    }
  }

  void loadReviewGuide()
  await Promise.all([loadQuestions(), loadAnswerSheet()])
}

const startReviewGuideEdit = () => {
  reviewGuideEditBaseline.value = reviewGuideDraft.value
  reviewGuideEditSavedBaseline.value = reviewGuideSaved.value
  reviewGuideEditing.value = true
}

const cancelReviewGuideEdit = () => {
  reviewGuideDraft.value = reviewGuideEditBaseline.value
  reviewGuideSaved.value = reviewGuideEditSavedBaseline.value
  reviewGuideEditing.value = false
}

const generateReviewGuide = async () => {
  if (!recordId || isPublicTopSheet) return
  if (reviewGuideDraft.value.trim() && !window.confirm('重新生成会替换当前编辑内容，确定继续吗？')) return

  generatingReviewGuide.value = true
  try {
    const res = await ProblemsControllerService.generateExamReviewGuideUsingPost({ record_id: recordId })
    if (res.code === 0 && res.data) {
      reviewGuideDraft.value = res.data
      reviewGuideSaved.value = false
      reviewGuideEditing.value = false
      success('已生成复习建议，请核对后保存')
    } else {
      error(res.message || 'AI 生成复习建议失败')
    }
  } catch (err) {
    console.error(err)
    error('AI 生成复习建议失败，请稍后重试')
  } finally {
    generatingReviewGuide.value = false
  }
}

const saveReviewGuide = async () => {
  if (!recordId || isPublicTopSheet) return
  savingReviewGuide.value = true
  try {
    const res = await ProblemsControllerService.problemExamReviewGuideSaveUsingPost({
      record_id: recordId,
      review_guide: reviewGuideDraft.value,
    })
    if (res.code === 0 && res.data) {
      reviewGuideSaved.value = true
      reviewGuideEditing.value = false
      reviewGuideEditBaseline.value = reviewGuideDraft.value
      reviewGuideEditSavedBaseline.value = true
      success('整卷复习建议已保存')
    } else {
      error(res.message || '保存复习建议失败')
    }
  } catch (err) {
    console.error(err)
    error('保存复习建议失败，请稍后重试')
  } finally {
    savingReviewGuide.value = false
  }
}

const updateAnnotationDraft = (problemId: number | undefined, event: Event) => {
  if (!problemId) return
  annotationDrafts.value[problemId] = (event.target as HTMLTextAreaElement).value
  delete annotationSaveStates.value[problemId]
}

const getSavedAnnotation = (question: ProblemMath408BankVo) => {
  return getSheet(question)?.annotation || ''
}

const startAnnotationEdit = (question: ProblemMath408BankVo) => {
  const problemId = question.problem_id
  if (!problemId) return
  annotationDrafts.value[problemId] = getSavedAnnotation(question)
  annotationEditing.value[problemId] = true
}

const cancelAnnotationEdit = (question: ProblemMath408BankVo) => {
  const problemId = question.problem_id
  if (!problemId) return
  annotationDrafts.value[problemId] = getSavedAnnotation(question)
  annotationEditing.value[problemId] = false
  delete annotationSaveStates.value[problemId]
}

const saveAnnotation = async (question: ProblemMath408BankVo) => {
  const problemId = question.problem_id
  if (!problemId || !recordId) return
  const annotation = annotationDrafts.value[problemId] ?? ''
  annotationSaveStates.value[problemId] = 'saving'
  try {
    const res = await ProblemsControllerService.problemExamAnnotationSaveUsingPost({
      record_id: recordId,
      problem_id: problemId,
      annotation,
    })
    if (res.code === 0) {
      const existing = sheets.value.find((sheet) => sheet.problem_id === problemId)
      if (existing) existing.annotation = annotation
      else sheets.value.push({ problem_id: problemId, annotation })
      annotationSaveStates.value[problemId] = 'saved'
      annotationEditing.value[problemId] = false
      success('复习标注已保存')
    } else {
      annotationSaveStates.value[problemId] = 'error'
      error(res.message || '保存标注失败')
    }
  } catch (err) {
    annotationSaveStates.value[problemId] = 'error'
    error('保存标注失败，请稍后重试')
  }
}

const getSheet = (question: ProblemMath408BankVo) => {
  if (!question.problem_id) return undefined
  return sheetMap.value.get(question.problem_id)
}

const standardReviewSections = computed(() => questions.value
    .map((question, index) => {
      const annotation = getSheet(question)?.annotation?.trim()
      return annotation
        ? { key: `${question.problem_id || index}-${index}`, questionNumber: index + 1, annotation }
        : null
    })
    .filter((section): section is { key: string; questionNumber: number; annotation: string } => section !== null))

const getStructuredResult = (question: ProblemMath408BankVo) => {
  if (!question.problem_id) return undefined
  return structuredResultMap.value.get(question.problem_id)
}

const getNeedsManualReview = (question: ProblemMath408BankVo) => {
  const sheet = getSheet(question)
  const result = getStructuredResult(question)
  return sheet?.person === true || result?.needs_manual_review === true
}

const hasAnswered = (question: ProblemMath408BankVo) => {
  return Boolean(getSheet(question)?.answer)
}

const getMaxScore = (question: ProblemMath408BankVo) => {
  return question.score || getStructuredResult(question)?.total_score || 0
}

const getQuestionTypeKey = (question: ProblemMath408BankVo): QuestionTypeFilter => {
  if (isAlgorithmQuestion(question)) return 'algorithm'
  if (question.option_type === 1) return 'single'
  if (question.option_type === 2) return 'multiple'
  if (question.option_type === 3) return 'fill'
  return 'short'
}

const resetFilters = () => {
  typeFilter.value = 'all'
  resultFilter.value = 'all'
}

const getTypeFilterCount = (value: QuestionTypeFilter) => {
  return questions.value.filter((question) => value === 'all' || getQuestionTypeKey(question) === value).length
}

const getResultFilterCount = (value: ResultFilter) => {
  return questions.value.filter((question) => {
    if (value === 'all') return true
    if (value === 'correct') return isQuestionCorrect(question)
    if (value === 'wrong') return isQuestionWrong(question)
    if (value === 'unanswered') return !hasAnswered(question)
    return true
  }).length
}

const getActiveResultFilterClass = (value: ResultFilter) => {
  if (value === 'correct') return 'border-emerald-600 bg-emerald-600 text-white'
  if (value === 'wrong') return 'border-rose-600 bg-rose-600 text-white'
  if (value === 'unanswered') return 'border-amber-600 bg-amber-600 text-white'
  return 'border-slate-900 bg-slate-900 text-white'
}

const getQuestionTypeLabel = (question: ProblemMath408BankVo) => {
  if (isAlgorithmQuestion(question)) return '算法题'
  if (question.option_type === 1) return '单选题'
  if (question.option_type === 2) return '多选题'
  if (question.option_type === 3) return '填空题'
  if (question.status === 0) return '简答题'
  return '题目'
}

const getOptions = (question: ProblemMath408BankVo) => {
  if (!question.options) return []
  try {
    const normalized = question.options.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)
    return Array.isArray(parsed) ? parsed.map((option) => String(option)) : []
  } catch {
    return []
  }
}

const getLetter = (index: number) => {
  return String.fromCharCode(65 + index)
}

const formatAnswer = (answer?: string) => {
  if (!answer) return ''
  try {
    const normalized = answer.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)
    if (Array.isArray(parsed)) return parsed.join('、')
  } catch {
    // Keep original answer if it is not JSON-like.
  }
  return answer
}

const isChoiceQuestion = (question: ProblemMath408BankVo) => {
  return question.option_type === 1 || question.option_type === 2
}

const isAlgorithmQuestion = (question: ProblemMath408BankVo) => {
  return question.status === 3 || question.option_type === 4
}

const parseChoiceAnswer = (answer?: string) => {
  if (!answer) return []
  try {
    const normalized = answer.replace(/'/g, '"')
    const parsed = JSON.parse(normalized)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim().toUpperCase()).filter(Boolean)
    }
    return String(parsed).split(/[、,\s]+/).map((item) => item.trim().toUpperCase()).filter(Boolean)
  } catch {
    return answer.split(/[、,\s\[\]']+/).map((item) => item.trim().toUpperCase()).filter(Boolean)
  }
}

const isSelected = (question: ProblemMath408BankVo, letter: string) => {
  return parseChoiceAnswer(getSheet(question)?.answer).includes(letter)
}

const isCorrectChoice = (question: ProblemMath408BankVo, letter: string) => {
  return parseChoiceAnswer(question.correct_answer).includes(letter)
}

const getChoiceOptionClass = (question: ProblemMath408BankVo, letter: string) => {
  const selected = isSelected(question, letter)
  const correct = isCorrectChoice(question, letter)
  if (selected && correct) return 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200'
  if (selected && !correct) return 'border-rose-300 bg-rose-50 ring-1 ring-rose-200'
  if (!selected && correct) return 'border-emerald-300 bg-white ring-1 ring-emerald-100'
  return 'border-slate-200 bg-white'
}

const isQuestionWrong = (question: ProblemMath408BankVo) => {
  const sheet = getSheet(question)
  const maxScore = getMaxScore(question)
  return hasAnswered(question) && (sheet?.score || 0) < maxScore
}

const isQuestionCorrect = (question: ProblemMath408BankVo) => {
  const sheet = getSheet(question)
  const maxScore = getMaxScore(question)
  return hasAnswered(question) && maxScore > 0 && (sheet?.score || 0) >= maxScore
}

const isAlgorithmAccepted = (question: ProblemMath408BankVo) => {
  if (!isAlgorithmQuestion(question)) return false
  const sheet = getSheet(question)
  if (!sheet?.answer) return false
  if ((sheet.score || 0) >= (question.score || 0) && (question.score || 0) > 0) return true
  return (sheet.ai_advise || '').includes('【判题状态】Accepted')
}

const getScoreCardClass = (question: ProblemMath408BankVo) => {
  if (isAlgorithmAccepted(question)) return 'border-emerald-300 bg-emerald-50 ring-1 ring-emerald-100'
  if (isQuestionWrong(question)) return 'border-rose-300 bg-rose-50 ring-1 ring-rose-100'
  return 'border-slate-200 bg-slate-50'
}

const getSelectedOptionDetails = (question: ProblemMath408BankVo) => {
  const options = getOptions(question)
  return parseChoiceAnswer(getSheet(question)?.answer).map((letter) => {
    const index = letter.toUpperCase().charCodeAt(0) - 65
    return {
      letter,
      content: options[index] || `未找到 ${letter} 选项内容`,
    }
  })
}

const getStandardAnswerMarkdown = (question: ProblemMath408BankVo) => {
  const answer = question.correct_answer
  if (!answer) return ''

  if (isChoiceQuestion(question)) {
    const options = getOptions(question)
    const answers = parseChoiceAnswer(answer)
    if (!answers.length) return answer
    return answers.map((letter) => {
      const normalizedLetter = letter.toUpperCase()
      const index = normalizedLetter.charCodeAt(0) - 65
      const content = options[index]
      return content ? `**${normalizedLetter}.** ${content}` : `**${normalizedLetter}**`
    }).join('\n\n')
  }

  return answer
}

const getAnswerPreview = (question: ProblemMath408BankVo) => {
  const answer = question.correct_answer?.trim()
  if (!answer) return ''
  if (isChoiceQuestion(question)) {
    const choices = parseChoiceAnswer(answer)
    return choices.length ? choices.join('、') : formatAnswer(answer)
  }
  return formatAnswer(answer)
}

const isImageUrl = (answer?: string) => {
  if (!answer) return false
  return /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(answer)
}

const parseStructuredResult = (aiAdvise?: string): StructuredGradingResult | undefined => {
  if (!aiAdvise) return undefined
  const marker = '【结构化结果】'
  const markerIndex = aiAdvise.indexOf(marker)
  if (markerIndex < 0) return undefined

  const jsonPart = aiAdvise.slice(markerIndex + marker.length).trim()
  const firstBrace = jsonPart.indexOf('{')
  const lastBrace = jsonPart.lastIndexOf('}')
  if (firstBrace < 0 || lastBrace <= firstBrace) return undefined

  try {
    return JSON.parse(jsonPart.slice(firstBrace, lastBrace + 1)) as StructuredGradingResult
  } catch (err) {
    console.warn('结构化判题结果解析失败', err)
    return undefined
  }
}

const formatPercent = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return `${Math.round(value * 100)}%`
}

const formatScore = (result?: StructuredGradingResult) => {
  if (!result) return '-'
  return `${result.awarded_score ?? '-'} / ${result.total_score ?? '-'}`
}

const accentBarClass = (index: number) => {
  const classes = ['bg-slate-700']
  return classes[index % classes.length]
}

const quickSummaryData = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return getSheet(question)?.ai_advise || ''
  return [
    '**判题速览**',
    `- 置信度：${formatPercent(result.confidence)}`,
    `- 得分率：${formatPercent(result.score_rate)}`,
    `- 判题模式：${result.grading_mode || '-'}`,
    `- 人工复查：${getNeedsManualReview(question) ? '需要' : '不需要'}`,
  ].join('\n')
}

const buildQuickSummaryMarkdown = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return getSheet(question)?.ai_advise || ''
  return quickSummaryData(question)
}

const buildAnswerMarkdown = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return ''

  const lines: string[] = []
  lines.push(`**识别作答**`)
  lines.push(result.student_normalized_answer || '未识别到有效作答')
  lines.push('')
  lines.push('**可接受答案**')
  if ((result.accepted_answers || []).length) {
    result.accepted_answers!.forEach((answer, idx) => {
      lines.push(`${idx + 1}. ${answer}`)
    })
  } else {
    lines.push('无')
  }
  return lines.join('\n')
}

const buildMistakeRubricMarkdown = (question: ProblemMath408BankVo) => {
  const result = getStructuredResult(question)
  if (!result) return ''

  const lines: string[] = []
  lines.push('**错误点**')
  if ((result.mistakes || []).length) {
    result.mistakes!.forEach((mistake, idx) => {
      lines.push(`${idx + 1}. ${mistake.type || '错误'} · ${mistake.severity || 'unknown'}`)
      if (mistake.description) lines.push(`   - ${mistake.description}`)
      if (mistake.related_rubric_item_id) lines.push(`   - 关联细则：${mistake.related_rubric_item_id}`)
    })
  } else {
    lines.push('无')
  }

  lines.push('')
  lines.push('**评分细则**')
  if ((result.rubric_used || []).length) {
    result.rubric_used!.forEach((rubric, idx) => {
      lines.push(`### ${rubric.name || rubric.id || `细则 ${idx + 1}`}`)
      lines.push(`- 得分：${rubric.awarded_score ?? 0} / ${rubric.max_score ?? 0} 分`)
      lines.push(`- 置信度：${formatPercent(rubric.confidence)}`)
      if (rubric.reason) lines.push(`- 原因：${rubric.reason}`)
      if (rubric.evidence) lines.push(`- 依据：${rubric.evidence}`)
      lines.push('')
    })
  } else {
    lines.push('无')
  }

  return lines.join('\n')
}
</script>
