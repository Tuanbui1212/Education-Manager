import { useState } from "react";
import StudentImage from "../assets/image/login-image.png";
import { CircleUserRound, LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDecodedToken } from "../utils/auth";
import { authService } from "../services/auth.service";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await authService.login(email, password);

      if (result) {
        console.log("Login successful:", result);
        localStorage.setItem("accessToken", result.data);
        navigate("/");
      }
    } catch (error: any) {
      alert(error.response.data.message || "Đăng nhập thất bại");
    }
  };

  const showTokenInfo = () => {
    const roleInfo = getDecodedToken();
    console.log("Decoded token info:", roleInfo);
  };
  showTokenInfo();

  return (
    <div className="min-h-screen w-full bg-primary flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-1/2  flex items-center justify-center bg-white relative">
          <img
            src={StudentImage}
            alt="Students Illustration"
            className="w-full h-full "
          />
        </div>

        <div className="w-full md:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl text-primary inline-block border-b-[3px] border-primary pb-1 tracking-wide font-bold">
              TN Education
            </h2>
          </div>

          <form className="space-y-10 max-w-md mx-auto w-full">
            {/* Input Email */}
            <div className="flex items-end gap-4">
              <CircleUserRound
                className="w-10 h-10 text-primary mb-1"
                strokeWidth={2.5}
              />

              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="w-full border-b-[3px] border-gray-300 py-2 text-xl text-gray-600 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex items-end gap-4">
              <LockIcon
                className="w-10 h-10 text-primary mb-1"
                strokeWidth={2.5}
              />

              <div className="flex-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full border-b-[3px] border-gray-300 py-2 text-xl text-gray-600 placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                className="w-full bg-primary text-white font-bold text-2xl py-4 rounded-full shadow-lg hover:opacity-90 transition transform active:scale-95"
                onClick={(e) => handleLogin(e)}
              >
                ĐĂNG NHẬP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
