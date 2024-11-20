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
    color_list: [
      "badge-lg badge badge-success",
      "badge-lg badge badge-warning",
      "badge-lg badge badge-error",
      "badge-lg badge badge-",
    ],
    AlgorithmTagsRelation: [
      [
        {
          tag_id: 1,
          tag_name: "模拟",
        },
        // 填写你自己后台设定好的对应关系，私信我898561494@qq.com可以获取
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
        // 和上面一个道理
      ],
    ],
    // 支持语言
    languages_options: ["C", "C++", "Python3", "Java", "Go", "JavaScript"],
    // 代码提示信息，包括一些算法模版、自定义提示信息啥的
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
      // 和上面内容一个道理
    ],
    // 本人认为最好的代四种风格，可以自己修改代码模版
    themes_options: ["textmate", "eclipse", "twilight", "monokai"],
    // 代码模版
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
        'if __name__ == "__main__":\n' +
        "    a = int(input())\n" +
        "    b = int(input())\n" +
        "    print(a + b)",
      "",
      "",
      "Go",
      "JavaScript",
    ],
    // 各种状态码代表的缩写
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
    // 各种状态码对应的颜色状态，可以自己修改
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
    // 各个rating对应的颜色区别
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
    // 之后还会添加简答题、单选题、多选题功能，暂定！！！
    optionTypes: ["简答题", "单选题", "多选题", "编程大题"],
    currentRequest: 0,
    maxRequestCount: 2,
    currentLocation: "",
    // 当前用户的IP
    currentIp: "",
    // github授权登录地址
    githubBaseUrl: "https://github.com/login/oauth/authorize",
    // 填写自己的github账号获取的client_id
    client_id: "",
    // 回调时候返回的前端地址
    redirect_uri: "",
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
              // 放置自己的图床地址
              "";
          }
          if (
            this.loginUser.background_picture == null ||
            this.loginUser.background_picture == ""
          ) {
            // 放置自己的图床地址
            this.loginUser.background_picture = "";
          }
        }
      } else {
        this.loginUser = {
          uuid: -1,
          avatar:
            // 放置自己的图床地址
            "",
          background_picture:
            // 放置自己的图床地址
            "",
        } as User;
      }

      const res0 = await UserControllerService.userGetPictureByUserUsingGet();
      if (res0.code === 0) {
        if (res0.data !== "") {
          this.loginUser.background_picture = res0.data;
        }
      }
    },
    // 调用别人的API接口来获取IP再获取用户当前位置
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
