import axios from "axios";
//renvoyer le data vers backend
export default axios.create({
  baseURL: "http://localhost:3000/api",
});