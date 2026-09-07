import axios from "axios";
import { API_BASE_URL } from "../Utils/appConstant";

axios.defaults.baseURL = API_BASE_URL;
axios.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    alert("An unexpected error occurrred.");
  }

  return Promise.reject(error);
});
export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  // Profile completion after an OTP signup sends only the fields it has, so
  // it needs PATCH - a PUT would blank every field it left out.
  patch: axios.patch,
  delete: axios.delete,
};
