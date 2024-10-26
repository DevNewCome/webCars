import logoImg from '../../assets/logo.svg'
import { Container } from '../../components/container'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { auth } from '../../services/firebaseConnection'
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { useEffect, useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const schema = z.object({
    name: z.string().nonempty('o campo não pode ser vázio'),
    email: z.string().email('insira um email valido').nonempty('campo email obrigatorio'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').nonempty('campo obrigatorio')
})

type FormData = z.infer<typeof schema>


export function Register(){
    const {handleInfoUser} = useContext(AuthContext)
    const navigate = useNavigate()
    const {register, handleSubmit, formState:{errors}} = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    })

async function onSubmit(data: FormData){
    createUserWithEmailAndPassword(auth, data.email, data.password)
        .then(async(user)=>{
            await updateProfile(user.user, {
                displayName: data.name
            })
            handleInfoUser({
                name: data.name,
                email:data.email,
                uid:user.user.uid
            })
            toast.success('Bem vindo ao site')
            navigate('/dashboard', {replace: true})  
        })
        .catch((error) => console.log(error))
}

useEffect(()=>{
    async function handleLogout(){ //se caso o usuario esteja logado e decida ir para pagina de login ou register, ele é deslogado automaticamente
        await signOut(auth)
    }
    handleLogout
}, [])


    return(
      <Container>
        <div className=' w-full min-h-screen flex justify-center items-center flex-col gap-4'>
            <Link className='mb-6 max-w-sm w-full' to='/'>
                <img
                src={logoImg}
                alt='logo do site'
                className='w-full'
                />
            </Link>
            <form 
            onSubmit={handleSubmit(onSubmit)}
            className='bg-white max-w-xl w-full rounded-lg p-4'>

            
                <div className='mb-3'>
                    <Input 
                    type= 'name' 
                    placeholder='Digite seu nome' 
                    name='name'
                    error={errors.name?.message} 
                    register={register}   
                />   
                </div>
                <div className='mb-3'>
                    <Input 
                    type= 'email' 
                    placeholder='Digite seu email' 
                    name='email'
                    error={errors.email?.message} 
                    register={register}   
                />   
                </div>
                    <div className='mb-3'>
                    <Input 
                    type= 'password' 
                    placeholder='digite sua senha' 
                    name='password'
                    error={errors.password?.message} 
                    register={register}   
                />   
                </div>
                <button type='submit' className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium'>Cadastrar</button>  
            </form>
            <Link
             className=' font-medium'
             to='/login'>
                Clique aqui caso já possua uma conta para login
             </Link>
        </div>
      </Container>
    )
}