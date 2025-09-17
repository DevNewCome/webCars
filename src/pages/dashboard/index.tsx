import { Container } from "../../components/container"
import { DashboardHeader } from "../../components/panelheader"
import { FiTrash2 } from "react-icons/fi"
import { useContext, useEffect, useState } from "react"
import { getDocs, collection, query, where, deleteDoc, doc } from "firebase/firestore"
import { db, storage } from "../../services/firebaseConnection"
import { AuthContext } from "../../contexts/AuthContext"
import { ref, deleteObject } from "firebase/storage"
import { Link } from "react-router-dom"

interface CarsProps {
  id: string
  name: string
  year: string
  km: string
  city: string
  price: number | string
  images: imageCarProps[]
  uid: string
  created: any
}

interface imageCarProps {
  name: string
  uid: string
  url: string
}

export function DashBoard() {
  const [cars, setCars] = useState<CarsProps[]>([])
  const { user } = useContext(AuthContext)

  useEffect(() => {
    async function loadCars() {
      if (!user?.uid) return

      const carsRef = collection(db, "cars")
      const queryRef = query(carsRef, where("uid", "==", user.uid))
      const snapshot = await getDocs(queryRef)

      const listCars: CarsProps[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        listCars.push({
          id: doc.id,
          name: data.name,
          year: data.year,
          km: data.km,
          city: data.city,
          price: data.price,
          images: data.images,
          uid: data.uid,
          created: data.created
        })
      })
      setCars(listCars)
    }

    loadCars()
  }, [user])

  async function handleDeleteCar(car: CarsProps) {
    const docRef = doc(db, "cars", car.id)
    await deleteDoc(docRef)

    car.images.map(async image => {
      const imagePath = `images/${image.uid}/${image.name}`
      const imageRef = ref(storage, imagePath)
      try {
        await deleteObject(imageRef)
        setCars(prev => prev.filter(c => c.id !== car.id))
      } catch (err) {
        console.log(err)
        alert("Erro ao deletar a imagem")
      }
    })
  }

  return (
    <Container>
      <DashboardHeader />
      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.length > 0 ? (
          cars.map(car => (
            <section key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-lg transition-shadow duration-200">
              <button
                onClick={() => handleDeleteCar(car)}
                className="absolute bg-white w-12 h-10 rounded-full flex items-center justify-center left-2 top-2 drop-shadow hover:bg-red-500 hover:text-white transition"
              >
                <FiTrash2 size={24} />
              </button>
              <img className="w-full aspect-[4/3] object-cover" src={car.images[0].url} alt="" />
              <div className="p-3 flex flex-col gap-1">
                <p className="font-bold text-lg">{car.name}</p>
                <p className="text-gray-500 text-sm">Criado em: {new Date(car.created?.seconds * 1000).toLocaleDateString()}</p>
                <span className="text-gray-700 text-sm">{car.year} | {car.km}</span>
                <strong className="text-black font-semibold text-xl">preço: {car.price}</strong>
                <span className="text-gray-600">{car.city}</span>
              </div>
              <Link to={`edit/${car.id}`}>
                <button className="w-full bg-green-500 p-2 font-medium text-white hover:opacity-90 transition">Editar</button>
              </Link>
            </section>
          ))
        ) : (
          <div className="w-full col-span-full flex justify-center items-center mt-10">
            <p className="text-gray-500 font-bold text-2xl text-center">
              Ainda não há carros cadastrados.
            </p>
          </div>
        )}
      </main>
    </Container>
  )
}
