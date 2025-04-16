import { User } from "../../generated";
import { ACCESS_ENUM } from "./access.ts";

const checkAccess = (loginUser: User, needAccess = ACCESS_ENUM.NOT_LOGIN) => {
  // 获取当前用户具有权利（如果没有loginUser，就表示没有登录）
  const loginUserAccess = loginUser?.role ?? ACCESS_ENUM.NOT_LOGIN;
  //如果这个页面不需要权限，直接返回true
  if (needAccess == ACCESS_ENUM.NOT_LOGIN) {
    return true;
  }

  // 如果这个页面需要管理员登录才可以访问
  if (needAccess == ACCESS_ENUM.ADMIN) {
    // 若未登录，则返回false
    if (loginUserAccess != ACCESS_ENUM.ADMIN) {
      return false;
    }
    return true;
  }
};

export default checkAccess;
