import { getDecodedToken } from "../utils/auth";

const HomePage = () => {
  const showTokenInfo = () => {
    const roleInfo = getDecodedToken();
    console.log("Decoded token info:", roleInfo);
  };
  showTokenInfo();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to the Education Management System
      </h1>
      <p className="text-lg text-gray-600">
        Manage your educational resources efficiently.
      </p>
    </div>
  );
};
export default HomePage;
