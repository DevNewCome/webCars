import { createBrowserRouter } from 'react-router-dom'
import { Home } from './pages/home'
import { Register } from './pages/register'
import { Layout } from './components/layout'
import { Login } from './pages/login'
import { ErrorPage } from './pages/404'
import { Car } from './pages/car'
import { DashBoard } from './pages/dashboard'
import { New } from './pages/dashboard/new'
import { EditCar } from './pages/dashboard/editCar'
import { Private } from './routes/Private'

const router = createBrowserRouter([
  {element: <Layout/>,
   children:[
    {path: '/', element: <Home/>},
    {path: '/car/:id', element: <Car/>},
    {path: '/dashboard', element: <Private><DashBoard/></Private>},
    {path: '/dashboard/new', element: <Private><New/></Private> },  
    {path: '/dashboard/edit/:id', element: <Private><EditCar/></Private> },  
    {path: '*', element: <ErrorPage/>}
   ]
},

{path: '/login', element: <Login/>},
{path: '/register', element: <Register/>},

])

export { router }
