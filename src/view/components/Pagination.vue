<template>
  <div class="pagination-container">
    <div
        class="pagination-button"
        :class="{ disabled: currentPageValue === 1 }"
        @click="changePage(currentPageValue - 1)"
    >
      &lt;
    </div>

    <template v-for="page in pages" :key="page">
      <div
          v-if="page === '...'"
          class="ellipsis"
      >
        ...
      </div>
      <div
          v-else
          class="pagination-button"
          :class="{ active: currentPageValue === page }"
          @click="changePage(page)"
      >
        {{ page }}
      </div>
    </template>

    <div
        class="pagination-button"
        :class="{ disabled: currentPageValue === totalPages }"
        @click="changePage(currentPageValue + 1)"
    >
      &gt;
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    totalPages: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  },
  emits: ['current-page'],
  data() {
    return {
      currentPageValue: this.currentPage
    }
  },
  computed: {
    pages() {
      const range = [];
      const delta = 2;
      const left = this.currentPageValue - delta;
      const right = this.currentPageValue + delta;

      for (let i = 1; i <= this.totalPages; i++) {
        if (i === 1 || i === this.totalPages || (i >= left && i <= right)) {
          range.push(i);
        } else if (i === left - 1 || i === right + 1) {
          range.push('...');
        }
      }

      return range.filter((page, index, array) => array[index - 1] !== page);
    }
  },
  watch: {
    currentPage(newVal) {
      this.currentPageValue = newVal;
    }
  },
  methods: {
    changePage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPageValue) return;
      this.currentPageValue = page;
      this.$emit('current-page', page);
    }
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.pagination-button {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.pagination-button:hover:not(.active, .disabled) {
  background-color: #e0e0e0;
}

.active {
  background-color: #2196f3;
  color: white;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ellipsis {
  color: #999;
  padding: 0 8px;
}
</style>