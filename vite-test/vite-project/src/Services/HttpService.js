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
  delete: axios.delete,
};
