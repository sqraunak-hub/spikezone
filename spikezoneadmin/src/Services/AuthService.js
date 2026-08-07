import HttpService from "./HttpService";

export async function loginUser(data) {
  const response = await HttpService.post("login/", data);

  return response;
}
