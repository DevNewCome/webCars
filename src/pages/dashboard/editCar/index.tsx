import { Container } from "../../../components/container";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input } from "../../../components/input";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../../services/firebaseConnection";
import { useForm } from "react-hook-form";
import { FiTrash } from "react-icons/fi";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidV4 } from "uuid";

interface CarsProps {
    id: string;
    name: string;
    year: string;
    km: number;
    city: string;
    price: number | string;
    images: imageCarProps[];
    uid: string;
}

interface imageCarProps {
    name: string;
    uid: string;
    url: string;
}

export function EditCar() {
    const [car, setCar] = useState<CarsProps | null>(null);
    const { id } = useParams();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CarsProps>();

    useEffect(() => {
        const getCar = async () => {
            if (!id) return;

            const carRef = doc(db, "cars", id);
            const carSnap = await getDoc(carRef);

            if (carSnap.exists()) {
                const carData = carSnap.data() as CarsProps;
                setCar(carData);

                setValue("name", carData.name);
                setValue("year", carData.year);
                setValue("km", carData.km);
                setValue("city", carData.city);
                setValue("price", carData.price);
            } else {
                console.log("Carro não encontrado");
            }
        };
        getCar();
    }, [id, setValue]);

    const onSubmit = async (data: CarsProps) => {
        if (!id) return;

        try {
            const carRef = doc(db, "cars", id);
            const { id: _, ...updatedData } = data;
            await updateDoc(carRef, updatedData as { [x: string]: any });
            alert("Carro atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar o carro:", error);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file || !car) return;

        const uidImage = uuidV4();
        const uploadRef = ref(storage, `images/${car.uid}/${uidImage}`);
        const snapshot = await uploadBytes(uploadRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        const newImage: imageCarProps = { name: uidImage, uid: car.uid, url: downloadUrl };

        const carRef = doc(db, "cars", id!);
        await updateDoc(carRef, { images: [...car.images, newImage] });
        setCar({ ...car, images: [...car.images, newImage] });
        alert("Imagem adicionada com sucesso!");
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDeleteImage = async (image: imageCarProps) => {
        if (!car) return;

        // Remove a imagem do Firestore
        const newImages = car.images.filter(img => img.name !== image.name);
        const carRef = doc(db, "cars", id!);
        
        // Exclui a imagem do Storage
        const imageRef = ref(storage, `images/${car.uid}/${image.name}`);
        await deleteObject(imageRef).catch((error) => console.error("Erro ao deletar a imagem:", error));
        
        // Atualiza o Firestore
        await updateDoc(carRef, { images: newImages });
        setCar({ ...car, images: newImages });
        alert("Imagem excluída com sucesso!");
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <Container>
                <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">Editando Carro</h1>
                
                {car && (
                    <div>
                        {/* Mostrar imagens cadastradas */}
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold mb-2">Imagens Cadastradas:</h2>
                            <div className="overflow-x-auto grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {car.images.map((image) => (
                                    <div key={image.name} className="relative">
                                        <img src={image.url} alt={image.name} className="w-full rounded-md h-48 object-cover" />
                                        <button 
                                            onClick={() => handleDeleteImage(image)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                        >
                                            <FiTrash size={26} color='#fff'/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Formulário para editar o carro */}
                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                            <div className="mb-4">
                                <Input 
                                    type="text"
                                    register={register}
                                    name="name"
                                    error={errors.name?.message}
                                    placeholder="Nome do carro"
                                />
                            </div>
                            <div className="mb-4">
                                <Input 
                                    type="text"
                                    register={register}
                                    name="year"
                                    error={errors.year?.message}
                                    placeholder="Ano"
                                />
                            </div>
                            <div className="mb-4">
                                <Input 
                                    type="number"
                                    register={register}
                                    name="km"
                                    error={errors.km?.message}
                                    placeholder="Kilometragem"
                                />
                            </div>
                            <div className="mb-4">
                                <Input 
                                    type="text"
                                    register={register}
                                    name="city"
                                    error={errors.city?.message}
                                    placeholder="Cidade"
                                />
                            </div>
                            <div className="mb-4">
                                <Input 
                                    type="text"
                                    register={register}
                                    name="price"
                                    error={errors.price?.message}
                                    placeholder="Preço"
                                />
                            </div>
                            <div className="mb-4">
                                <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                )}
            </Container>
        </div>
    );
}
