
import { Container } from "../../components/container"
import { DashboardHeader } from "../../components/panelheader"
import { FiTrash2 } from "react-icons/fi"
import { useContext, useEffect, useState } from "react"
import { getDocs, collection, query, where, deleteDoc, doc } from "firebase/firestore"
import { db, storage } from "../../services/firebaseConnection"
import { AuthContext } from "../../contexts/AuthContext"
import { ref, deleteObject} from 'firebase/storage'
import { Link } from "react-router-dom"

interface CarsProps{
    id: string;
    name: string;
    year: string;
    km: number;
    city: string;
    price: number | string;
    images: imageCarProps[];
    uid: string;
}

interface imageCarProps{
    name: string;
    uid: string;
    url: string;
}

export function DashBoard(){
const [cars, setCars] = useState<CarsProps[]>([])
const { user } = useContext(AuthContext)

    useEffect(()=>{
        function loadCars(){
                if(!user?.uid){
                    return
                }

          const carsRef = collection(db, 'cars')
          const queryRef = query(carsRef, where('uid', '==', user.uid))

            getDocs(queryRef)
              .then((snapshot)=>{
                  let listCars = [] as CarsProps[];
                  snapshot.forEach(doc => {
                      listCars.push({
                        id: doc.id,
                        name: doc.data().name,
                        year: doc.data().year,
                        km: doc.data().km,
                        city: doc.data().city,
                        price: doc.data().price,
                        images: doc.data().images,
                        uid: doc.data().uid,
                      })
                  })
                  setCars(listCars)
                  console.log(listCars)
              })
        }
        loadCars();
      }, [user])

      async function handleDeleteCar(car: CarsProps){
        let itemCar = car

        const docRef = doc(db, 'cars', itemCar.id)
            await deleteDoc(docRef)

            itemCar.images.map(async(image)=>{
                    let imagePath = `images/${image.uid}/${image.name}`
                    let imageRef = ref(storage, imagePath)
                    try{
                        await deleteObject(imageRef)
                        setCars(cars.filter(car => car.id !== itemCar.id))
                    }catch(err){
                        console.log(err)
                        alert('Erro ao deletar a imagem')
                    }
                    
                })
              
        
      }

    return(
       <Container>
            <DashboardHeader/>
            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car)=> (
                  <section  className="w-full  bg-white rounded-lg relative border-2" key={car.id}>
                  <button 
                  onClick={() => handleDeleteCar(car)}
                  className="absolute bg-white w-14 h-10 rounded-full flex items-center justify-center left-2 top-2 drop-shadow">
                      <FiTrash2 size={26} color="#000"/>
                  </button>
                  <img className="w-full h-72 object-cover rounded-lg mb-2"
                  src={car.images[0].url} 
                  alt="" />
                  <p className="font-bold mt-1 px-2 mb-2">{car.name}</p>
                  <div className="flex flex-col px-2">
                      <span>{car.year} | {car.km}</span>
                      <strong className="text-black font-bold mt-4">{car.price}</strong>
                  </div>
                 <div className="w-full h-6 bg-slate-200 mt-2">
                      <div className="px-2 pb-2 text-center">
                          <span className="text-black">
                             {car.city}
                          </span>
                      </div>
                 </div>
                 <Link to={`edit/${car.id}`}>
                    <button 
                    className="w-full bg-green-500 cursor-pointer p-2 font-medium text-white hover:opacity-90">Editar
                    </button>
                 </Link>
              </section>
              ))}
            </main>
       </Container>
    )
}