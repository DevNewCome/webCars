import { Link } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import logoImg from "../../assets/logo.svg";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export function Header() {
  const { signed, loading, user } = useContext(AuthContext);

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
      <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
        <Link to="/">
          <img src={logoImg} alt="logo do site" />
        </Link>

        {!loading && signed ? (
          <div className="flex items-center gap-3">
            {/* 🔹 Mostra o nome do usuário */}
            <span className="font-medium text-gray-700">
              Olá, {user?.name || "Usuário"}
            </span>

            <Link to="/dashboard">
              <div className="border-2 rounded-full p-1 border-gray-900">
                <FiUser size={24} color="#000" />
              </div>
            </Link>
          </div>
        ) : (
          <div className="flex gap-6">
            <Link to="/register">
              <button className="font-medium text-xl hover:bg-gray-200 transition duration-300 ease-in-out text-gray-500  px-4 py-2 rounded-full flex items-center justify-center">
              Registre-se
            </button>
            </Link>
            <Link to="/login">
              <button className="font-medium text-xl hover:bg-gray-200 transition duration-300 ease-in-out text-gray-500  px-4 py-2 rounded-full flex items-center justify-center">
                Login
              </button>
            </Link>
          </div>
        )}
      </header>
    </div>
  );
}
