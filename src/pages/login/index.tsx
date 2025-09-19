import logoImg from '../../assets/logo.svg'
import { Container } from '../../components/container'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../../services/firebaseConnection'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const schema = z.object({
    email: z.string().email('insira um email valido').nonempty('campo email obrigatorio'),
    password: z.string().nonempty('campo obrigatorio')
})

type FormData = z.infer<typeof schema>


export function Login(){
    const navigate = useNavigate()
    const {register, handleSubmit, formState:{errors}} = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: 'onChange'
    })

function onSubmit(data: FormData){
    signInWithEmailAndPassword(auth, data.email, data.password)
        .then((user)=>{
            toast.success('Entrou')
            navigate('/', {replace: true})
        })
        .catch(error => toast.error('Erro ao fazer o login'))
}

useEffect(()=>{
    async function handleLogout(){ //se caso o usuario esteja logado e decida ir para pagina de login ou register, ele é deslogado automaticamente
        await signOut(auth)
    }
    handleLogout();
    console.log('deslogado ok')
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
            
                <button type='submit' className='bg-zinc-900 w-full rounded-md text-white h-10 font-medium'>Acessar</button>     
            </form>
            <Link
             className=' font-medium'
             to='/register'>
                Clique aqui caso não possua uma conta
             </Link>
        </div>
      </Container>
    )
}