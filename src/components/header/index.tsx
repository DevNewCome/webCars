import { Link } from "react-router-dom"
import { FiUser, FiLogIn } from "react-icons/fi"
import  logoImg  from '../../assets/logo.svg'
import { useContext } from "react"
import { AuthContext } from "../../contexts/AuthContext"

export function Header(){
    const {signed, loading} = useContext(AuthContext)


    return(
        <div className=" w-full flex  items-center justify-center h-16 bg-white drop-shadow mb-4">
             <header className=" flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
            <Link to='/'>
            <img
                src={logoImg}
                alt="logo do site"
            />
            </Link>
           {!loading && signed ?(
             <Link to='/dashboard'>
                <div className=" border-2 rounded-full p-1 border-gray-900">
                    <FiUser size={24} color="#000"/>
                </div>  
             </Link>
           ):(
            <div className="flex gap-6">
            <Link to='/register'>
                 <button className=" font-medium text-xl text-slate-600 hover:text-slate-500">CADASTRE-SE</button>
            </Link> 
            <Link to='/login'>
                 <button className=" font-medium text-xl text-slate-600 hover:text-slate-500">ENTRAR</button>
            </Link> 
            </div>
       
           )}
        
        </header>
        </div>
       
    )
}