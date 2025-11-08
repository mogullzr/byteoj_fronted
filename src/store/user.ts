import { defineStore } from "pinia";
import { User, UserControllerService } from "../../generated";
import axios from "axios";
import { ref } from "vue";

export const UserStore = defineStore("user", {
  state: () => ({
    loginUser: {
      uuid: -1,
      account: "",
      password: "",
      username: "",
      avatar: "",
      tags: undefined,
      hobby: "",
      email: "",
      phone: "",
      gender: "",
      school: "",
      profile: "",
      rating: undefined,
      role: 0,
      birth: "",
      create_time: "",
      update_time: "",
      is_delete: undefined,
      readings: 0,
      url: "",
      background_picture: "",
    } as User,
    difficulty_list: {
      简单: 0,
      中等: 1,
      困难: 2,
      未知难度: 3,
    },
    source_List: ["ByteOJ原创", "ByteOJ", "codeforces", "luogu", "leetcode", "牛客"],
    color_list: [
      "badge-lg badge badge-success",
      "badge-lg badge badge-warning",
      "badge-lg badge badge-error",
      "badge-lg badge badge-",
    ],
    AlgorithmTagsRelation: [
      [
        {
          tag_id: -2,
          tag_name: "语言入门（请选择[入门与面试]题库）",
        },
        {
          tag_id: 1,
          tag_name: "模拟",
        },
        {
          tag_id: 2,
          tag_name: "字符串",
        },
        {
          tag_id: 3,
          tag_name: "动态规划,dp",
        },
        {
          tag_id: 4,
          tag_name: "搜索",
        },
        {
          tag_id: 5,
          tag_name: "数学",
        },
        {
          tag_id: 6,
          tag_name: "图论",
        },
        {
          tag_id: 7,
          tag_name: "贪心",
        },
        {
          tag_id: 8,
          tag_name: "计算几何",
        },
        {
          tag_id: 9,
          tag_name: "暴力数据结构",
        },
        {
          tag_id: 10,
          tag_name: "高精度",
        },
        {
          tag_id: 11,
          tag_name: "树形数据结构",
        },
        {
          tag_id: 12,
          tag_name: "递推",
        },
        {
          tag_id: 13,
          tag_name: "博弈论",
        },
        {
          tag_id: 41,
          tag_name: "莫队",
        },
        {
          tag_id: 42,
          tag_name: "线段树",
        },
        {
          tag_id: 43,
          tag_name: "倍增",
        },
        {
          tag_id: 44,
          tag_name: "线性数据结构",
        },
        {
          tag_id: 45,
          tag_name: "二分",
        },
        {
          tag_id: 47,
          tag_name: "并查集",
        },
        {
          tag_id: 49,
          tag_name: "点分治",
        },
        {
          tag_id: 50,
          tag_name: "平衡树",
        },
        {
          tag_id: 51,
          tag_name: "堆",
        },
        {
          tag_id: 53,
          tag_name: "树状数组",
        },
        {
          tag_id: 54,
          tag_name: "递归",
        },
        {
          tag_id: 55,
          tag_name: "树上启发式合并",
        },
        {
          tag_id: 56,
          tag_name: "单调队列",
        },
        {
          tag_id: 63,
          tag_name: "LGV引理",
        },
        {
          tag_id: 64,
          tag_name: "矩阵树定理",
        },
        {
          tag_id: 65,
          tag_name: "珂朵莉树,颜色段均摊,ODT",
        },
        {
          tag_id: 66,
          tag_name: "原根",
        },
        {
          tag_id: 67,
          tag_name: "三分",
        },
        {
          tag_id: 68,
          tag_name: "Kruskal重构树",
        },
        {
          tag_id: 69,
          tag_name: "多项式",
        },
        {
          tag_id: 71,
          tag_name: "矩阵运算",
        },
        {
          tag_id: 72,
          tag_name: "数论",
        },
        {
          tag_id: 78,
          tag_name: "离散化",
        },
        {
          tag_id: 79,
          tag_name: "网络流",
        },
        {
          tag_id: 100,
          tag_name: "cdq分治",
        },
        {
          tag_id: 101,
          tag_name: "后缀自动机,SAM",
        },
        {
          tag_id: 110,
          tag_name: "基础算法",
        },
        {
          tag_id: 111,
          tag_name: "枚举",
        },
        {
          tag_id: 112,
          tag_name: "分治",
        },
        {
          tag_id: 113,
          tag_name: "排序",
        },
        {
          tag_id: 122,
          tag_name: "信息论",
        },
        {
          tag_id: 126,
          tag_name: "广度优先搜索,BFS",
        },
        {
          tag_id: 127,
          tag_name: "深度优先搜索,DFS",
        },
        {
          tag_id: 128,
          tag_name: "剪枝",
        },
        {
          tag_id: 129,
          tag_name: "记忆化搜索",
        },
        {
          tag_id: 130,
          tag_name: "启发式搜索",
        },
        {
          tag_id: 131,
          tag_name: "迭代加深搜索",
        },
        {
          tag_id: 132,
          tag_name: "启发式迭代加深搜索,IDA*",
        },
        {
          tag_id: 133,
          tag_name: "DancingLinks",
        },
        {
          tag_id: 134,
          tag_name: "爬山算法,Localsearch",
        },
        {
          tag_id: 135,
          tag_name: "模拟退火,SA",
        },
        {
          tag_id: 136,
          tag_name: "随机调整,Rounding",
        },
        {
          tag_id: 137,
          tag_name: "遗传算法",
        },
        {
          tag_id: 138,
          tag_name: "动态规划初步",
        },
        {
          tag_id: 139,
          tag_name: "背包",
        },
        {
          tag_id: 141,
          tag_name: "数位dp",
        },
        {
          tag_id: 144,
          tag_name: "区间dp",
        },
        {
          tag_id: 146,
          tag_name: "动态规划优化",
        },
        {
          tag_id: 147,
          tag_name: "降维",
        },
        {
          tag_id: 148,
          tag_name: "优先队列",
        },
        {
          tag_id: 149,
          tag_name: "矩阵加速",
        },
        {
          tag_id: 150,
          tag_name: "斜率优化",
        },
        {
          tag_id: 151,
          tag_name: "状态压缩",
        },
        {
          tag_id: 152,
          tag_name: "树形dp",
        },
        {
          tag_id: 153,
          tag_name: "凸完全单调性,wqs二分",
        },
        {
          tag_id: 154,
          tag_name: "四边形不等式",
        },
        {
          tag_id: 155,
          tag_name: "图论建模",
        },
        {
          tag_id: 158,
          tag_name: "图遍历",
        },
        {
          tag_id: 159,
          tag_name: "拓扑排序",
        },
        {
          tag_id: 160,
          tag_name: "最短路",
        },
        {
          tag_id: 165,
          tag_name: "K短路",
        },
        {
          tag_id: 166,
          tag_name: "生成树",
        },
        {
          tag_id: 172,
          tag_name: "平面图",
        },
        {
          tag_id: 173,
          tag_name: "最小环",
        },
        {
          tag_id: 174,
          tag_name: "负权环",
        },
        {
          tag_id: 175,
          tag_name: "连通块",
        },
        {
          tag_id: 176,
          tag_name: "2-SAT",
        },
        {
          tag_id: 177,
          tag_name: "欧拉公式（平面图）",
        },
        {
          tag_id: 179,
          tag_name: "强连通分量",
        },
        {
          tag_id: 180,
          tag_name: "Tarjan",
        },
        {
          tag_id: 181,
          tag_name: "双连通分量",
        },
        {
          tag_id: 182,
          tag_name: "欧拉回路",
        },
        {
          tag_id: 185,
          tag_name: "差分约束",
        },
        {
          tag_id: 186,
          tag_name: "仙人掌",
        },
        {
          tag_id: 187,
          tag_name: "二分图",
        },
        {
          tag_id: 189,
          tag_name: "一般图的最大匹配",
        },
        {
          tag_id: 194,
          tag_name: "最大流",
        },
        {
          tag_id: 197,
          tag_name: "上下界网络流",
        },
        {
          tag_id: 198,
          tag_name: "最小割",
        },
        {
          tag_id: 202,
          tag_name: "分数规划",
        },
        {
          tag_id: 204,
          tag_name: "费用流",
        },
        {
          tag_id: 208,
          tag_name: "树的遍历",
        },
        {
          tag_id: 211,
          tag_name: "最近公共祖先,LCA",
        },
        {
          tag_id: 213,
          tag_name: "树的直径",
        },
        {
          tag_id: 214,
          tag_name: "哈夫曼树",
        },
        {
          tag_id: 215,
          tag_name: "左偏树",
        },
        {
          tag_id: 227,
          tag_name: "动态树",
        },
        {
          tag_id: 228,
          tag_name: "树链剖分",
        },
        {
          tag_id: 229,
          tag_name: "Link-CutTree,LCT",
        },
        {
          tag_id: 230,
          tag_name: "树论",
        },
        {
          tag_id: 231,
          tag_name: "RMQ",
        },
        {
          tag_id: 232,
          tag_name: "树套树",
        },
        {
          tag_id: 233,
          tag_name: "可持久化线段树",
        },
        {
          tag_id: 234,
          tag_name: "可持久化",
        },
        {
          tag_id: 235,
          tag_name: "哈希,hash",
        },
        {
          tag_id: 239,
          tag_name: "素数判断,质数,筛法",
        },
        {
          tag_id: 240,
          tag_name: "众数",
        },
        {
          tag_id: 241,
          tag_name: "最大公约数,gcd",
        },
        {
          tag_id: 242,
          tag_name: "扩展欧几里德算法,exgcd",
        },
        {
          tag_id: 243,
          tag_name: "不定方程",
        },
        {
          tag_id: 244,
          tag_name: "进制",
        },
        {
          tag_id: 245,
          tag_name: "集合论",
        },
        {
          tag_id: 246,
          tag_name: "群论",
        },
        {
          tag_id: 247,
          tag_name: "置换",
        },
        {
          tag_id: 248,
          tag_name: "Pólya原理",
        },
        {
          tag_id: 249,
          tag_name: "虚树",
        },
        {
          tag_id: 250,
          tag_name: "中国剩余定理,CRT",
        },
        {
          tag_id: 251,
          tag_name: "莫比乌斯反演",
        },
        {
          tag_id: 252,
          tag_name: "组合数学",
        },
        {
          tag_id: 253,
          tag_name: "排列组合",
        },
        {
          tag_id: 254,
          tag_name: "前缀和",
        },
        {
          tag_id: 255,
          tag_name: "二项式定理",
        },
        {
          tag_id: 256,
          tag_name: "康托展开",
        },
        {
          tag_id: 258,
          tag_name: "鸽笼原理",
        },
        {
          tag_id: 259,
          tag_name: "容斥",
        },
        {
          tag_id: 260,
          tag_name: "斐波那契,Fibonacci",
        },
        {
          tag_id: 261,
          tag_name: "卡特兰数,Catalan",
        },
        {
          tag_id: 262,
          tag_name: "斯特林数,Stirling",
        },
        {
          tag_id: 263,
          tag_name: "A*算法",
        },
        {
          tag_id: 264,
          tag_name: "生成函数,GF",
        },
        {
          tag_id: 265,
          tag_name: "线性规划",
        },
        {
          tag_id: 266,
          tag_name: "概率论",
        },
        {
          tag_id: 268,
          tag_name: "条件概率",
        },
        {
          tag_id: 270,
          tag_name: "期望",
        },
        {
          tag_id: 271,
          tag_name: "线性代数",
        },
        {
          tag_id: 272,
          tag_name: "矩阵乘法",
        },
        {
          tag_id: 273,
          tag_name: "线性递推",
        },
        {
          tag_id: 274,
          tag_name: "高斯消元",
        },
        {
          tag_id: 276,
          tag_name: "逆元",
        },
        {
          tag_id: 277,
          tag_name: "线性基",
        },
        {
          tag_id: 278,
          tag_name: "微积分",
        },
        {
          tag_id: 279,
          tag_name: "极限",
        },
        {
          tag_id: 280,
          tag_name: "导数",
        },
        {
          tag_id: 281,
          tag_name: "积分",
        },
        {
          tag_id: 282,
          tag_name: "定积分",
        },
        {
          tag_id: 283,
          tag_name: "立体解析几何",
        },
        {
          tag_id: 284,
          tag_name: "级数",
        },
        {
          tag_id: 286,
          tag_name: "向量",
        },
        {
          tag_id: 287,
          tag_name: "栈",
        },
        {
          tag_id: 288,
          tag_name: "队列",
        },
        {
          tag_id: 289,
          tag_name: "分块",
        },
        {
          tag_id: 290,
          tag_name: "st表",
        },
        {
          tag_id: 291,
          tag_name: "凸包",
        },
        {
          tag_id: 292,
          tag_name: "叉积",
        },
        {
          tag_id: 293,
          tag_name: "线段相交",
        },
        {
          tag_id: 294,
          tag_name: "点积",
        },
        {
          tag_id: 295,
          tag_name: "半平面交",
        },
        {
          tag_id: 297,
          tag_name: "凸多边形的交",
        },
        {
          tag_id: 298,
          tag_name: "离散化扫描",
        },
        {
          tag_id: 299,
          tag_name: "旋转卡壳",
        },
        {
          tag_id: 300,
          tag_name: "字典树,Trie",
        },
        {
          tag_id: 301,
          tag_name: "AC自动机",
        },
        {
          tag_id: 302,
          tag_name: "KMP",
        },
        {
          tag_id: 303,
          tag_name: "后缀数组,SA",
        },
        {
          tag_id: 304,
          tag_name: "后缀树",
        },
        {
          tag_id: 305,
          tag_name: "有限状态自动机",
        },
        {
          tag_id: 308,
          tag_name: "其它技巧",
        },
        {
          tag_id: 309,
          tag_name: "随机化",
        },
        {
          tag_id: 310,
          tag_name: "Nim游戏",
        },
        {
          tag_id: 311,
          tag_name: "博弈树",
        },
        {
          tag_id: 313,
          tag_name: "快速傅里叶变换FFT",
        },
        {
          tag_id: 314,
          tag_name: "位运算",
        },
        {
          tag_id: 316,
          tag_name: "整体二分",
        },
        {
          tag_id: 318,
          tag_name: "构造",
        },
        {
          tag_id: 320,
          tag_name: "基环树",
        },
        {
          tag_id: 321,
          tag_name: "K-DTree",
        },
        {
          tag_id: 322,
          tag_name: "Lucas定理",
        },
        {
          tag_id: 323,
          tag_name: "插头dp",
        },
        {
          tag_id: 324,
          tag_name: "快速数论变换NTT",
        },
        {
          tag_id: 325,
          tag_name: "回文自动机,PAM",
        },
        {
          tag_id: 326,
          tag_name: "快速沃尔什变换,FWT",
        },
        {
          tag_id: 327,
          tag_name: "快速莫比乌斯变换,FMT",
        },
        {
          tag_id: 329,
          tag_name: "Manacher算法",
        },
        {
          tag_id: 330,
          tag_name: "差分",
        },
        {
          tag_id: 345,
          tag_name: "双指针,two-pointer",
        },
        {
          tag_id: 349,
          tag_name: "插值",
        },
        {
          tag_id: 350,
          tag_name: "圆方树",
        },
        {
          tag_id: 353,
          tag_name: "顺序结构",
        },
        {
          tag_id: 354,
          tag_name: "分支结构",
        },
        {
          tag_id: 355,
          tag_name: "循环结构",
        },
        {
          tag_id: 356,
          tag_name: "数组",
        },
        {
          tag_id: 357,
          tag_name: "字符串（入门）",
        },
        {
          tag_id: 358,
          tag_name: "结构体",
        },
        {
          tag_id: 359,
          tag_name: "函数与递归",
        },
        {
          tag_id: 360,
          tag_name: "链表",
        },
        {
          tag_id: 364,
          tag_name: "Dilworth定理",
        },
        {
          tag_id: 365,
          tag_name: "Ad-hoc",
        },
        {
          tag_id: 368,
          tag_name: "笛卡尔树",
        },
        {
          tag_id: 369,
          tag_name: "拟阵",
        },
        {
          tag_id: 370,
          tag_name: "Nim积",
        },
        {
          tag_id: 371,
          tag_name: "根号分治",
        },
        {
          tag_id: 372,
          tag_name: "拉格朗日反演",
        },
        {
          tag_id: 373,
          tag_name: "模拟费用流",
        },
        {
          tag_id: 374,
          tag_name: "分散层叠",
        },
        {
          tag_id: 375,
          tag_name: "均摊分析",
        },
        {
          tag_id: 376,
          tag_name: "分类讨论",
        },
        {
          tag_id: 377,
          tag_name: "李超线段树",
        },
        {
          tag_id: 378,
          tag_name: "吉司机线段树,SegmentTreeBeats",
        },
        {
          tag_id: 379,
          tag_name: "线段树合并",
        },
        {
          tag_id: 380,
          tag_name: "折半搜索,MeetInTheMiddle",
        },
        {
          tag_id: 382,
          tag_name: "动态树分治",
        },
        {
          tag_id: 385,
          tag_name: "单调栈",
        },
        {
          tag_id: 387,
          tag_name: "杨表",
        },
        {
          tag_id: 388,
          tag_name: "类欧几里得算法",
        },
        {
          tag_id: 391,
          tag_name: "Berlekamp-Massey算法,BM",
        },
        {
          tag_id: 396,
          tag_name: "梯度下降法",
        },
        {
          tag_id: 410,
          tag_name: "Prüfer序列",
        },
        {
          tag_id: 411,
          tag_name: "调和级数",
        },
        {
          tag_id: 412,
          tag_name: "拉格朗日乘数法",
        },
        {
          tag_id: 413,
          tag_name: "近似算法",
        },
        {
          tag_id: 414,
          tag_name: "随机算法",
        },
        {
          tag_id: 415,
          tag_name: "欧拉降幂",
        },
        {
          tag_id: 416,
          tag_name: "集合幂级数,子集卷积",
        },
        {
          tag_id: 417,
          tag_name: "拉格朗日插值法",
        },
        {
          tag_id: 418,
          tag_name: "欧拉定理（数论）",
        },
        {
          tag_id: 419,
          tag_name: "Lyndon分解",
        },
        {
          tag_id: 423,
          tag_name: "Stern-Brocot树",
        },
        {
          tag_id: 424,
          tag_name: "单链表",
        },
        {
          tag_id: 425,
          tag_name: "双链表",
        },
        {
          tag_id: 426,
          tag_name: "循环队列",
        },
        {
          tag_id: 427,
          tag_name: "树",
        },
        {
          tag_id: 428,
          tag_name: "Huffman树",
        },
        {
          tag_id: 429,
          tag_name: "DFS",
        },
        {
          tag_id: 430,
          tag_name: "BFS",
        },
        {
          tag_id: 431,
          tag_name: "Dijkstra",
        },
        {
          tag_id: 432,
          tag_name: "Bellman-ford",
        },
        {
          tag_id: 433,
          tag_name: "Spfa",
        },
        {
          tag_id: 434,
          tag_name: "Flody",
        },
        {
          tag_id: 435,
          tag_name: "Prim",
        },
        {
          tag_id: 436,
          tag_name: "Krusal",
        },
        {
          tag_id: 437,
          tag_name: "染色法",
        },
        {
          tag_id: 438,
          tag_name: "匈牙利算法",
        },
        {
          tag_id: 439,
          tag_name: "LCA",
        },
        {
          tag_id: 440,
          tag_name: "单源最短路",
        },
        {
          tag_id: 441,
          tag_name: "双指针",
        },
        {
          tag_id: 442,
          tag_name: "区间合并",
        },
        {
          tag_id: 443,
          tag_name: "快速排序",
        },
        {
          tag_id: 444,
          tag_name: "冒泡排序",
        },
        {
          tag_id: 445,
          tag_name: "捅排序",
        },
        {
          tag_id: 446,
          tag_name: "计数排序",
        },
        {
          tag_id: 447,
          tag_name: "归并排序",
        },
        {
          tag_id: 448,
          tag_name: "堆排序",
        },
        {
          tag_id: 449,
          tag_name: "数学知识",
        },
        {
          tag_id: 450,
          tag_name: "欧拉函数",
        },
        {
          tag_id: 451,
          tag_name: "质数",
        },
        {
          tag_id: 452,
          tag_name: "约数",
        },
        {
          tag_id: 453,
          tag_name: "埃式筛法",
        },
        {
          tag_id: 454,
          tag_name: "快速幂",
        },
        {
          tag_id: 455,
          tag_name: "扩展欧几里得定理",
        },
        {
          tag_id: 456,
          tag_name: "中国剩余定理",
        },
        {
          tag_id: 457,
          tag_name: "容斥原理",
        },
        {
          tag_id: 458,
          tag_name: "同余",
        },
        {
          tag_id: 459,
          tag_name: "概率与数学期望",
        },
        {
          tag_id: 460,
          tag_name: "排序不等式",
        },
        {
          tag_id: 461,
          tag_name: "绝对值不等式",
        },
        {
          tag_id: 462,
          tag_name: "数学公式推导",
        },
        {
          tag_id: 463,
          tag_name: "可持久数据结构",
        },
        {
          tag_id: 465,
          tag_name: "多源BFS",
        },
        {
          tag_id: 466,
          tag_name: "最小步数模型",
        },
        {
          tag_id: 467,
          tag_name: "双端队列广搜",
        },
        {
          tag_id: 468,
          tag_name: "双向广搜",
        },
        {
          tag_id: 469,
          tag_name: "A*",
        },
        {
          tag_id: 470,
          tag_name: "DFS之连通性模型",
        },
        {
          tag_id: 471,
          tag_name: "DFS之搜索顺序",
        },
        {
          tag_id: 472,
          tag_name: "DFS之剪枝与优化",
        },
        {
          tag_id: 473,
          tag_name: "迭代加深",
        },
        {
          tag_id: 474,
          tag_name: "双向DFS",
        },
        {
          tag_id: 475,
          tag_name: "IDA*",
        },
        {
          tag_id: 477,
          tag_name: "单调队列优化DP",
        },
        {
          tag_id: 478,
          tag_name: "斜率优化DP",
        },
        {
          tag_id: 479,
          tag_name: "Tire",
        },
        {
          tag_id: 480,
          tag_name: "Flood",
        },
      ],
    ],
    Math408TagsRelation: [
      [
        {
          tag_id: 1,
          tag_name: "微积分",
        },
        {
          tag_id: 2,
          tag_name: "FFCS",
        },
      ],
    ],
    languages_options: ["C/C++", "Python3", "Java", "Go", "JavaScript"],
    auto_code: [
      {
        caption: "include - 常用头文件",
        value:
          "include <iostream>\n" +
          "#include <algorithm>\n" +
          "#include <cstring>\n" +
          "#include <vector>\n" +
          "#include <set>\n" +
          "#include <map>\n" +
          "#include <queue>\n",
        core: 100,
      },
      {
        caption: "using namespace std",
        value: "using namespace std;",
        core: 1000,
      },
      {
        caption: "int main 主函数",
        value: "int main()\n" + "{\n" + "    \n" + "    return 0;\n" + "}",
        score: 100,
      },
      {
        caption: "const int N",
        value: "const int N = 2e5 + 10;",
        core: 100,
      },
      {
        caption: "ios::",
        value: "ios::sync_with_stdio(false),cin.tie(0), cout.tie(0);",
        core: 100000000,
      },
      {
        caption: "fore",
        value: "for (int i = 1; i <= n; i++)",
      },
      {
        caption: "refore",
        value: "for (int i = n; i >= 1; i--)",
      },
      {
        caption: "ed",
        value: "'\\n'",
        core: 100000000,
      },
      {
        caption: "int BinarySearch1 - 二分1",
        value:
          "// 二分查找板子1，x表示需要查找的数,n表示数组长度,从左往右找到的第一个>= x的数,下标从1开始\n" +
          "int BinarySearch1(int x, int n) {\n" +
          "    // for (int i = 1; i <= n; i++) cin >> a[i];\n" +
          "    int l = 1, r = n;\n" +
          "    while (l < r) {\n" +
          "        int mid = l + r >> 1;\n" +
          "        if (a[mid] >= x) r = mid;\n" +
          "        else l = mid + 1;\n" +
          "    }\n" +
          "    // 表示存在这样的数\n" +
          "    if (a[r] == x) return r;\n" +
          "    // 表示不存在这样的数\n" +
          "    else return -1;\n" +
          "}\n",
      },
      {
        caption: "int BinarySearch2 - 二分2",
        value:
          "// 二分查找板子2，x表示需要查找的数，n表示数组长度，从右往左找到的第一个<=x的数,下标从1开始\n" +
          "int BinarySearch2(int x, int n) {\n" +
          "    for (int i = 1; i <= n; i++) cin >> a[i];\n" +
          "    int l = 1, r = n;\n" +
          "    while (l < r) {\n" +
          "        int mid = (l + r + 1) >> 1;\n" +
          "        if (a[mid] <= x) l = mid;\n" +
          "        else r = mid - 1;\n" +
          "    }\n" +
          "    // 表示存在这样的数\n" +
          "    if (a[l] == x) return l;\n" +
          "    // 表示不存在这样的数\n" +
          "    return -1;\n" +
          "}",
      },
      {
        caption: "void Add - 高精度加法",
        value:
          "// 高精度加法板子\n" +
          "void Add(vector<int> A, vector<int> B) {\n" +
          "    // C存储最终结果\n" +
          "    vector<int> C;\n" +
          "    // c表示进位\n" +
          "    int c = 0;\n" +
          "    // 使用这个循环模拟小学加法规则，低位开始，依次对应相加，每次加完就是c\n" +
          "    // c可能大于10，也可能小于10，大于10就进位，c /= 10,同时每次相加的时候初始的c就是之前保留下来的进位\n" +
          "    for (int i = 0; i < A.size() || i < B.size(); i++) {\n" +
          "        if (i < A.size()) c += A[i]; \n" +
          "        if (i < B.size()) c += B[i];\n" +
          "        C.push_back(c % 10);\n" +
          "        c /= 10;\n" +
          "    }\n" +
          "    // 判断最终存在进位情况\n" +
          "    if (c) {\n" +
          "        C.push_back(c);   \n" +
          "    }\n" +
          "    for (int i = C.size() - 1; i >= 0; i--) cout << C[i];\n" +
          "}",
      },
      {
        caption: "void Sub - 高精度减法",
        value:
          "// 判断A, B的大小关系，A < B,则返回true,反之返回false\n" +
          "bool check(vector<int> A,vector<int> B) {\n" +
          "    if (A.size() != B.size()) return A.size() < B.size();\n" +
          "    else {\n" +
          "        for (int i = A.size() - 1; i >= 0; i--) {\n" +
          "            if (A[i] != B[i]) return A[i] < B[i];\n" +
          "        }\n" +
          "    }\n" +
          "    return false;\n" +
          "}\n" +
          "// 高精度减法板子\n" +
          "void Sub(vector<int> A, vector<int> B) {\n" +
          "    // 若A < B, 我们需要将B作为被除数，A作为除数，随后再输出一个负号\n" +
          "    if (check(A, B)) {\n" +
          '        cout << "-";\n' +
          "        swap(A, B);\n" +
          "    }\n" +
          "    vector<int> C;\n" +
          "    // c为-1表示退一位\n" +
          "    int c = 0;\n" +
          "    // 使用这个循环模拟小学的减法运算方式，从低位开始，逐位相减，不够则向高位借,此时c = -1;反之则为0\n" +
          "    for (int i = 0; i < A.size(); i++) {\n" +
          "        c += A[i];\n" +
          "        if (i < B.size()) c -= B[i];\n" +
          "        C.push_back((c + 10) % 10);\n" +
          "        if (c < 0) c = -1;\n" +
          "        else c = 0;\n" +
          "    }\n" +
          "    \n" +
          "    // 处理一种特殊情况，就是存在位数一样的情况，比如 1122 22这两个数相见减就会变为 0022\n" +
          "    // 这样我们就需要从高位开始去除0至最高位不为 0\n" +
          "    while (C.size() > 1 && C.back() == 0) C.pop_back();\n" +
          "    for (int i = C.size() - 1; i >= 0; i--) cout << C[i];\n" +
          "}",
      },
      {
        caption: "void Mult - 高精度乘法",
        value:
          "// 高精度乘法板子\n" +
          "void Mult(vector<int> A, int b) {\n" +
          "    vector<int> C;\n" +
          "    int c = 0;\n" +
          "    // 按照小学的乘法原则进行运算，基本和加法原则一致\n" +
          "    // A和B都是低位到高位顺序排列好的数\n" +
          "    for (int i = 0; i < A.size() ; i++) {\n" +
          "        c += A[i] * b;\n" +
          "        C.push_back(c % 10);\n" +
          "        c /= 10;\n" +
          "    }\n" +
          "    \n" +
          "    if (c) {\n" +
          "        C.push_back(c);\n" +
          "    }\n" +
          "    reverse(C.begin(), C.end());\n" +
          "    while(C.size() > 1 && C.back() == 0) C.pop_back();\n" +
          "    for (int i = C.size() - 1; i = 0; i--) cout << C[i];\n" +
          "    cout << '\\n';\n" +
          "    cout << c;\n" +
          "}",
      },
      {
        caption: "void Divide - 高精度除法",
        value:
          "// 高精度除法板子\n" +
          "void Divide(vector<int> A, int b) {\n" +
          "    vector<int> C;\n" +
          "    \n" +
          "    // 除之后的余数\n" +
          "    int c = 0;\n" +
          "    // 按照小学的除法规则，从高位开始，除完之后余数作为下面位数的高位继续＋\n" +
          "    // 比如12345 ÷ 4,1 ÷ 4 = 0,这个0作为结果放入C里面，余数1保留，然后下一次这个1就需要 * 10 \n" +
          "    // 再加上2 再 ÷ 4，后面也是同样的道理\n" +
          "    // A和B都是高位到低位顺序排列好的数\n" +
          "    for (int i = A.size() - 1; i >= 0; i--) {\n" +
          "        c *= 10;\n" +
          "        c += A[i];\n" +
          "        C.push_back(c / b);\n" +
          "        c %= b;\n" +
          "    }\n" +
          "    // 这个时候的结果是正序的，但是为了处理最高位为0的情况，可以选择倒序之后处理。\n" +
          "    reverse(C.begin(), C.end());\n" +
          "    while (C.size() > 1 && C.back() == 0) C.pop_back();\n" +
          '    for (int i = C.size() - 1; i >= 0; i--) cout << C[i] << "";\n' +
          "    cout << '\\n';\n" +
          "    cout << c;\n" +
          "}",
      },
      {
        caption: "void OnePrefixSum - 一维前缀和",
        value:
          "int num[N], sum[N];\n" +
          "// 一维前缀和板子\n" +
          "void OnePrefixSum(int n) {\n" +
          "    // 原数组\n" +
          "    for (int i = 1; i <= n; i++) cin >> num[i];\n" +
          "    // 前i项和\n" +
          "    for (int i = 1; i <= n; i++) sum[i] = sum[i - 1] + num[i];\n" +
          '    for (int i = 1; i <= n; i++) cout << sum[i] << " ";\n' +
          "} ",
      },
      {
        caption: "void TwoPrefixSum1 - 二维前缀和1",
        value:
          "int num[N][N], sum[N][N];\n" +
          "\n" +
          "// 二维前缀和板子1\n" +
          "void TwoPrefixSum1(int n, int m) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) cin >> num[i][j];\n" +
          "    }\n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            sum[i][j] = sum[i][j - 1] + sum[i - 1][j] - sum[i - 1][j - 1] + num[i][j];\n" +
          '            cout << sum[i][j] << " ";\n' +
          "        }\n" +
          "        cout << '\\n';\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void TwoPrefixSum2 - 二维前缀和2",
        value:
          "int num[N][N];\n" +
          "\n" +
          "// 二维前缀和板子2\n" +
          "void TwoPrefixSum2(int n, int m) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            cin >> num[i][j];    \n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    // 求每一行对应位置的和\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) num[i][j] += num[i][j - 1];\n" +
          "    }\n" +
          "    // 求每一列对应位置的和，此时实际上求的就是前缀和了\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= n; j++) num[i][j] += num[i - 1][j];\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void ThreePrefixSum1 - 三维前缀和1",
        value:
          "int num[N][N][N], sum[N][N][N];\n" +
          "// 三维前缀和板子\n" +
          "void ThreePrefixSum1(int n, int m, int k) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk++) {\n" +
          "                cin >> num[i][j][k];                \n" +
          "            }\n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk++) {\n" +
          "                sum[i][j][kk] = sum[i - 1][j][kk] + sum[i][j - 1][kk]\n" +
          "                + sum[i][j][kk - 1] - sum[i - 1][j - 1][kk]\n" +
          "                - sum[i - 1][j][kk - 1] - sum[i][j - 1][kk - 1] \n" +
          "                + sum[i - 1][j - 1][kk - 1]\n" +
          "                + num[i][j][kk];\n" +
          "            }\n" +
          "        }\n" +
          "        cout << '\\n';\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void ThreePrefixSum2 - 三维前缀和2",
        value:
          "int num[N][N][N];\n" +
          "// 三维前缀和板子2\n" +
          "void ThreePrefixSum2(int n, int m, int k) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk ++) cin >> num[i][j][kk];    \n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk++) num[i][j][kk] += num[i - 1][j ][kk];\n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk++) num[i][j][kk] += num[i][j - 1][kk];\n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk++) num[i][j][kk] += num[i][j][kk - 1];\n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            for (int kk = 1; kk <= k; kk++) {\n" +
          "                num[i][j][kk] += num[i][j][kk - 1];\n" +
          '                cout << num[i][j][kk] << " ";\n' +
          "            }\n" +
          "            cout << '\\n';\n" +
          "        }\n" +
          "        cout << '\\n';\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void OneDifference - 一维差分",
        value:
          "void insert(int l, int r, int x) {\n" +
          "    num[l] += x;\n" +
          "    num[r + 1] -= x;\n" +
          "}\n" +
          "\n" +
          "// 一维差分板子\n" +
          "void OneDifference(int n, int m) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        int x;\n" +
          "        cin >> x;        \n" +
          "        insert(i, i, x);\n" +
          "    }\n" +
          "    \n" +
          "    while (m--) {\n" +
          "        int l, r, c;\n" +
          "        cin >> l >> r >> c;\n" +
          "        insert(l, r, c);\n" +
          "    }\n" +
          "    for (int i = 1; i <= n; i++) num[i] += num[i - 1];\n" +
          '    for (int i = 1; i <= n; i++) cout << num[i] << " ";\n' +
          "}",
      },
      {
        caption: "void TwoDifference - 二维差分",
        value:
          "int num[N][N];\n" +
          "\n" +
          "\n" +
          "void insert(int l1;, int r1, int l2, int r2, int x) {\n" +
          "    num[l1][r1] += x;\n" +
          "    num[l1][r2 + 1] -= x;\n" +
          "    num[l2 + 1][r2] -= x;\n" +
          "    num[l2 + 1][r2 + 1] += x;\n" +
          "}\n" +
          "\n" +
          "// 二维差分板子\n" +
          "void TwoDimensionalDifference(int n, int m, int k) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            int x;\n" +
          "            cin >> x;        \n" +
          "            insert(i, i, x);    \n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    while (k--) {\n" +
          "        int l, r, c;\n" +
          "        cin >> l1 >> r1 >> l2 >> r2 >> c;\n" +
          "        insert(l1, r1, l2, r2, c);\n" +
          "    }\n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) {\n" +
          "            num[i][j] = num[i - 1][j] + num[i][j - 1] - num[i - 1][j  1] + num[i][j];\n" +
          '            cout << num[i][j] << " ";\n' +
          "        }\n" +
          "        cout << '\\n';\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void dfs - DFS",
        value:
          "// 最简单的DFS，输出 1 ~ n 按照字典顺序排列的数组\n" +
          "void DFS(int k, int n) {\n" +
          "    if (k >= n + 1) {\n" +
          "        for(int i = 1; i <= n; i++) {\n" +
          '            cout << a[i] << " ";\n' +
          "        } \n" +
          "        cout << '\\n';\n" +
          "        return;\n" +
          "    }\n" +
          "    \n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        if (!st[i]) {\n" +
          "            a[k] = i;\n" +
          "            st[i] = true;\n" +
          "            dfs(k + 1, n);\n" +
          "            st[i] = false;\n" +
          "        }\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void BFS(int n, int m) - 最简单的BFS",
        value:
          "int a[N][N];\n" +
          "int dx[4] = {1, 0, -1, 0}, dy[4] = {0, 1, 0, -1};\n" +
          "int vis[N][N];\n" +
          "\n" +
          "// 最简单的BFS，找出走出迷宫的最小走的长度\n" +
          "void BFS(int n, int m) {\n" +
          "    memset(vis, -1, sizeof vis);\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= m; j++) cin >> a[i][j];\n" +
          "    }\n" +
          "    \n" +
          "    vis[1][1] = 0;\n" +
          "    queue<PII> q;\n" +
          "    q.push({1, 1});\n" +
          "    \n" +
          "    while(!q.empty()) {\n" +
          "        auto t = q.front();\n" +
          "        q.pop();\n" +
          "        int x0 = t.x, y0 = t.y;\n" +
          "        for(int i = 0; i < 4; i++) {\n" +
          "            int x1 = x0 + dx[i], y1 = y0 + dy[i];\n" +
          "            if (x1 >= 1 && x1 <= n && y1 >= 1 && y1 <= m && vis[x1][y1] == -1 && a[x1][y1] == 0) {\n" +
          "                vis[x1][y1] = vis[x0][y0] + 1;\n" +
          "                q.push({x1, y1});\n" +
          "            } \n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    cout << vis[n][m];\n" +
          "}",
      },
      {
        caption: "void Dijkstra - Dijkstra算法",
        value:
          "typedef pair<int, int> PII;\n" +
          "const int N = 2e5 + 10;\n" +
          "int e[N], h[N], ne[N], idx;\n" +
          "priority_queue<PII, vector<PII>, greater<PII>> q;\n" +
          "bool st[N];\n" +
          "int dist[N];\n" +
          "\n" +
          "void add(int a, int b, int c) {\n" +
          "    e[idx] = b, w[idx] = c,ne[idx] = h[a], h[a] = idx++;\n" +
          "}\n" +
          "\n" +
          "// 最基本的Dijsktra算法\n" +
          "void Dijsktra() {\n" +
          "    memset(dist, 0x3f, sizeof dist);\n" +
          "    int n, m;\n" +
          "    cin >> n >> m;\n" +
          "    memset(h, -1, sizeof h);\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        int x, y, z;\n" +
          "        add(x, y, z);\n" +
          "    }\n" +
          "    \n" +
          "    q.push({0, 1});\n" +
          "    \n" +
          "    dist[1] = 0;\n" +
          "    \n" +
          "    while (q.size()) {\n" +
          "        auto t = q.top();\n" +
          "        int distance = t.first, k = t.second;\n" +
          "        if (st[k]) continue;\n" +
          "        st[k] = true;\n" +
          "        \n" +
          "        for (int i = h[k]; ~i; i = ne[i]) {\n" +
          "            int j = e[i];\n" +
          "            if (!st[j] && dist[j] > w[i] + distance) {\n" +
          "                dist[j] = distance + w[i];\n" +
          "                q.push({dist[j], j});\n" +
          "            }\n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          '    if (dist[n] == 0x3f3f3f3f) cout << "-1";\n' +
          "    else cout << dist[n];\n" +
          "}",
      },
      {
        caption: "void Floyd - Floyd算法",
        value:
          "// floyd算法板子\n" +
          "void floyd() {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        for (int j = 1; j <= n; j++) {\n" +
          "            if (i == j) dist[i][j] = 0;       \n" +
          "            else dist[i][j] = 0x3f3f3f3f;\n" +
          "        }\n" +
          "    }\n" +
          "    \n" +
          "    while (m--) {\n" +
          "        int x, y, z;\n" +
          "        // 防止存在重边\n" +
          "        cin >> x >> y >> z;\n" +
          "        dist[x][y] = min(dist[x][y], z);\n" +
          "    }\n" +
          "    for (int i = 1; i <= n; i ++) {\n" +
          "        for (int j = 1; j <= n; j++) {\n" +
          "            for (int k = 1; k <= n; k++) {\n" +
          "                dist[j][k] = min(dist[j][k], dist[j][i] + dist[i][k]);\n" +
          "            }\n" +
          "        }\n" +
          "    }\n" +
          "}",
      },
      {
        caption: "void DoublePointer - 双指针经典",
        value:
          "int a[N];\n" +
          "int st[N];\n" +
          "int ans = 1;\n" +
          "// 双指针算法经典题目，求长度为n的数组的最长的不存在重复数字的连续序列的长度\n" +
          "void DoublePointer(int n) {\n" +
          "    for (int i = 1; i <= n; i++) cin >> a[i];\n" +
          "    // i表示此时序列左侧位置，j表示右侧位置，st表示某个数出现的次数\n" +
          "    // 一旦最右侧的数出现次数 = 1了，就代表之前已经存在过这个数，我没就从i开始一个一个查看\n" +
          "    // 一旦这个st[a[j]] == 0了或者 i == j了，我们就继续往后探索\n" +
          "    for (int i = 1, j = 1; j <= n; j++) {\n" +
          "        while (st[a[j]] && i < j) {\n" +
          "            st[a[i++]]--;\n" +
          "        }\n" +
          "        ++st[a[j]];\n" +
          "        ans = max(ans, j - i + 1);\n" +
          "    }\n" +
          "    \n" +
          "    cout << ans;\n" +
          "}",
      },
      {
        caption: "void BitOperation - 位运算 - 入门难度",
        value:
          "// 位运算 - 入门难度：求一些数的二进制中1的个数\n" +
          "void BitOperation(int n) {\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        int x;\n" +
          "        int res = 0;\n" +
          "        cin >> x;\n" +
          "        while(x) {\n" +
          "            res += x & 1;\n" +
          "            x >>= 1;   \n" +
          "        }\n" +
          '        cout << res << " ";\n' +
          "    }\n" +
          "}",
      },
      {
        caption: "void Discretization - 离散化 - 经典",
        value:
          "typedef pair<int, int> PII;\n" +
          "const int N = 3e5 + 10;\n" +
          "vector<int> alls;\n" +
          "vector<PII> add, query;\n" +
          "\n" +
          "int a[N];\n" +
          "int s[N];\n" +
          "\n" +
          "\n" +
          "int find(int x) {\n" +
          "    int l = 0, r = alls.size() - 1;\n" +
          "    while (l < r) {\n" +
          "        int mid = l + r >> 1;\n" +
          "        if (alls[mid] >= x) r = mid; \n" +
          "        else l = mid + 1;\n" +
          "    }\n" +
          "    return r + 1;\n" +
          "}\n" +
          "\n" +
          "// 离散化 - 经典题:给你一些数，有一个长度为1e9的数组，现在随意在这些位置上的某些位置\n" +
          "// 插入一些数，最后问你多个在l ~ r中间数的和。\n" +
          "void Discretization() {\n" +
          "    int n, m;\n" +
          "    cin >> n >> m;\n" +
          "    for (int i = 1; i <= n; i++) {\n" +
          "        int x, c;\n" +
          "        cin >> x >> c;\n" +
          "        alls.push_back(x);\n" +
          "        add.push_back({x, c});\n" +
          "    }\n" +
          "    \n" +
          "    for (int j = 1; j <= m; j++) {\n" +
          "        int l, r;\n" +
          "        cin >> l >> r;\n" +
          "        alls.push_back(l);\n" +
          "        alls.push_back(r);\n" +
          "        query.push_back({l, r});\n" +
          "    }\n" +
          "    \n" +
          "    sort(alls.begin(), alls.end());\n" +
          "    alls.erase(unique(alls.begin(), alls.end()), alls.end());\n" +
          "    \n" +
          "    for (auto item : add) {\n" +
          "        int x = find(item.first);\n" +
          "        a[x] += item.second;\n" +
          "    }\n" +
          "    \n" +
          "    s[0] = a[0];\n" +
          "    for (int i = 1; i <= alls.size(); i++) {\n" +
          "        s[i] = s[i - 1] + a[i];\n" +
          "    }\n" +
          "    \n" +
          "    for (auto item : query) {\n" +
          "        int l = find(item.first), r = find(item.second);\n" +
          "        cout << s[r] - s[l - 1] << '\\n'; \n" +
          "    }\n" +
          "}",
      },
      {
        caption: "C++ 板子1.0",
        value:
          "#include <iostream>\n" +
          "#include <cstring>\n" +
          "#include <algorithm>\n" +
          "#include <queue>\n" +
          "#include <map>\n" +
          "#include <unordered_map>\n" +
          "#include <string>\n" +
          "#include <cmath>\n" +
          "#include <set>\n" +
          "#include <stack>\n" +
          "#include <vector>\n" +
          "#include <deque>\n" +
          "#include <bitset>\n" +
          "#include <cstdio>\n" +
          "#include <iomanip>\n" +
          "\n" +
          "// #define int long long\n" +
          "#define ull unsigned long long\n" +
          "#define ed '\\n'\n" +
          "#define fi first\n" +
          "#define se second\n" +
          "#define fore(i, l, r) for(int i = (int)(l); i <=(int)r; i++)\n" +
          '#define debug(x) cout << "#x = " << x << ed;\n' +
          "#define PI acos(-1)\n" +
          "#define E exp(1)\n" +
          "#define IOS ios::sync_with_stdio(false),cin.tie(0),cout.tie(0);\n" +
          "#define me0(st) memset(st, 0, sizeof st)\n" +
          "#define me3f(st) memset(st, 0x3f, sizeof st)\n" +
          '#define pdf(x) printf("%lf", double(x))\n' +
          '#define pif(x) printf("%d ",  int(x))\n' +
          '#define scf(x) printf("%d",  int(x))\n' +
          "#define re return 0\n" +
          "#define max(a, b) ((a) > (b) ? (a) : (b))\n" +
          "#define min(a, b) ((a) < (b) ? (a) : (b))\n" +
          "#define out(x, k) cout << fixed << setprecision(k) << x << ed\n" +
          "\n" +
          "using namespace std;\n" +
          "\n" +
          "typedef pair<int, int> PII;\n" +
          "typedef long long LL;\n" +
          "typedef double db;\n" +
          "\n" +
          "\n" +
          "const int INF = 1e9;\n" +
          "const int N = 1e5 + 10;\n" +
          "\n" +
          "void solve() {\n" +
          "    \n" +
          "}\n" +
          "int main()\n" +
          "{\n" +
          "    IOS;\n" +
          "    int _ = 1;\n" +
          "    // cin >> _;\n" +
          "    \n" +
          "    while(_--) {\n" +
          "        solve();\n" +
          "    }\n" +
          "    \n" +
          "    re;\n" +
          "}",
      },
      {
        caption: "ByteOJ",
        value: "FLYFLYFLYFLYFLYFLYFLYFLYFLYFLYFLY",
      },
    ],
    themes_options: ["textmate", "eclipse", "twilight", "monokai"],
    languages_content: [
      "#include <stdio.h>\n" +
        "\n" +
        "int main()\n" +
        "{\n" +
        "    int a, b;\n" +
        '    scanf("%d %d",&a,&b);\n' +
        '    printf("%d", a + b);\n' +
        "    \n" +
        "    return 0;\n" +
        "}",
      "#include <iostream>\n" +
        "#include <algorithm>\n" +
        "#include <cstring>\n" +
        "#include <vector>\n" +
        "#include <set>\n" +
        "#include <map>\n" +
        "#include <queue>\n" +
        "\n" +
        "using namespace std;\n" +
        "\n" +
        "int main()\n" +
        "{\n" +
        "    int a, b;\n" +
        "    cin >> a >> b;\n" +
        "    cout << a + b << endl;\n" +
        "    return 0;\n" +
        "}",
      "import math\n" +
      "if __name__ == \"__main__\":\n" +
      "    a, b = input().split()\n" +
      "    print(int(a) + int(b))",
      "",
      "Go",
      "JavaScript",
    ],
    status_list: {
      Accepted: "AC",
      "Compile Error": "CE",
      "Wrong Answer": "WA",
      "Memory Limit Exceeded": "MLE",
      "Time Limit Exceeded": "TLE",
      "Output Limit Exceeded": "OLE",
      Signalled: "Sign",
      InternalError: "IE",
      ParamsError: "PE",
      Pending: "PD",
    },
    status_color_list: {
      AC: "#52c41a",
      WA: "#E74B3C",
      TLE: "#2E468C",
      OLE: "#8E44AD",
      PE: "#E67D22",
      CE: "#F1C40E",
      MLE: "#2E468C",
      Sign: "#1E1F22",
      PD: "#BFBFBF",
      IE: "#AE00AA",
    },
    rated_color_list: [
      "#808080",
      "#008069",
      "#0F01FF",
      "#AE00AA",
      "#FF8F00",
      "#f87b92",
      "#e85470",
      "#f8415f",
      "#b20121",
      "#bd0126",
      "#640311",
    ],
    optionTypes: ["简答题", "单选题", "多选题", "编程大题"],
    currentRequest: 0,
    maxRequestCount: 2,
    currentLocation: "",
    currentIp: "",
    githubBaseUrl: "https://github.com/login/oauth/authorize",
    client_id: "Ov23li8iaZwfv7KORYKw",
    redirect_uri: "https://www.byteoj.com/authorize/redirect",
    control_list: ["导出排行榜"],
  }),

  actions: {
    async getLoginUser() {
      const res = await UserControllerService.getCurrentUserUsingGet();
      if (res.code === 0) {
        if (res.data !== undefined) {
          /**
           * 从 API 响应中获取的数据
           */
          const userData: Partial<User> = res.data;
          /**
           * 使用对象解构赋值更新状态对象的属性
           */
          userData.tags = userData.tags?.substring(
            1,
            userData.tags?.length - 1
          );
          userData.tags = userData.tags?.split(" ").join("");
          Object.assign(this.loginUser, userData);
          if (this.loginUser.avatar == null || this.loginUser.avatar == "") {
            this.loginUser.avatar =
              "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png";
          }
          if (
            this.loginUser.background_picture == null ||
            this.loginUser.background_picture == ""
          ) {
            this.loginUser.background_picture =
              "http://mogullzr001.oss-cn-beijing.aliyuncs.com/2024/08/7e0f3ceda888461785e03ab837e3ae98.jpeg";
          }
        }
      } else {
        this.loginUser = {
          uuid: -1,
          avatar:
            "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
          background_picture:
            "http://mogullzr001.oss-cn-beijing.aliyuncs.com/2024/08/7e0f3ceda888461785e03ab837e3ae98.jpeg",
        } as User;
      }

      const res0 = await UserControllerService.userGetPictureByUserUsingGet();
      if (res0.code === 0) {
        if (res0.data !== "") {
          this.loginUser.background_picture = res0.data;
        }
      }
    },
    async getUserLocationInfo() {
      const Location = ref();
      axios
        .get("https://api.ipify.org?format=json")
        .then((response) => {
          this.currentIp = response.data.ip;
          axios
            .get(`https://api.vore.top/api/IPdata?ip=${this.currentIp}`)
            .then((res) => {
              Location.value = res.data.ipdata;
              Location.value =
                Location.value.info1 +
                Location.value.info2 +
                Location.value.info3;
              this.currentLocation = Location.value;
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
});

export default UserStore;
