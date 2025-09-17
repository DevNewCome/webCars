import { ChangeEvent, useState, useContext, useEffect } from "react"
import { Container } from "../../../components/container"
import { DashboardHeader } from "../../../components/panelheader"
import { FiUpload, FiTrash } from "react-icons/fi"
import { useForm } from 'react-hook-form'
import { Input } from "../../../components/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { v4 as uuidV4 } from 'uuid'
import { AuthContext } from "../../../contexts/AuthContext"
import { storage, db } from '../../../services/firebaseConnection'
import { addDoc, collection } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import toast from 'react-hot-toast'


const schema = z.object({
  name: z.string().min(1, 'O campo nome é obrigatório'),
  model: z.string().min(1, 'insira um carro'),
  year: z.string().min(1, 'Ano do carro é obrigatorio'),
  km: z.string().min(1,'km do carro é obrigatorio'),
  price: z.string().min(1,'preço do carro é obrigatorio'),
  city: z.string().min(1,'a cidade é obrigatorio'),
  whatsapp: z.string().min(1,'o telefone é obrigatorio').refine((value) => /^(\d{11,12})$/.test(value),{
      message: 'Numero de telefone invalido'
  }),
  description: z.string().min(1, 'A descrição é obrigatória')
})

type FormData = z.infer<typeof schema>

interface ImageItemProps{
  uid:string;
  name:string;
  previewUrl: string;
  url: string
}

export function New(){
  const { user } = useContext(AuthContext)
  const {register, handleSubmit, formState: {errors}, reset, setValue} = useForm<FormData>({
      resolver: zodResolver(schema),
      mode: 'onChange'
  })

  const [carImages, setCarImage]  = useState<ImageItemProps[]>([])
  const [states, setStates] = useState<{id: number; sigla: string; nome: string}[]>([])
  const [cities, setCities] = useState<{id: number; nome: string}[]>([])
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")

  // buscar estados na API
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(err => console.log("Erro ao carregar estados", err))
  }, [])

  // buscar cidades do estado selecionado
  useEffect(() => {
    if(selectedState){
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(err => console.log("Erro ao carregar cidades", err))
    } else {
      setCities([])
    }
  }, [selectedState])

  async function handleUpload(image: File){
    if(!user?.uid){
        return
    }
    const currentUid = user?.uid;
    const uidImage = uuidV4()
    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)
    uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadUrl)=>{
                const imageItem = {
                    name: uidImage,
                    uid: currentUid,
                    previewUrl: URL.createObjectURL(image),
                    url: downloadUrl,
                }
                setCarImage((images) => [...images, imageItem])
                toast.success('imagem cadastrada com sucesso')
            })
        })
  }

  function onSubmit(data: FormData){
    if(carImages.length === 0){
        toast.error('Envie pelo menos 1 imagem')
        return
    }
    if(!selectedCity || !selectedState){
        toast.error('Selecione estado e cidade')
        return
    }

    const carListImages = carImages.map((car) => {
        return{
            uid: car.uid,
            name: car.name,
            url: car.url,                
        }
    })
    addDoc(collection(db, 'cars'),{
        name: data.name.toUpperCase(),
        model: data.model,
        whatsapp: data.whatsapp,
        description: data.description,
        city: `${selectedCity} - ${selectedState}`, // Salva formatado
        year: data.year,
        km: data.km,
        price: data.price,
        created: new Date(),
        owner: user?.name,
        uid: user?.uid,
        images: carListImages,
    })
    .then(()=>{
        reset();
        setCarImage([])
        setSelectedCity("")
        setSelectedState("")
        toast.success('Carro cadastrado com sucesso')
    }).catch((error)=>{
        console.log(error)
        alert('Erro ao cadastrar o carro')
        return
    })
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    if(e.target.files && e.target.files[0]){
        const image = e.target.files[0]
        if(image.type === 'image/jpeg' || image.type === 'image/png'){
          await handleUpload(image)
        }else{
            alert('Envie uma imagem valida')
            return
        }
    }
  }
  
  async function handleDeleteImage(item: ImageItemProps){
    const imagePath = `images/${item.uid}/${item.name}`
    const imageRef = ref(storage, imagePath)
        try{
            await deleteObject(imageRef)
            setCarImage(carImages.filter((car) => car.url !== item.url))
        }catch(err){
            console.log(err)
            alert('Erro ao deletar a imagem')
            return
        }
  }

  return(
    <Container>
        <DashboardHeader/> 
        <div className="w-full bg-white p-3 rounded-lg flex flex-wrap sm:flex-row items-center justify-center gap-2">
            {/* Botão de enviar fotos */}
            <button className={`border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 ${carImages.length ? 'self-start' : ''}`}>
                <div className="absolute cursor-pointer">
                <FiUpload size={30} color="#000" />
                </div>
                <div className="cursor-pointer">
                <input 
                    type="file"
                    accept="image/*"
                    className="opacity-0 cursor-pointer"
                    onChange={handleFile}
                />
                </div>
            </button>

            {/* Exibir imagens ao lado do botão */}
            {carImages.map(item => (
                <div key={item.name} className="relative w-32 h-32 flex items-center justify-center">
                <button className="absolute" onClick={() => handleDeleteImage(item)}>
                    <FiTrash size={28} color='#FFF' />
                </button>
                <img src={item.previewUrl} alt="foto do carro" className="rounded-lg w-full h-32 object-cover" />
                </div>
            ))}
        </div>

        <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2">
            <form 
            className="w-full"
            onSubmit={handleSubmit(onSubmit)}
            >
                <div className="mb-3">
                        <p className="mb-2 font-medium">Nome do carro</p>
                        <Input 
                            type="text"
                            register={register}
                            name="name"
                            error={errors.name?.message}
                            placeholder='Ex: Onix 1.0..'
                        />
                </div>
                <div className="mb-3">
                        <p className="mb-2 font-medium">Modelo do carro</p>
                        <Input 
                            type="text"
                            register={register}
                            name="model"
                            error={errors.model?.message}
                            placeholder='Ex: Flex PLUS MANUAL...'
                        />
                </div>
                <div className="flex w-full mb-3 flex-row items-center gap-4">
                <div className="w-full">
                        <p className="mb-2 font-medium">Ano do carro</p>
                        <Input 
                            type="text"
                            register={register}
                            name="year"
                            error={errors.year?.message}
                            placeholder='Ex: 2011'
                        />
                </div>
                <div className="w-full">
                        <p className="mb-2 font-medium">KM</p>
                        <Input 
                            type="text"
                            register={register}
                            name="km"
                            error={errors.km?.message}
                            placeholder='Ex: 89.000KM'
                        />
                </div>
                </div>
                <div className="flex w-full mb-3 flex-row items-center gap-4">
                <div className="w-full">
                        <p className="mb-2 font-medium">Telefone/WhatsApp</p>
                        <Input 
                            type="text"
                            register={register}
                            name="whatsapp"
                            error={errors.whatsapp?.message}
                            placeholder='Ex: 01198894546'
                        />
                </div>
                <div className="w-full">
                        <p className="mb-2 font-medium">Estado</p>
                        <select 
                          value={selectedState}
                          onChange={(e) => {
                            setSelectedState(e.target.value)
                            setSelectedCity("")
                          }}
                          className="border-2 w-full rounded-md h-10 px-2"
                        >
                          <option value="">Selecione o estado</option>
                          {states.map((uf) => (
                            <option key={uf.id} value={uf.sigla}>{uf.nome} - {uf.sigla}</option>
                          ))}
                        </select>
                    </div>
                <div className="w-full">
                        <p className="mb-2 font-medium">Cidade</p>
                        <select 
                          value={selectedCity}
                          onChange={(e) => {
                            setSelectedCity(e.target.value)
                            setValue("city", e.target.value)
                          }}
                          className="border-2 w-full rounded-md h-10 px-2"
                        >
                          <option value="">Selecione a cidade</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.nome}>{city.nome}</option>
                          ))}
                        </select>
                        {errors.city && <p className="mb-1 text-red-500">{errors.city.message}</p>}
                </div>
                </div>
                <div className="mb-3">
                        <p className="mb-2 font-medium">Preço</p>
                        <Input 
                            type="text"
                            register={register}
                            name="price"
                            error={errors.price?.message}
                            placeholder='Ex: 69.000'
                        />
                </div>
                <div className="mb-3">
                    <p className="mb-2 font-medium">Descrição do veiculo</p>
                    <textarea
                    className="border-2 w-full rounded-mb h-24 px-2"
                    {...register('description')}
                     name="description"
                     id="description"
                     placeholder="Digite a descrição do veiculo sobre o veiculo"
                    />
                    {errors.description && <p className="mb-1 text-red-500">{errors.description.message}</p>}
                </div>
                <button type="submit" className=" w-full h-10 rounded-md bg-zinc-900 text-white font-medium">
                    Cadastrar
                </button>
            </form>
        </div>
    </Container>
  )
}
