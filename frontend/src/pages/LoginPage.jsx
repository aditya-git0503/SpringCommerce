import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    axios
      .post("http://localhost:8080/auth/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log(response.data);
        localStorage.setItem("token", response.data.token);
        navigate("/products");
      });
  }

  return (
    <form onSubmit={handleLogin}>
      <label>User Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        placeholder="Enter email"
      ></input>
      <br></br>

      <label>User Password</label>
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        type="password"
        placeholder="Enter password"
      ></input>
      <br></br>

      <button type="submit">Login</button>
    </form>
  );
}
