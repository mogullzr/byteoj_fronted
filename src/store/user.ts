import { defineStore } from "pinia";
import {CompetitionControllerService, User, UserControllerService} from "../../generated";
import axios from "axios";
import { ref } from "vue";
import router from "@/router";
import {useRoute} from "vue-router";

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
    source_List:  [
      "ByteOJ原创", "ByteOJ", "codeforces", "luogu", "leetcode", "牛客",
      ...Array.from({ length: 2027 - 1987 }, (_, i) => `${1987 + i}年数学考研真题`),
      ...Array.from({ length: 2027 - 2009 }, (_, i) => `${2009 + i}年408考研真题`),
      ...Array.from({ length: 2027 - 2010 }, (_, i) => `${2010 + i}年政治考研真题`)
    ],
    color_list: [
      "badge-lg badge badge-success",
      "badge-lg badge badge-warning",
      "badge-lg badge badge-error",
      "badge-lg badge badge-",
    ],
    AlgorithmTagsRelation: [
        [
            {
                "tag_id": -2,
                "tag_name": "语言入门（请选择[入门与面试]题库）（算法）"
            },
            {
                "tag_id": 1,
                "tag_name": "模拟（算法）"
            },
            {
                "tag_id": 2,
                "tag_name": "字符串（算法）"
            },
            {
                "tag_id": 3,
                "tag_name": "动态规划,dp（算法）"
            },
            {
                "tag_id": 4,
                "tag_name": "搜索（算法）"
            },
            {
                "tag_id": 5,
                "tag_name": "数学（算法）"
            },
            {
                "tag_id": 6,
                "tag_name": "图论（算法）"
            },
            {
                "tag_id": 7,
                "tag_name": "贪心（算法）"
            },
            {
                "tag_id": 8,
                "tag_name": "计算几何（算法）"
            },
            {
                "tag_id": 9,
                "tag_name": "暴力数据结构（算法）"
            },
            {
                "tag_id": 10,
                "tag_name": "高精度（算法）"
            },
            {
                "tag_id": 11,
                "tag_name": "树形数据结构（算法）"
            },
            {
                "tag_id": 12,
                "tag_name": "递推（算法）"
            },
            {
                "tag_id": 13,
                "tag_name": "博弈论（算法）"
            },
            {
                "tag_id": 41,
                "tag_name": "莫队（算法）"
            },
            {
                "tag_id": 42,
                "tag_name": "线段树（算法）"
            },
            {
                "tag_id": 43,
                "tag_name": "倍增（算法）"
            },
            {
                "tag_id": 44,
                "tag_name": "线性数据结构（算法）"
            },
            {
                "tag_id": 45,
                "tag_name": "二分（算法）"
            },
            {
                "tag_id": 47,
                "tag_name": "并查集（算法）"
            },
            {
                "tag_id": 49,
                "tag_name": "点分治（算法）"
            },
            {
                "tag_id": 50,
                "tag_name": "平衡树（算法）"
            },
            {
                "tag_id": 51,
                "tag_name": "堆（算法）"
            },
            {
                "tag_id": 53,
                "tag_name": "树状数组（算法）"
            },
            {
                "tag_id": 54,
                "tag_name": "递归（算法）"
            },
            {
                "tag_id": 55,
                "tag_name": "树上启发式合并（算法）"
            },
            {
                "tag_id": 56,
                "tag_name": "单调队列（算法）"
            },
            {
                "tag_id": 63,
                "tag_name": "LGV引理（算法）"
            },
            {
                "tag_id": 64,
                "tag_name": "矩阵树定理（算法）"
            },
            {
                "tag_id": 65,
                "tag_name": "珂朵莉树,颜色段均摊,ODT（算法）"
            },
            {
                "tag_id": 66,
                "tag_name": "原根（算法）"
            },
            {
                "tag_id": 67,
                "tag_name": "三分（算法）"
            },
            {
                "tag_id": 68,
                "tag_name": "Kruskal重构树（算法）"
            },
            {
                "tag_id": 69,
                "tag_name": "多项式（算法）"
            },
            {
                "tag_id": 71,
                "tag_name": "矩阵运算（算法）"
            },
            {
                "tag_id": 72,
                "tag_name": "数论（算法）"
            },
            {
                "tag_id": 78,
                "tag_name": "离散化（算法）"
            },
            {
                "tag_id": 79,
                "tag_name": "网络流（算法）"
            },
            {
                "tag_id": 100,
                "tag_name": "cdq分治（算法）"
            },
            {
                "tag_id": 101,
                "tag_name": "后缀自动机,SAM（算法）"
            },
            {
                "tag_id": 110,
                "tag_name": "基础算法（算法）"
            },
            {
                "tag_id": 111,
                "tag_name": "枚举（算法）"
            },
            {
                "tag_id": 112,
                "tag_name": "分治（算法）"
            },
            {
                "tag_id": 113,
                "tag_name": "排序（算法）"
            },
            {
                "tag_id": 122,
                "tag_name": "信息论（算法）"
            },
            {
                "tag_id": 126,
                "tag_name": "广度优先搜索,BFS（算法）"
            },
            {
                "tag_id": 127,
                "tag_name": "深度优先搜索,DFS（算法）"
            },
            {
                "tag_id": 128,
                "tag_name": "剪枝（算法）"
            },
            {
                "tag_id": 129,
                "tag_name": "记忆化搜索（算法）"
            },
            {
                "tag_id": 130,
                "tag_name": "启发式搜索（算法）"
            },
            {
                "tag_id": 131,
                "tag_name": "迭代加深搜索（算法）"
            },
            {
                "tag_id": 132,
                "tag_name": "启发式迭代加深搜索,IDA*（算法）"
            },
            {
                "tag_id": 133,
                "tag_name": "DancingLinks（算法）"
            },
            {
                "tag_id": 134,
                "tag_name": "爬山算法,Localsearch（算法）"
            },
            {
                "tag_id": 135,
                "tag_name": "模拟退火,SA（算法）"
            },
            {
                "tag_id": 136,
                "tag_name": "随机调整,Rounding（算法）"
            },
            {
                "tag_id": 137,
                "tag_name": "遗传算法（算法）"
            },
            {
                "tag_id": 138,
                "tag_name": "动态规划初步（算法）"
            },
            {
                "tag_id": 139,
                "tag_name": "背包（算法）"
            },
            {
                "tag_id": 141,
                "tag_name": "数位dp（算法）"
            },
            {
                "tag_id": 144,
                "tag_name": "区间dp（算法）"
            },
            {
                "tag_id": 146,
                "tag_name": "动态规划优化（算法）"
            },
            {
                "tag_id": 147,
                "tag_name": "降维（算法）"
            },
            {
                "tag_id": 148,
                "tag_name": "优先队列（算法）"
            },
            {
                "tag_id": 149,
                "tag_name": "矩阵加速（算法）"
            },
            {
                "tag_id": 150,
                "tag_name": "斜率优化（算法）"
            },
            {
                "tag_id": 151,
                "tag_name": "状态压缩（算法）"
            },
            {
                "tag_id": 152,
                "tag_name": "树形dp（算法）"
            },
            {
                "tag_id": 153,
                "tag_name": "凸完全单调性,wqs二分（算法）"
            },
            {
                "tag_id": 154,
                "tag_name": "四边形不等式（算法）"
            },
            {
                "tag_id": 155,
                "tag_name": "图论建模（算法）"
            },
            {
                "tag_id": 158,
                "tag_name": "图遍历（算法）"
            },
            {
                "tag_id": 159,
                "tag_name": "拓扑排序（算法）（算法）"
            },
            {
                "tag_id": 160,
                "tag_name": "最短路（算法）"
            },
            {
                "tag_id": 165,
                "tag_name": "K短路（算法）"
            },
            {
                "tag_id": 166,
                "tag_name": "生成树（算法）"
            },
            {
                "tag_id": 172,
                "tag_name": "平面图（算法）"
            },
            {
                "tag_id": 173,
                "tag_name": "最小环（算法）"
            },
            {
                "tag_id": 174,
                "tag_name": "负权环（算法）"
            },
            {
                "tag_id": 175,
                "tag_name": "连通块（算法）"
            },
            {
                "tag_id": 176,
                "tag_name": "2-SAT（算法）"
            },
            {
                "tag_id": 177,
                "tag_name": "欧拉公式（平面图）（算法）"
            },
            {
                "tag_id": 179,
                "tag_name": "强连通分量（算法）"
            },
            {
                "tag_id": 180,
                "tag_name": "Tarjan（算法）"
            },
            {
                "tag_id": 181,
                "tag_name": "双连通分量（算法）"
            },
            {
                "tag_id": 182,
                "tag_name": "欧拉回路（算法）"
            },
            {
                "tag_id": 185,
                "tag_name": "差分约束（算法）"
            },
            {
                "tag_id": 186,
                "tag_name": "仙人掌（算法）"
            },
            {
                "tag_id": 187,
                "tag_name": "二分图（算法）"
            },
            {
                "tag_id": 189,
                "tag_name": "一般图的最大匹配（算法）"
            },
            {
                "tag_id": 194,
                "tag_name": "最大流（算法）"
            },
            {
                "tag_id": 197,
                "tag_name": "上下界网络流（算法）"
            },
            {
                "tag_id": 198,
                "tag_name": "最小割（算法）"
            },
            {
                "tag_id": 202,
                "tag_name": "分数规划（算法）"
            },
            {
                "tag_id": 204,
                "tag_name": "费用流（算法）"
            },
            {
                "tag_id": 208,
                "tag_name": "树的遍历（算法）"
            },
            {
                "tag_id": 211,
                "tag_name": "最近公共祖先,LCA（算法）"
            },
            {
                "tag_id": 213,
                "tag_name": "树的直径（算法）"
            },
            {
                "tag_id": 214,
                "tag_name": "哈夫曼树（算法）"
            },
            {
                "tag_id": 215,
                "tag_name": "左偏树（算法）"
            },
            {
                "tag_id": 227,
                "tag_name": "动态树（算法）"
            },
            {
                "tag_id": 228,
                "tag_name": "树链剖分（算法）"
            },
            {
                "tag_id": 229,
                "tag_name": "Link-CutTree,LCT（算法）"
            },
            {
                "tag_id": 230,
                "tag_name": "树论（算法）"
            },
            {
                "tag_id": 231,
                "tag_name": "RMQ（算法）"
            },
            {
                "tag_id": 232,
                "tag_name": "树套树（算法）"
            },
            {
                "tag_id": 233,
                "tag_name": "可持久化线段树（算法）"
            },
            {
                "tag_id": 234,
                "tag_name": "可持久化（算法）"
            },
            {
                "tag_id": 235,
                "tag_name": "哈希,hash（算法）"
            },
            {
                "tag_id": 239,
                "tag_name": "素数判断,质数,筛法（算法）"
            },
            {
                "tag_id": 240,
                "tag_name": "众数（算法）"
            },
            {
                "tag_id": 241,
                "tag_name": "最大公约数,gcd（算法）"
            },
            {
                "tag_id": 242,
                "tag_name": "扩展欧几里德算法,exgcd（算法）"
            },
            {
                "tag_id": 243,
                "tag_name": "不定方程（算法）"
            },
            {
                "tag_id": 244,
                "tag_name": "进制（算法）"
            },
            {
                "tag_id": 245,
                "tag_name": "集合论（算法）"
            },
            {
                "tag_id": 246,
                "tag_name": "群论（算法）"
            },
            {
                "tag_id": 247,
                "tag_name": "置换（算法）"
            },
            {
                "tag_id": 248,
                "tag_name": "Pólya原理（算法）"
            },
            {
                "tag_id": 249,
                "tag_name": "虚树（算法）"
            },
            {
                "tag_id": 250,
                "tag_name": "中国剩余定理,CRT（算法）"
            },
            {
                "tag_id": 251,
                "tag_name": "莫比乌斯反演（算法）"
            },
            {
                "tag_id": 252,
                "tag_name": "组合数学（算法）"
            },
            {
                "tag_id": 253,
                "tag_name": "排列组合（算法）"
            },
            {
                "tag_id": 254,
                "tag_name": "前缀和（算法）"
            },
            {
                "tag_id": 255,
                "tag_name": "二项式定理（算法）"
            },
            {
                "tag_id": 256,
                "tag_name": "康托展开（算法）"
            },
            {
                "tag_id": 258,
                "tag_name": "鸽笼原理（算法）"
            },
            {
                "tag_id": 259,
                "tag_name": "容斥（算法）"
            },
            {
                "tag_id": 260,
                "tag_name": "斐波那契,Fibonacci（算法）"
            },
            {
                "tag_id": 261,
                "tag_name": "卡特兰数,Catalan（算法）"
            },
            {
                "tag_id": 262,
                "tag_name": "斯特林数,Stirling（算法）"
            },
            {
                "tag_id": 263,
                "tag_name": "A*算法（算法）"
            },
            {
                "tag_id": 264,
                "tag_name": "生成函数,GF（算法）"
            },
            {
                "tag_id": 265,
                "tag_name": "线性规划（算法）"
            },
            {
                "tag_id": 266,
                "tag_name": "概率论（算法）"
            },
            {
                "tag_id": 268,
                "tag_name": "条件概率（算法）"
            },
            {
                "tag_id": 270,
                "tag_name": "期望（算法）"
            },
            {
                "tag_id": 271,
                "tag_name": "线性代数（算法）"
            },
            {
                "tag_id": 272,
                "tag_name": "矩阵乘法（算法）"
            },
            {
                "tag_id": 273,
                "tag_name": "线性递推（算法）"
            },
            {
                "tag_id": 274,
                "tag_name": "高斯消元（算法）"
            },
            {
                "tag_id": 276,
                "tag_name": "逆元（算法）"
            },
            {
                "tag_id": 277,
                "tag_name": "线性基（算法）"
            },
            {
                "tag_id": 278,
                "tag_name": "微积分（算法）"
            },
            {
                "tag_id": 279,
                "tag_name": "极限（算法）"
            },
            {
                "tag_id": 280,
                "tag_name": "导数（算法）"
            },
            {
                "tag_id": 281,
                "tag_name": "积分（算法）"
            },
            {
                "tag_id": 282,
                "tag_name": "定积分（算法）"
            },
            {
                "tag_id": 283,
                "tag_name": "立体解析几何（算法）"
            },
            {
                "tag_id": 284,
                "tag_name": "级数（算法）"
            },
            {
                "tag_id": 286,
                "tag_name": "向量（算法）（算法）"
            },
            {
                "tag_id": 287,
                "tag_name": "栈（算法）（算法）"
            },
            {
                "tag_id": 288,
                "tag_name": "队列（算法）"
            },
            {
                "tag_id": 289,
                "tag_name": "分块（算法）"
            },
            {
                "tag_id": 290,
                "tag_name": "st表（算法）"
            },
            {
                "tag_id": 291,
                "tag_name": "凸包（算法）"
            },
            {
                "tag_id": 292,
                "tag_name": "叉积（算法）"
            },
            {
                "tag_id": 293,
                "tag_name": "线段相交（算法）"
            },
            {
                "tag_id": 294,
                "tag_name": "点积（算法）"
            },
            {
                "tag_id": 295,
                "tag_name": "半平面交（算法）"
            },
            {
                "tag_id": 297,
                "tag_name": "凸多边形的交（算法）"
            },
            {
                "tag_id": 298,
                "tag_name": "离散化扫描（算法）"
            },
            {
                "tag_id": 299,
                "tag_name": "旋转卡壳（算法）"
            },
            {
                "tag_id": 300,
                "tag_name": "字典树,Trie（算法）"
            },
            {
                "tag_id": 301,
                "tag_name": "AC自动机（算法）"
            },
            {
                "tag_id": 302,
                "tag_name": "KMP（算法）"
            },
            {
                "tag_id": 303,
                "tag_name": "后缀数组,SA（算法）"
            },
            {
                "tag_id": 304,
                "tag_name": "后缀树（算法）"
            },
            {
                "tag_id": 305,
                "tag_name": "有限状态自动机（算法）"
            },
            {
                "tag_id": 308,
                "tag_name": "其它技巧（算法）"
            },
            {
                "tag_id": 309,
                "tag_name": "随机化（算法）"
            },
            {
                "tag_id": 310,
                "tag_name": "Nim游戏（算法）"
            },
            {
                "tag_id": 311,
                "tag_name": "博弈树（算法）"
            },
            {
                "tag_id": 313,
                "tag_name": "快速傅里叶变换FFT（算法）"
            },
            {
                "tag_id": 314,
                "tag_name": "位运算（算法）"
            },
            {
                "tag_id": 316,
                "tag_name": "整体二分（算法）"
            },
            {
                "tag_id": 318,
                "tag_name": "构造（算法）"
            },
            {
                "tag_id": 320,
                "tag_name": "基环树（算法）"
            },
            {
                "tag_id": 321,
                "tag_name": "K-DTree（算法）"
            },
            {
                "tag_id": 322,
                "tag_name": "Lucas定理（算法）"
            },
            {
                "tag_id": 323,
                "tag_name": "插头dp（算法）"
            },
            {
                "tag_id": 324,
                "tag_name": "快速数论变换NTT（算法）"
            },
            {
                "tag_id": 325,
                "tag_name": "回文自动机,PAM（算法）"
            },
            {
                "tag_id": 326,
                "tag_name": "快速沃尔什变换,FWT（算法）"
            },
            {
                "tag_id": 327,
                "tag_name": "快速莫比乌斯变换,FMT（算法）"
            },
            {
                "tag_id": 329,
                "tag_name": "Manacher算法（算法）"
            },
            {
                "tag_id": 330,
                "tag_name": "差分（算法）"
            },
            {
                "tag_id": 345,
                "tag_name": "双指针,two-pointer（算法）"
            },
            {
                "tag_id": 349,
                "tag_name": "插值（算法）"
            },
            {
                "tag_id": 350,
                "tag_name": "圆方树（算法）"
            },
            {
                "tag_id": 353,
                "tag_name": "顺序结构（算法）"
            },
            {
                "tag_id": 354,
                "tag_name": "分支结构（算法）"
            },
            {
                "tag_id": 355,
                "tag_name": "循环结构（算法）"
            },
            {
                "tag_id": 356,
                "tag_name": "数组（算法）"
            },
            {
                "tag_id": 357,
                "tag_name": "字符串（入门）（算法）"
            },
            {
                "tag_id": 358,
                "tag_name": "结构体（算法）"
            },
            {
                "tag_id": 359,
                "tag_name": "函数与递归（算法）"
            },
            {
                "tag_id": 360,
                "tag_name": "链表（算法）（算法）"
            },
            {
                "tag_id": 364,
                "tag_name": "Dilworth定理（算法）"
            },
            {
                "tag_id": 365,
                "tag_name": "Ad-hoc（算法）"
            },
            {
                "tag_id": 368,
                "tag_name": "笛卡尔树（算法）"
            },
            {
                "tag_id": 369,
                "tag_name": "拟阵（算法）"
            },
            {
                "tag_id": 370,
                "tag_name": "Nim积（算法）"
            },
            {
                "tag_id": 371,
                "tag_name": "根号分治（算法）"
            },
            {
                "tag_id": 372,
                "tag_name": "拉格朗日反演（算法）"
            },
            {
                "tag_id": 373,
                "tag_name": "模拟费用流（算法）"
            },
            {
                "tag_id": 374,
                "tag_name": "分散层叠（算法）"
            },
            {
                "tag_id": 375,
                "tag_name": "均摊分析（算法）"
            },
            {
                "tag_id": 376,
                "tag_name": "分类讨论（算法）"
            },
            {
                "tag_id": 377,
                "tag_name": "李超线段树（算法）"
            },
            {
                "tag_id": 378,
                "tag_name": "吉司机线段树,SegmentTreeBeats（算法）"
            },
            {
                "tag_id": 379,
                "tag_name": "线段树合并（算法）"
            },
            {
                "tag_id": 380,
                "tag_name": "折半搜索,MeetInTheMiddle（算法）"
            },
            {
                "tag_id": 382,
                "tag_name": "动态树分治（算法）"
            },
            {
                "tag_id": 385,
                "tag_name": "单调栈（算法）"
            },
            {
                "tag_id": 387,
                "tag_name": "杨表（算法）"
            },
            {
                "tag_id": 388,
                "tag_name": "类欧几里得算法（算法）"
            },
            {
                "tag_id": 391,
                "tag_name": "Berlekamp-Massey算法,BM（算法）"
            },
            {
                "tag_id": 396,
                "tag_name": "梯度下降法（算法）"
            },
            {
                "tag_id": 410,
                "tag_name": "Prüfer序列（算法）"
            },
            {
                "tag_id": 411,
                "tag_name": "调和级数（算法）"
            },
            {
                "tag_id": 412,
                "tag_name": "拉格朗日乘数法（算法）"
            },
            {
                "tag_id": 413,
                "tag_name": "近似算法（算法）"
            },
            {
                "tag_id": 414,
                "tag_name": "随机算法（算法）"
            },
            {
                "tag_id": 415,
                "tag_name": "欧拉降幂（算法）"
            },
            {
                "tag_id": 416,
                "tag_name": "集合幂级数,子集卷积（算法）"
            },
            {
                "tag_id": 417,
                "tag_name": "拉格朗日插值法（算法）"
            },
            {
                "tag_id": 418,
                "tag_name": "欧拉定理（数论）（算法）"
            },
            {
                "tag_id": 419,
                "tag_name": "Lyndon分解（算法）"
            },
            {
                "tag_id": 423,
                "tag_name": "Stern-Brocot树（算法）"
            },
            {
                "tag_id": 424,
                "tag_name": "单链表（算法）"
            },
            {
                "tag_id": 425,
                "tag_name": "双链表（算法）"
            },
            {
                "tag_id": 426,
                "tag_name": "循环队列（算法）"
            },
            {
                "tag_id": 427,
                "tag_name": "树（算法）"
            },
            {
                "tag_id": 428,
                "tag_name": "Huffman树（算法）"
            },
            {
                "tag_id": 429,
                "tag_name": "DFS（算法）（算法）"
            },
            {
                "tag_id": 430,
                "tag_name": "BFS（算法）"
            },
            {
                "tag_id": 431,
                "tag_name": "Dijkstra（算法）"
            },
            {
                "tag_id": 432,
                "tag_name": "Bellman-ford（算法）"
            },
            {
                "tag_id": 433,
                "tag_name": "Spfa（算法）"
            },
            {
                "tag_id": 434,
                "tag_name": "Flody（算法）"
            },
            {
                "tag_id": 435,
                "tag_name": "Prim（算法）"
            },
            {
                "tag_id": 436,
                "tag_name": "Kruskal（算法）"
            },
            {
                "tag_id": 437,
                "tag_name": "染色法（算法）"
            },
            {
                "tag_id": 438,
                "tag_name": "匈牙利算法（算法）"
            },
            {
                "tag_id": 439,
                "tag_name": "LCA（算法）"
            },
            {
                "tag_id": 440,
                "tag_name": "单源最短路（算法）"
            },
            {
                "tag_id": 441,
                "tag_name": "双指针（算法）"
            },
            {
                "tag_id": 442,
                "tag_name": "区间合并（算法）"
            },
            {
                "tag_id": 443,
                "tag_name": "快速排序（算法）（算法）"
            },
            {
                "tag_id": 444,
                "tag_name": "冒泡排序（算法）"
            },
            {
                "tag_id": 445,
                "tag_name": "捅排序（算法）"
            },
            {
                "tag_id": 446,
                "tag_name": "计数排序（算法）"
            },
            {
                "tag_id": 447,
                "tag_name": "归并排序（算法）（算法）"
            },
            {
                "tag_id": 448,
                "tag_name": "堆排序（算法）"
            },
            {
                "tag_id": 449,
                "tag_name": "数学知识（算法）"
            },
            {
                "tag_id": 450,
                "tag_name": "欧拉函数（算法）"
            },
            {
                "tag_id": 451,
                "tag_name": "质数（算法）"
            },
            {
                "tag_id": 452,
                "tag_name": "约数（算法）"
            },
            {
                "tag_id": 453,
                "tag_name": "埃式筛法（算法）"
            },
            {
                "tag_id": 454,
                "tag_name": "快速幂（算法）"
            },
            {
                "tag_id": 455,
                "tag_name": "扩展欧几里得定理（算法）"
            },
            {
                "tag_id": 456,
                "tag_name": "中国剩余定理（算法）"
            },
            {
                "tag_id": 457,
                "tag_name": "容斥原理（算法）"
            },
            {
                "tag_id": 458,
                "tag_name": "同余（算法）"
            },
            {
                "tag_id": 459,
                "tag_name": "概率与数学期望（算法）"
            },
            {
                "tag_id": 460,
                "tag_name": "排序不等式（算法）"
            },
            {
                "tag_id": 461,
                "tag_name": "绝对值不等式（算法）"
            },
            {
                "tag_id": 462,
                "tag_name": "数学公式推导（算法）"
            },
            {
                "tag_id": 463,
                "tag_name": "可持久数据结构（算法）"
            },
            {
                "tag_id": 464,
                "tag_name": "Flood fill（算法）"
            },
            {
                "tag_id": 465,
                "tag_name": "多源BFS（算法）"
            },
            {
                "tag_id": 466,
                "tag_name": "最小步数模型（算法）"
            },
            {
                "tag_id": 467,
                "tag_name": "双端队列广搜（算法）"
            },
            {
                "tag_id": 468,
                "tag_name": "双向广搜（算法）"
            },
            {
                "tag_id": 469,
                "tag_name": "A*（算法）"
            },
            {
                "tag_id": 470,
                "tag_name": "DFS之连通性模型（算法）"
            },
            {
                "tag_id": 471,
                "tag_name": "DFS之搜索顺序（算法）"
            },
            {
                "tag_id": 472,
                "tag_name": "DFS之剪枝与优化（算法）"
            },
            {
                "tag_id": 473,
                "tag_name": "迭代加深（算法）"
            },
            {
                "tag_id": 474,
                "tag_name": "双向DFS（算法）"
            },
            {
                "tag_id": 475,
                "tag_name": "IDA*（算法）"
            },
            {
                "tag_id": 477,
                "tag_name": "单调队列优化DP（算法）"
            },
            {
                "tag_id": 478,
                "tag_name": "斜率优化DP（算法）"
            },
            {
                "tag_id": 479,
                "tag_name": "Trie（算法）"
            },
            {
                "tag_id": 1000,
                "tag_name": "高等数学（数学考研）"
            },
            {
                "tag_id": 1001,
                "tag_name": "多元函数微分学（数学考研）"
            },
            {
                "tag_id": 1002,
                "tag_name": "多元函数微分学的几何应用（数学考研）"
            },
            {
                "tag_id": 1003,
                "tag_name": "一元函数微分学（数学考研）"
            },
            {
                "tag_id": 1004,
                "tag_name": "函数的单调性、极值与最值（数学考研）"
            },
            {
                "tag_id": 1005,
                "tag_name": "一元函数积分学（数学考研）"
            },
            {
                "tag_id": 1006,
                "tag_name": "定积分的应用（数学考研）"
            },
            {
                "tag_id": 1007,
                "tag_name": "多元函数积分学（数学考研）"
            },
            {
                "tag_id": 1008,
                "tag_name": "第二类曲线积分（数学考研）"
            },
            {
                "tag_id": 1009,
                "tag_name": "线性代数（数学考研）"
            },
            {
                "tag_id": 1010,
                "tag_name": "向量（数学考研）"
            },
            {
                "tag_id": 1011,
                "tag_name": "向量组之间的线性表示（数学考研）"
            },
            {
                "tag_id": 1012,
                "tag_name": "变限积分（数学考研）"
            },
            {
                "tag_id": 1013,
                "tag_name": "偏导数的概念与计算（数学考研）"
            },
            {
                "tag_id": 1014,
                "tag_name": "矩阵（数学考研）"
            },
            {
                "tag_id": 1015,
                "tag_name": "伴随矩阵与可逆矩阵（数学考研）"
            },
            {
                "tag_id": 1016,
                "tag_name": "常微分方程（数学考研）"
            },
            {
                "tag_id": 1017,
                "tag_name": "常系数非齐次线性微分方程（数学考研）"
            },
            {
                "tag_id": 1018,
                "tag_name": "无穷级数（数学考研）"
            },
            {
                "tag_id": 1019,
                "tag_name": "常数项级数敛散性的判定（数学考研）"
            },
            {
                "tag_id": 1020,
                "tag_name": "求幂级数的收敛半径、收敛区间和收敛域（数学考研）"
            },
            {
                "tag_id": 1021,
                "tag_name": "第二类曲面积分（数学考研）"
            },
            {
                "tag_id": 1022,
                "tag_name": "方程根的存在性与个数（数学考研）"
            },
            {
                "tag_id": 1023,
                "tag_name": "线性方程组（数学考研）"
            },
            {
                "tag_id": 1024,
                "tag_name": "概率论与数理统计（数学考研）"
            },
            {
                "tag_id": 1025,
                "tag_name": "随机事件和概率（数学考研）"
            },
            {
                "tag_id": 1026,
                "tag_name": "随机变量的数字特征（数学考研）"
            },
            {
                "tag_id": 1027,
                "tag_name": "数学期望与方差（数学考研）"
            },
            {
                "tag_id": 1028,
                "tag_name": "多维随机变量及其分布（数学考研）"
            },
            {
                "tag_id": 1029,
                "tag_name": "二维随机变量及其分布（数学考研）"
            },
            {
                "tag_id": 1030,
                "tag_name": "定积分的计算（数学考研）"
            },
            {
                "tag_id": 1031,
                "tag_name": "矩阵的特征值与特征向量（数学考研）"
            },
            {
                "tag_id": 1032,
                "tag_name": "导数与微分的计算（数学考研）"
            },
            {
                "tag_id": 1033,
                "tag_name": "导数的几何意义（数学考研）"
            },
            {
                "tag_id": 1034,
                "tag_name": "定积分的概念、性质及几何意义（数学考研）"
            },
            {
                "tag_id": 1035,
                "tag_name": "函数、极限、连续（数学考研）"
            },
            {
                "tag_id": 1036,
                "tag_name": "函数极限的计算（数学考研）"
            },
            {
                "tag_id": 1037,
                "tag_name": "不定积分的计算（数学考研）"
            },
            {
                "tag_id": 1038,
                "tag_name": "一阶非齐次线性微分方程（数学考研）"
            },
            {
                "tag_id": 1039,
                "tag_name": "函数的连续性（数学考研）"
            },
            {
                "tag_id": 1040,
                "tag_name": "导数与微分的概念（数学考研）"
            },
            {
                "tag_id": 1041,
                "tag_name": "矩阵的秩（数学考研）"
            },
            {
                "tag_id": 1042,
                "tag_name": "随机变量及其分布（数学考研）"
            },
            {
                "tag_id": 1043,
                "tag_name": "微分中值定理（数学考研）"
            },
            {
                "tag_id": 1044,
                "tag_name": "反常积分的计算与敛散性（数学考研）"
            },
            {
                "tag_id": 1045,
                "tag_name": "高等数学（数学考研）"
            },
            {
                "tag_id": 1046,
                "tag_name": "多元函数微分学（数学考研）"
            },
            {
                "tag_id": 1047,
                "tag_name": "多元函数微分学的几何应用（数学考研）"
            },
            {
                "tag_id": 1048,
                "tag_name": "一元函数微分学（数学考研）"
            },
            {
                "tag_id": 1049,
                "tag_name": "函数的单调性、极值与最值（数学考研）"
            },
            {
                "tag_id": 1050,
                "tag_name": "一元函数积分学（数学考研）"
            },
            {
                "tag_id": 1051,
                "tag_name": "定积分的应用（数学考研）"
            },
            {
                "tag_id": 1052,
                "tag_name": "多元函数积分学（数学考研）"
            },
            {
                "tag_id": 1053,
                "tag_name": "第二类曲线积分（数学考研）"
            },
            {
                "tag_id": 1054,
                "tag_name": "线性代数（数学考研）"
            },
            {
                "tag_id": 1055,
                "tag_name": "向量（数学考研）"
            },
            {
                "tag_id": 1056,
                "tag_name": "向量组之间的线性表示（数学考研）"
            },
            {
                "tag_id": 1057,
                "tag_name": "变限积分（数学考研）"
            },
            {
                "tag_id": 1058,
                "tag_name": "偏导数的概念与计算（数学考研）"
            },
            {
                "tag_id": 1059,
                "tag_name": "矩阵（数学考研）"
            },
            {
                "tag_id": 1060,
                "tag_name": "伴随矩阵与可逆矩阵（数学考研）"
            },
            {
                "tag_id": 1061,
                "tag_name": "常微分方程（数学考研）"
            },
            {
                "tag_id": 1062,
                "tag_name": "常系数非齐次线性微分方程（数学考研）"
            },
            {
                "tag_id": 1063,
                "tag_name": "无穷级数（数学考研）"
            },
            {
                "tag_id": 1064,
                "tag_name": "常数项级数敛散性的判定（数学考研）"
            },
            {
                "tag_id": 1065,
                "tag_name": "求幂级数的收敛半径、收敛区间和收敛域（数学考研）"
            },
            {
                "tag_id": 1066,
                "tag_name": "第二类曲面积分（数学考研）"
            },
            {
                "tag_id": 1067,
                "tag_name": "方程根的存在性与个数（数学考研）"
            },
            {
                "tag_id": 1068,
                "tag_name": "线性方程组（数学考研）"
            },
            {
                "tag_id": 1069,
                "tag_name": "概率论与数理统计（数学考研）"
            },
            {
                "tag_id": 1070,
                "tag_name": "随机事件和概率（数学考研）"
            },
            {
                "tag_id": 1071,
                "tag_name": "随机变量的数字特征（数学考研）"
            },
            {
                "tag_id": 1072,
                "tag_name": "数学期望与方差（数学考研）"
            },
            {
                "tag_id": 1073,
                "tag_name": "多维随机变量及其分布（数学考研）"
            },
            {
                "tag_id": 1074,
                "tag_name": "二维随机变量及其分布（数学考研）"
            },
            {
                "tag_id": 1075,
                "tag_name": "定积分的计算（数学考研）"
            },
            {
                "tag_id": 1076,
                "tag_name": "矩阵的特征值与特征向量（数学考研）"
            },
            {
                "tag_id": 1077,
                "tag_name": "导数与微分的计算（数学考研）"
            },
            {
                "tag_id": 1078,
                "tag_name": "导数的几何意义（数学考研）"
            },
            {
                "tag_id": 1079,
                "tag_name": "定积分的概念、性质及几何意义（数学考研）"
            },
            {
                "tag_id": 1080,
                "tag_name": "函数、极限、连续（数学考研）"
            },
            {
                "tag_id": 1081,
                "tag_name": "函数极限的计算（数学考研）"
            },
            {
                "tag_id": 1082,
                "tag_name": "不定积分的计算（数学考研）"
            },
            {
                "tag_id": 1083,
                "tag_name": "一阶非齐次线性微分方程（数学考研）"
            },
            {
                "tag_id": 1084,
                "tag_name": "函数的连续性（数学考研）"
            },
            {
                "tag_id": 1085,
                "tag_name": "导数与微分的概念（数学考研）"
            },
            {
                "tag_id": 1086,
                "tag_name": "矩阵的秩（数学考研）"
            },
            {
                "tag_id": 1087,
                "tag_name": "缓冲区（408考研）"
            },
            {
                "tag_id": 1088,
                "tag_name": "入栈出栈序列（408考研）"
            },
            {
                "tag_id": 1089,
                "tag_name": "二叉树的遍历（408考研）"
            },
            {
                "tag_id": 1090,
                "tag_name": "平衡二叉树（408考研）"
            },
            {
                "tag_id": 1091,
                "tag_name": "完全二叉树（408考研）"
            },
            {
                "tag_id": 1092,
                "tag_name": "二叉树和森林的转换（408考研）"
            },
            {
                "tag_id": 1093,
                "tag_name": "图的概念（408考研）"
            },
            {
                "tag_id": 1094,
                "tag_name": "B树（408考研）"
            },
            {
                "tag_id": 1095,
                "tag_name": "堆的概念（408考研）"
            },
            {
                "tag_id": 1096,
                "tag_name": "排序算法（408考研）"
            },
            {
                "tag_id": 1097,
                "tag_name": "计算机结构（408考研）"
            },
            {
                "tag_id": 1098,
                "tag_name": "类型转换（408考研）"
            },
            {
                "tag_id": 1099,
                "tag_name": "补码（408考研）"
            },
            {
                "tag_id": 1100,
                "tag_name": "浮点数加减（408考研）"
            },
            {
                "tag_id": 1101,
                "tag_name": "cache映射方式（408考研）"
            },
            {
                "tag_id": 1102,
                "tag_name": "主存容量的扩展（408考研）"
            },
            {
                "tag_id": 1103,
                "tag_name": "指令寻址方式（408考研）"
            },
            {
                "tag_id": 1104,
                "tag_name": "复杂和精简指令集（408考研）"
            },
            {
                "tag_id": 1105,
                "tag_name": "控制器种类（408考研）"
            },
            {
                "tag_id": 1106,
                "tag_name": "流水线概念（408考研）"
            },
            {
                "tag_id": 1107,
                "tag_name": "总线指标（408考研）"
            },
            {
                "tag_id": 1108,
                "tag_name": "cache概念（408考研）"
            },
            {
                "tag_id": 1109,
                "tag_name": "异常和中断（408考研）"
            },
            {
                "tag_id": 1110,
                "tag_name": "操作系统概念（408考研）"
            },
            {
                "tag_id": 1111,
                "tag_name": "处理机调度算法（408考研）"
            },
            {
                "tag_id": 1112,
                "tag_name": "死锁概念（408考研）"
            },
            {
                "tag_id": 1113,
                "tag_name": "内存管理方式（408考研）"
            },
            {
                "tag_id": 1114,
                "tag_name": "段式内存管理（408考研）"
            },
            {
                "tag_id": 1115,
                "tag_name": "文件物理结构（408考研）"
            },
            {
                "tag_id": 1116,
                "tag_name": "磁盘调度算法（408考研）"
            },
            {
                "tag_id": 1117,
                "tag_name": "inode（408考研）"
            },
            {
                "tag_id": 1118,
                "tag_name": "文件链接（408考研）"
            },
            {
                "tag_id": 1119,
                "tag_name": "设备分配和回收（408考研）"
            },
            {
                "tag_id": 1120,
                "tag_name": "OSI模型（408考研）"
            },
            {
                "tag_id": 1121,
                "tag_name": "调制方法（408考研）"
            },
            {
                "tag_id": 1122,
                "tag_name": "ARQ协议（408考研）"
            },
            {
                "tag_id": 1123,
                "tag_name": "交换机（408考研）"
            },
            {
                "tag_id": 1124,
                "tag_name": "协议数据单元（408考研）"
            },
            {
                "tag_id": 1125,
                "tag_name": "CSMA/CD（408考研）"
            },
            {
                "tag_id": 1126,
                "tag_name": "TCP滑动窗口（408考研）"
            },
            {
                "tag_id": 1127,
                "tag_name": "TCP拥塞控制（408考研）"
            },
            {
                "tag_id": 1128,
                "tag_name": "FTP（408考研）"
            },
            {
                "tag_id": 1129,
                "tag_name": "最短路径（408考研）"
            },
            {
                "tag_id": 1130,
                "tag_name": "链表（408）（408考研）"
            },
            {
                "tag_id": 1131,
                "tag_name": "计算机性能指标（408考研）"
            },
            {
                "tag_id": 1132,
                "tag_name": "缓冲区（408考研）"
            },
            {
                "tag_id": 1133,
                "tag_name": "入栈出栈序列（408考研）"
            },
            {
                "tag_id": 1134,
                "tag_name": "二叉树的遍历（408考研）"
            },
            {
                "tag_id": 1135,
                "tag_name": "平衡二叉树（408考研）"
            },
            {
                "tag_id": 1136,
                "tag_name": "完全二叉树（408考研）"
            },
            {
                "tag_id": 1137,
                "tag_name": "二叉树和森林的转换（408考研）"
            },
            {
                "tag_id": 1138,
                "tag_name": "图的概念（408考研）"
            },
            {
                "tag_id": 1139,
                "tag_name": "B树（408考研）"
            },
            {
                "tag_id": 1140,
                "tag_name": "堆的概念（408考研）"
            },
            {
                "tag_id": 1141,
                "tag_name": "排序算法（408考研）"
            },
            {
                "tag_id": 1142,
                "tag_name": "计算机结构（408考研）"
            },
            {
                "tag_id": 1143,
                "tag_name": "类型转换（408考研）"
            },
            {
                "tag_id": 1144,
                "tag_name": "补码（408考研）"
            },
            {
                "tag_id": 1145,
                "tag_name": "浮点数加减（408考研）"
            },
            {
                "tag_id": 1146,
                "tag_name": "cache映射方式（408考研）"
            },
            {
                "tag_id": 1147,
                "tag_name": "主存容量的扩展（408考研）"
            },
            {
                "tag_id": 1148,
                "tag_name": "指令寻址方式（408考研）"
            },
            {
                "tag_id": 1149,
                "tag_name": "复杂和精简指令集（408考研）"
            },
            {
                "tag_id": 1150,
                "tag_name": "控制器种类（408考研）"
            },
            {
                "tag_id": 1151,
                "tag_name": "流水线概念（408考研）"
            },
            {
                "tag_id": 1152,
                "tag_name": "总线指标（408考研）"
            },
            {
                "tag_id": 1153,
                "tag_name": "cache概念（408考研）"
            },
            {
                "tag_id": 1154,
                "tag_name": "异常和中断（408考研）"
            },
            {
                "tag_id": 1155,
                "tag_name": "操作系统概念（408考研）"
            },
            {
                "tag_id": 1156,
                "tag_name": "处理机调度算法（408考研）"
            },
            {
                "tag_id": 1157,
                "tag_name": "死锁概念（408考研）"
            },
            {
                "tag_id": 1158,
                "tag_name": "内存管理方式（408考研）"
            },
            {
                "tag_id": 1159,
                "tag_name": "段式内存管理（408考研）"
            },
            {
                "tag_id": 1160,
                "tag_name": "文件物理结构（408考研）"
            },
            {
                "tag_id": 1161,
                "tag_name": "磁盘调度算法（408考研）"
            },
            {
                "tag_id": 1162,
                "tag_name": "inode（408考研）"
            },
            {
                "tag_id": 1163,
                "tag_name": "文件链接（408考研）"
            },
            {
                "tag_id": 1164,
                "tag_name": "设备分配和回收（408考研）"
            },
            {
                "tag_id": 1165,
                "tag_name": "OSI模型（408考研）"
            },
            {
                "tag_id": 1166,
                "tag_name": "调制方法（408考研）"
            },
            {
                "tag_id": 1167,
                "tag_name": "ARQ协议（408考研）"
            },
            {
                "tag_id": 1168,
                "tag_name": "交换机（408考研）"
            },
            {
                "tag_id": 1169,
                "tag_name": "协议数据单元（408考研）"
            },
            {
                "tag_id": 1170,
                "tag_name": "CSMA/CD（408考研）"
            },
            {
                "tag_id": 1171,
                "tag_name": "TCP滑动窗口（408考研）"
            },
            {
                "tag_id": 1172,
                "tag_name": "TCP拥塞控制（408考研）"
            },
            {
                "tag_id": 1173,
                "tag_name": "FTP（408考研）"
            },
            {
                "tag_id": 1174,
                "tag_name": "最短路径（408考研）"
            },
            {
                "tag_id": 1175,
                "tag_name": "链表（408）（408考研）"
            },
            {
                "tag_id": 1176,
                "tag_name": "计算机性能指标（408考研）"
            },
            {
                "tag_id": 1177,
                "tag_name": "中断IO（408考研）"
            },
            {
                "tag_id": 1178,
                "tag_name": "DMA（408考研）"
            },
            {
                "tag_id": 1179,
                "tag_name": "寄存器传送语言（408考研）"
            },
            {
                "tag_id": 1180,
                "tag_name": "同步问题设计（408考研）"
            },
            {
                "tag_id": 1181,
                "tag_name": "TLB（408考研）"
            },
            {
                "tag_id": 1182,
                "tag_name": "地址翻译（408考研）"
            },
            {
                "tag_id": 1183,
                "tag_name": "虚拟页式管理（408考研）"
            },
            {
                "tag_id": 1184,
                "tag_name": "路由器（408考研）"
            },
            {
                "tag_id": 1185,
                "tag_name": "子网划分（408考研）"
            },
            {
                "tag_id": 1186,
                "tag_name": "子网聚合（408考研）"
            },
            {
                "tag_id": 1187,
                "tag_name": "队列（408考研）"
            },
            {
                "tag_id": 1188,
                "tag_name": "线索二叉树（408考研）"
            },
            {
                "tag_id": 1189,
                "tag_name": "树的概念（408考研）"
            },
            {
                "tag_id": 1190,
                "tag_name": "哈夫曼树（408考研）"
            },
            {
                "tag_id": 1191,
                "tag_name": "拓扑排序（408）（408考研）"
            },
            {
                "tag_id": 1192,
                "tag_name": "数组查找（408考研）"
            },
            {
                "tag_id": 1193,
                "tag_name": "存储器概念（408考研）"
            },
            {
                "tag_id": 1194,
                "tag_name": "访存过程（408考研）"
            },
            {
                "tag_id": 1195,
                "tag_name": "寄存器类型（408考研）"
            },
            {
                "tag_id": 1196,
                "tag_name": "流水线冒险（408考研）"
            },
            {
                "tag_id": 1197,
                "tag_name": "总线类型（408考研）"
            },
            {
                "tag_id": 1198,
                "tag_name": "进程概念（408考研）"
            },
            {
                "tag_id": 1199,
                "tag_name": "信号量（408考研）"
            },
            {
                "tag_id": 1200,
                "tag_name": "软件互斥算法（408考研）"
            },
            {
                "tag_id": 1201,
                "tag_name": "动态内存管理（408考研）"
            },
            {
                "tag_id": 1202,
                "tag_name": "页表（408考研）"
            },
            {
                "tag_id": 1203,
                "tag_name": "目录（408考研）"
            },
            {
                "tag_id": 1204,
                "tag_name": "网络体系结构（408考研）"
            },
            {
                "tag_id": 1205,
                "tag_name": "交换方式（408考研）"
            },
            {
                "tag_id": 1206,
                "tag_name": "路由协议（408考研）"
            },
            {
                "tag_id": 1207,
                "tag_name": "ICMP（408考研）"
            },
            {
                "tag_id": 1208,
                "tag_name": "网络设备（408考研）"
            },
            {
                "tag_id": 1209,
                "tag_name": "DNS（408考研）"
            },
            {
                "tag_id": 1210,
                "tag_name": "散列表（408考研）"
            },
            {
                "tag_id": 1211,
                "tag_name": "平均查找长度（408考研）"
            },
            {
                "tag_id": 1212,
                "tag_name": "顺序表（408考研）"
            },
            {
                "tag_id": 1213,
                "tag_name": "指令种类（408考研）"
            },
            {
                "tag_id": 1214,
                "tag_name": "汇编代码（408考研）"
            },
            {
                "tag_id": 1215,
                "tag_name": "外存空间管理（408考研）"
            },
            {
                "tag_id": 1216,
                "tag_name": "页框分配和置换策略（408考研）"
            },
            {
                "tag_id": 1217,
                "tag_name": "CSMA/CD限制条件（408考研）"
            },
            {
                "tag_id": 1218,
                "tag_name": "复杂度分析（408考研）"
            },
            {
                "tag_id": 1219,
                "tag_name": "二叉排序树（408考研）"
            },
            {
                "tag_id": 1220,
                "tag_name": "指令执行指标（408考研）"
            },
            {
                "tag_id": 1221,
                "tag_name": "IEEE浮点数表示（408考研）"
            },
            {
                "tag_id": 1222,
                "tag_name": "标志寄存器（408考研）"
            },
            {
                "tag_id": 1223,
                "tag_name": "中断屏蔽（408考研）"
            },
            {
                "tag_id": 1224,
                "tag_name": "总线概念（408考研）"
            },
            {
                "tag_id": 1225,
                "tag_name": "多级中断（408考研）"
            },
            {
                "tag_id": 1226,
                "tag_name": "程序查询IO方式（408考研）"
            },
            {
                "tag_id": 1227,
                "tag_name": "用户态和内核态（408考研）"
            },
            {
                "tag_id": 1228,
                "tag_name": "进程和线程（408考研）"
            },
            {
                "tag_id": 1229,
                "tag_name": "IO软件层次（408考研）"
            },
            {
                "tag_id": 1230,
                "tag_name": "银行家算法（408考研）"
            },
            {
                "tag_id": 1231,
                "tag_name": "缺页异常（408考研）"
            },
            {
                "tag_id": 1232,
                "tag_name": "抖动（408考研）"
            },
            {
                "tag_id": 1233,
                "tag_name": "程序的链接（408考研）"
            },
            {
                "tag_id": 1234,
                "tag_name": "程序的装入（408考研）"
            },
            {
                "tag_id": 1235,
                "tag_name": "TCP/IP模型（408考研）"
            },
            {
                "tag_id": 1236,
                "tag_name": "介质访问控制（408考研）"
            },
            {
                "tag_id": 1237,
                "tag_name": "TCP三次握手（408考研）"
            },
            {
                "tag_id": 1238,
                "tag_name": "邻接矩阵（408考研）"
            },
            {
                "tag_id": 1239,
                "tag_name": "关键路径（408考研）"
            },
            {
                "tag_id": 1240,
                "tag_name": "归并排序（408）（408考研）"
            },
            {
                "tag_id": 1241,
                "tag_name": "ARP（408考研）"
            },
            {
                "tag_id": 1242,
                "tag_name": "HTTP（408考研）"
            },
            {
                "tag_id": 1243,
                "tag_name": "中缀转后缀（408考研）"
            },
            {
                "tag_id": 1244,
                "tag_name": "图的遍历（408考研）"
            },
            {
                "tag_id": 1245,
                "tag_name": "最小生成树（408考研）"
            },
            {
                "tag_id": 1246,
                "tag_name": "计算机体系结构（408考研）"
            },
            {
                "tag_id": 1247,
                "tag_name": "无符号数（408考研）"
            },
            {
                "tag_id": 1248,
                "tag_name": "数据对齐（408考研）"
            },
            {
                "tag_id": 1249,
                "tag_name": "总线事务（408考研）"
            },
            {
                "tag_id": 1250,
                "tag_name": "系统调用（408考研）"
            },
            {
                "tag_id": 1251,
                "tag_name": "进程状态（408考研）"
            },
            {
                "tag_id": 1252,
                "tag_name": "磁盘概念（408考研）"
            },
            {
                "tag_id": 1253,
                "tag_name": "物理层接口特性（408考研）"
            },
            {
                "tag_id": 1254,
                "tag_name": "以太网（408考研）"
            },
            {
                "tag_id": 1255,
                "tag_name": "信道利用率（408考研）"
            },
            {
                "tag_id": 1256,
                "tag_name": "网络号和主机号（408考研）"
            },
            {
                "tag_id": 1257,
                "tag_name": "电子邮件（408考研）"
            },
            {
                "tag_id": 1258,
                "tag_name": "驻留集（408考研）"
            },
            {
                "tag_id": 1259,
                "tag_name": "TCP首部（408考研）"
            },
            {
                "tag_id": 1260,
                "tag_name": "带权路径长度（408考研）"
            },
            {
                "tag_id": 1261,
                "tag_name": "差错控制（408考研）"
            },
            {
                "tag_id": 1262,
                "tag_name": "海明码（408考研）"
            },
            {
                "tag_id": 1263,
                "tag_name": "RAID（408考研）"
            },
            {
                "tag_id": 1264,
                "tag_name": "磁盘性能指标（408考研）"
            },
            {
                "tag_id": 1265,
                "tag_name": "文件概念（408考研）"
            },
            {
                "tag_id": 1266,
                "tag_name": "CHS地址（408考研）"
            },
            {
                "tag_id": 1267,
                "tag_name": "系统引导流程（408考研）"
            },
            {
                "tag_id": 1268,
                "tag_name": "处理机调度概念（408考研）"
            },
            {
                "tag_id": 1269,
                "tag_name": "传输介质（408考研）"
            },
            {
                "tag_id": 1270,
                "tag_name": "HDLC（408考研）"
            },
            {
                "tag_id": 1271,
                "tag_name": "指令格式（408考研）"
            },
            {
                "tag_id": 1272,
                "tag_name": "数据通路（408考研）"
            },
            {
                "tag_id": 1273,
                "tag_name": "路由聚合（408考研）"
            },
            {
                "tag_id": 1274,
                "tag_name": "前缀编码（408考研）"
            },
            {
                "tag_id": 1275,
                "tag_name": "希尔排序（408考研）"
            },
            {
                "tag_id": 1276,
                "tag_name": "快速排序（408）（408考研）"
            },
            {
                "tag_id": 1277,
                "tag_name": "微程序控制器（408考研）"
            },
            {
                "tag_id": 1278,
                "tag_name": "IO接口（408考研）"
            },
            {
                "tag_id": 1279,
                "tag_name": "死锁产生的必要条件（408考研）"
            },
            {
                "tag_id": 1280,
                "tag_name": "陷阱指令（408考研）"
            },
            {
                "tag_id": 1281,
                "tag_name": "位图法（408考研）"
            },
            {
                "tag_id": 1282,
                "tag_name": "Belady异常（408考研）"
            },
            {
                "tag_id": 1283,
                "tag_name": "进程间通信（408考研）"
            },
            {
                "tag_id": 1284,
                "tag_name": "香农定理（408考研）"
            },
            {
                "tag_id": 1285,
                "tag_name": "通信指标（408考研）"
            },
            {
                "tag_id": 1286,
                "tag_name": "CDMA（408考研）"
            },
            {
                "tag_id": 1287,
                "tag_name": "UDP（408考研）"
            },
            {
                "tag_id": 1288,
                "tag_name": "二叉树遍历（408考研）"
            },
            {
                "tag_id": 1289,
                "tag_name": "最长前缀匹配（408考研）"
            },
            {
                "tag_id": 1290,
                "tag_name": "指令操作码（408考研）"
            },
            {
                "tag_id": 1291,
                "tag_name": "栈（408）（408考研）"
            },
            {
                "tag_id": 1292,
                "tag_name": "卡特兰数（408考研）"
            },
            {
                "tag_id": 1293,
                "tag_name": "KMP算法（408考研）"
            },
            {
                "tag_id": 1294,
                "tag_name": "基数排序（408考研）"
            },
            {
                "tag_id": 1295,
                "tag_name": "cache写策略（408考研）"
            },
            {
                "tag_id": 1296,
                "tag_name": "总线定时（408考研）"
            },
            {
                "tag_id": 1297,
                "tag_name": "死锁的处理方法（408考研）"
            },
            {
                "tag_id": 1298,
                "tag_name": "页面置换算法（408考研）"
            },
            {
                "tag_id": 1299,
                "tag_name": "LRU（408考研）"
            },
            {
                "tag_id": 1300,
                "tag_name": "编码方法（408考研）"
            },
            {
                "tag_id": 1301,
                "tag_name": "DHCP（408考研）"
            },
            {
                "tag_id": 1302,
                "tag_name": "路由表（408考研）"
            },
            {
                "tag_id": 1303,
                "tag_name": "特殊矩阵（408考研）"
            },
            {
                "tag_id": 1304,
                "tag_name": "三对角矩阵（408考研）"
            },
            {
                "tag_id": 1305,
                "tag_name": "森林的概念（408考研）"
            },
            {
                "tag_id": 1306,
                "tag_name": "DFS（408）（408考研）"
            },
            {
                "tag_id": 1307,
                "tag_name": "邻接表（408考研）"
            },
            {
                "tag_id": 1308,
                "tag_name": "B+树（408考研）"
            },
            {
                "tag_id": 1309,
                "tag_name": "外部排序（408考研）"
            },
            {
                "tag_id": 1310,
                "tag_name": "大小端（408考研）"
            },
            {
                "tag_id": 1311,
                "tag_name": "单周期处理器（408考研）"
            },
            {
                "tag_id": 1312,
                "tag_name": "总线架构（408考研）"
            },
            {
                "tag_id": 1313,
                "tag_name": "死锁预防（408考研）"
            },
            {
                "tag_id": 1314,
                "tag_name": "临界资源（408考研）"
            },
            {
                "tag_id": 1315,
                "tag_name": "clock算法（408考研）"
            },
            {
                "tag_id": 1316,
                "tag_name": "硬件互斥指令（408考研）"
            },
            {
                "tag_id": 1317,
                "tag_name": "分段内存管理（408考研）"
            },
            {
                "tag_id": 1318,
                "tag_name": "进程的互斥（408考研）"
            },
            {
                "tag_id": 1319,
                "tag_name": "SPOOLing（408考研）"
            },
            {
                "tag_id": 1320,
                "tag_name": "管程（408考研）"
            },
            {
                "tag_id": 1321,
                "tag_name": "路由算法（408考研）"
            },
            {
                "tag_id": 1322,
                "tag_name": "文件分配表（408考研）"
            },
            {
                "tag_id": 1323,
                "tag_name": "哈夫曼编码（408考研）"
            },
            {
                "tag_id": 1324,
                "tag_name": "插入排序（408考研）"
            },
            {
                "tag_id": 1325,
                "tag_name": "指令体系结构（408考研）"
            },
            {
                "tag_id": 1326,
                "tag_name": "操作码扩展编码（408考研）"
            },
            {
                "tag_id": 1327,
                "tag_name": "超流水线（408考研）"
            },
            {
                "tag_id": 1328,
                "tag_name": "多重中断（408考研）"
            },
            {
                "tag_id": 1329,
                "tag_name": "时间片轮转（408考研）"
            },
            {
                "tag_id": 1330,
                "tag_name": "磁盘格式化（408考研）"
            },
            {
                "tag_id": 1331,
                "tag_name": "奈奎斯特定理（408考研）"
            },
            {
                "tag_id": 1332,
                "tag_name": "CSMA/CA（408考研）"
            },
            {
                "tag_id": 1333,
                "tag_name": "后序表达式求值（408考研）"
            },
            {
                "tag_id": 1334,
                "tag_name": "满二叉树（408考研）"
            },
            {
                "tag_id": 1335,
                "tag_name": "逻辑移位（408考研）"
            },
            {
                "tag_id": 1336,
                "tag_name": "条件变量（408考研）"
            },
            {
                "tag_id": 1337,
                "tag_name": "网络协议（408考研）"
            },
            {
                "tag_id": 1338,
                "tag_name": "MAC地址（408考研）"
            },
            {
                "tag_id": 1339,
                "tag_name": "IO方式（408考研）"
            },
            {
                "tag_id": 1340,
                "tag_name": "文件系统（408考研）"
            },
            {
                "tag_id": 1341,
                "tag_name": "IP数据报分片（408考研）"
            },
            {
                "tag_id": 1342,
                "tag_name": "树和二叉树的转换（408考研）"
            },
            {
                "tag_id": 1343,
                "tag_name": "图表示树（408考研）"
            },
            {
                "tag_id": 1344,
                "tag_name": "用户级和内核级线程（408考研）"
            },
            {
                "tag_id": 1345,
                "tag_name": "窗口大小限制（408考研）"
            },
            {
                "tag_id": 1346,
                "tag_name": "网络应用模型（408考研）"
            },
            {
                "tag_id": 1347,
                "tag_name": "机械硬盘（408考研）"
            },
            {
                "tag_id": 1348,
                "tag_name": "虚拟页式存储（408考研）"
            },
            {
                "tag_id": 1349,
                "tag_name": "NAT（408考研）"
            },
            {
                "tag_id": 1350,
                "tag_name": "二叉树存储（408考研）"
            },
            {
                "tag_id": 1351,
                "tag_name": "二叉树构建（408考研）"
            },
            {
                "tag_id": 1352,
                "tag_name": "单周期CPU（408考研）"
            },
            {
                "tag_id": 1353,
                "tag_name": "进程文件管理（408考研）"
            }
        ]
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
      // 678
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
      "import java.io.*;\n" +
      "import java.util.*;\n" +
      "\n" +
      "public class Main {\n" +
      "    public static void main(String args[]) throws Exception {\n" +
      "        Scanner cin=new Scanner(System.in);\n" +
      "        var a = cin.nextInt();\n" +
      "        var b = cin.nextInt();\n" +
      "        System.out.println(a + b);\n" +
      "    }\n" +
      "}",
      "package main\n" +
      "\n" +
      "import \"fmt\"\n" +
      "\n" +
      "func main() {\n" +
      "    var a, b int\n" +
      "    fmt.Scan(&a, &b)\n" +
      "    fmt.Println(a + b)\n" +
      "}",
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
    async isCompetition() {
      const res = await CompetitionControllerService.competitionUserStatusGetUsingPost();
      if (res.code === 0) {
        localStorage.setItem("CompetitionStatus", res.data);
      } else {
        localStorage.setItem("CompetitionStatus", "false");
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
