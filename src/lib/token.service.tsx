//@ts-nocheck
import secureLocalStorage from "react-secure-storage";

class TokenService {
  getToken() {
    const token = secureLocalStorage.getItem("token");

    return token;
  }

  getUser() {
    return JSON.parse(secureLocalStorage.getItem("user"));
  }

  getKpiUser() {
    return JSON.parse(secureLocalStorage.getItem("kpiUser"));
  }

  getOgid() {
    return this.getUser()?.employee_info?.ogid;
  }

  setUser(user) {
    secureLocalStorage.setItem("user", JSON.stringify(user));
  }

  setKpiUser(kpiUser) {
    secureLocalStorage.setItem("kpiUser", JSON.stringify(kpiUser));
  }

  setToken(token) {
    secureLocalStorage.setItem("token", token);
  }
  removeToken() {
    secureLocalStorage.removeItem("token");
  }
  removeUser() {
    secureLocalStorage.removeItem("user");
  }
  clearStorage() {
    secureLocalStorage.clear();
  }
  setAttendance(data) {
    secureLocalStorage.setItem("attendance", JSON.stringify(data));
  }
  getAttendance() {
    return JSON.parse(secureLocalStorage.getItem("attendance"));
  }
  removeAttendance() {
    secureLocalStorage.removeItem("attendance");
  }
}

export default new TokenService();
