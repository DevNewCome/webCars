import { ReactNode, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebaseConnection";
import { doc, getDoc } from "firebase/firestore";

type AuthContextData = {
  signed: boolean;
  loading: boolean;
  handleInfoUser: ({ name, email, uid }: UserProps) => void;
  user: UserProps | null;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  function handleInfoUser({ name, email, uid }: UserProps) {
    setUser({
      uid,
      name,
      email,
    });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 🔹 Busca no Firestore os dados do usuário
          const docRef = doc(db, "users", firebaseUser.uid);
          const snapshot = await getDoc(docRef);

          if (snapshot.exists()) {
            const userData = snapshot.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName || null,
            });
          } else {
            // fallback para os dados do Auth se não tiver no Firestore
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
            });
          }
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        loading,
        handleInfoUser,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
