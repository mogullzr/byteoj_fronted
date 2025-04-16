import { defineStore } from "pinia";
import { User, UserControllerService } from "../../generated";

export const UseStore = defineStore("user", {
  state: () => ({
    loginUser: {
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
    isShow: true,
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
            userData.tags?.length - 1,
          );
          userData.tags = userData.tags?.split(" ").join("");
          Object.assign(this.loginUser, userData);
          if (this.loginUser.avatar == null || this.loginUser.avatar == "") {
            this.loginUser.avatar =
              "http://mogullzr001.oss-cn-beijing.aliyuncs.com/2024/08/53aa79adb99c4366a99804fb60c24930.webp";
          }
          if (
            this.loginUser.background_picture == null ||
            this.loginUser.background_picture == ""
          ) {
            this.loginUser.background_picture =
              "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202408131608636.jpg";
          }
        }
      } else {
        this.loginUser = {
          uuid: -1,
          role: 0,
          avatar:
            "http://mogullzr001.oss-cn-beijing.aliyuncs.com/2024/08/53aa79adb99c4366a99804fb60c24930.webp",
          background_picture:
            "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202408131608636.jpg",
        } as User;
      }

      const res0 = await UserControllerService.userGetPictureByUserUsingGet();
      if (res0.code === 0) {
        if (res0.data !== "") {
          console.log(123);
          this.loginUser.background_picture = res0.data;
        }
      }
    },
  },
});

export default UseStore;
