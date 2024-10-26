import { ReactNode, createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConnection";

type AuthContextData = {
    signed: boolean;
    loading: boolean;
    handleInfoUser: ({name, email, uid}:UserProps) => void
    user: UserProps | null;
}


interface AuthProviderProps{
    children: ReactNode
}

interface UserProps{
    uid: string;
    name: string | null;
    email: string | null;
}

export const AuthContext = createContext({} as AuthContextData)


function AuthProvider({children}: AuthProviderProps){
const [user, setUser] = useState<UserProps | null>(null) //começa false
const [loading, setLoading] = useState(true)

function handleInfoUser({name, email, uid}: UserProps){
    setUser({
        uid,
        name,
        email
    })
}

useEffect(()=>{
    const unsub = onAuthStateChanged(auth, (user) => {

        if(user){
            setUser({
                uid: user.uid,            //lado esquerdo parte das props  
                name: user?.displayName, // lado direito é a parte do banco de dados
                email: user?.email
            })
            setLoading(false)
        }else{
            setUser(null)
            setLoading(false)
        }
    })
    return () => {
        unsub();
    }
},[])

    return(
       <AuthContext.Provider 
       value={{
        signed: !!user,
        loading,
        handleInfoUser,
        user,
        }}>
           {children}
       </AuthContext.Provider>
    )
}

export default AuthProvider