import HttpService from "./HttpService";

export async function registerUser(data) {
  const response = HttpService.post("register/", data);
  return response;
}

export async function loginUser(data) {
  const response = HttpService.post("login/", data);
  return response;
}
