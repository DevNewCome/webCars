import { Container } from "../../components/container"
import { useState, useEffect } from "react"
import { collection, query, getDocs, orderBy, where } from "firebase/firestore"
import { db } from "../../services/firebaseConnection"
import { Link } from "react-router-dom"

interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImageProps[];
  created: any;
}

interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Home() {
  const [cars, setCars] = useState<CarsProps[]>([])
  const [loadImages, setLoadImages] = useState<string[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    loadCars()
  }, [])

  async function loadCars() {
    const carsRef = collection(db, 'cars')
    const queryRef = query(carsRef, orderBy('created', 'desc'))
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

  function handleImageLoad(id: string) {
    setLoadImages(prev => [...prev, id])
  }

  async function handleSearchCar() {
    if (input === '') {
      loadCars()
      return;
    }
    setCars([])
    setLoadImages([])

    const q = query(
      collection(db, 'cars'),
      where('name', '>=', input.toUpperCase()),
      where('name', '<=', input.toUpperCase() + '\uf8ff')
    )
    const querySnapshot = await getDocs(q)
    const listCars: CarsProps[] = []

    querySnapshot.forEach(doc => {
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

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2 mb-6">
        <input
          className="w-full border border-gray-300 rounded-lg h-10 px-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite o nome do carro"
        />
        <button
          onClick={handleSearchCar}
          className="bg-red-500 h-10 px-6 rounded-lg text-white font-medium text-lg hover:opacity-90 transition"
        >
          Buscar
        </button>
      </section>

      <h1 className="font-bold text-center text-2xl mb-6">Carros novos e usados em todo Brasil</h1>

      <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map(car => (
          <Link key={car.id} to={`/car/${car.id}`}>
            <section className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div
                style={{ display: loadImages.includes(car.id) ? 'none' : 'block' }}
                className='w-full aspect-[4/3] bg-gray-200'
              />
              <img
                className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform cursor-pointer"
                src={car.images[0].url}
                onLoad={() => handleImageLoad(car.id)}
                style={{ display: loadImages.includes(car.id) ? 'block' : 'none' }}
                alt={car.name}
              />
              <div className="p-3 flex flex-col gap-1">
                <p className="font-bold text-lg">{car.name}</p>
                <p className="text-gray-500 text-sm">Criado em: {new Date(car.created?.seconds * 1000).toLocaleDateString()}</p>
                <span className="text-gray-700 text-sm">{car.year} | {car.km}</span>
                <strong className="text-black font-semibold text-xl">preço: {car.price}</strong>
                <span className="text-gray-600">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  )
}
