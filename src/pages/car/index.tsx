import { useEffect, useState } from "react"
import { Container  } from '../../components/container'
import { FaWhatsapp } from "react-icons/fa"
import { useNavigate, useParams  } from 'react-router-dom'
import { getDoc, doc, } from "firebase/firestore"
import { db } from "../../services/firebaseConnection"
import { Swiper, SwiperSlide } from "swiper/react"
interface CarProps{
    id:string;
    name:string;
    model:string;
    city:string;
    year:string;
    km:string;
    description:string;
    created:string;
    price:string|number;
    owner:string;
    uid:string;
    whatsapp:string;
    images: imagesCarProps[]
}

interface imagesCarProps{
    uid:string;
    name:string;
    url:string;
}
export function Car(){
    const [car, setCar] = useState<CarProps | undefined>(undefined);
    const { id } = useParams()
    const [sliderPerView, setSliderPerview] = useState<number>(2)
    const navigate = useNavigate()

    useEffect(()=>{
        async function loadCar(){
            if(!id){
                return
            }
            const docRef = doc(db, 'cars', id)
            getDoc(docRef)
                .then((snapshot)=>{
                    if(!snapshot.exists() || Object.keys(snapshot.data()).length === 0){
                        console.log('nao existe')
                        navigate("/")
                    }
                    setCar({
                        id:snapshot.id,
                        uid:snapshot.data()?.uid,
                        name:snapshot.data()?.name,
                        model:snapshot.data()?.model,
                        city:snapshot.data()?.city,
                        year:snapshot.data()?.year,
                        km:snapshot.data()?.km,
                        description:snapshot.data()?.description,
                        created: snapshot.data()?.created,
                        price: snapshot.data()?.price,
                        owner: snapshot.data()?.owner,
                        whatsapp: snapshot.data()?.whatsapp,
                        images: snapshot.data()?.images
                    })
                })
        }
        loadCar()
    }, [id])


    useEffect(()=>{
        function handleResize(){
            if(window.innerWidth <= 720){
                setSliderPerview(1);
            }else if(window.innerWidth <= 1280){
                setSliderPerview(2)
            }else{
                setSliderPerview(3)
            }
        }
        handleResize();

        window.addEventListener('resize', handleResize)
        //evento js que cada vez q eu mudar o tamanho da dela, ele ira disparar esse useEffect, com o evento do resize

        return() => {
            window.removeEventListener('resize', handleResize)
            //quando o comoponente for desmontado, em oturas palavras, sair da pagina, removera o useEffect
        }
    },[])

    return(
       <Container>
          {car && (
              <Swiper
              slidesPerView={sliderPerView}
              pagination={{clickable:true}}
              >
                  {car?.images.map((image) =>(
                      <SwiperSlide key={image.name}>
                          <img src={image.url} alt={image.name} className="w-full h-96 object-cover rounded-lg"/>
                      </SwiperSlide>
                  ))}
              </Swiper>
          )}
            {car && (
                <main className="w-full bg-white rounded-lg p-6 my-4">
                    <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
                        <h1 className="font-bold text-3xl text-black">{car?.name}</h1>
                        <h1 className="font-bold text-3xl text-black">{car?.price}</h1>
                    </div>
                    <p>{car?.model}</p>

                    <div className="flex w-full gap-6 my-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p>Cidade</p>
                                <strong>{car?.city}</strong>
                            </div>
                            <div>
                                <p>Ano</p>
                                <strong>{car.year}</strong>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <p>KM</p>
                                <strong>{car?.km}</strong>
                            </div>
                        </div>
                    </div>
                    <strong>Descrição</strong>
                    <p className="mb-4">{car?.description}</p>

                    <strong>Telefone/whatsapp</strong>
                    <p>{car?.whatsapp}</p>

                    <a className="bg-green-500 w-full p-2  cursor-pointer text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium" 
                        target="_blank"
                        href={`https://api.whatsapp.com/send?phone=${car?.whatsapp}&text=Olá vi esse ${car.name} e fiquei interessado`}>
                        Conversar com o vendedor
                        <FaWhatsapp size={26} color='#fff' />
                    </a>
                </main>
            )}
       </Container>
    )
}