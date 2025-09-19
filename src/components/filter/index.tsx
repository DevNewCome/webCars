import { useState } from "react"
import { useCities } from "../../hooks/useCities"

interface FilterProps {
  onFilter: (filters: {
    minPrice: string;
    maxPrice: string;
    city: string;
  }) => void;
  onClear: () => void;
}

export function Filter({ onFilter, onClear }: FilterProps) {
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [city, setCity] = useState('')
  
  const { states, cities, selectedState, setSelectedState, clearSelection } = useCities()

  const handleFilter = () => {
    onFilter({
      minPrice,
      maxPrice,
      city
    })
  }

  const handleClear = () => {
    setMinPrice('')
    setMaxPrice('')
    setCity('')
    clearSelection()
    onClear()
  }

  const handleStateChange = (stateId: string) => {
    if (stateId) {
      setSelectedState(parseInt(stateId))
    } else {
      clearSelection()
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg w-full max-w-7xl mx-auto mb-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por Preço Mínimo */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Preço Mínimo (R$)
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Ex: 10000"
            className="border border-gray-300 rounded-lg h-10 px-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Filtro por Preço Máximo */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Preço Máximo (R$)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Ex: 50000"
            className="border border-gray-300 rounded-lg h-10 px-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Filtro por Estado */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={selectedState || ''}
            onChange={(e) => handleStateChange(e.target.value)}
            className="border border-gray-300 rounded-lg h-10 px-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Selecione um estado</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.nome} ({state.sigla})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Cidade */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border border-gray-300 rounded-lg h-10 px-3 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Selecione uma cidade</option>
            {cities.map(cityItem => (
              <option key={cityItem.id} value={cityItem.nome}>
                {cityItem.nome} - {cityItem.microrregiao?.mesorregiao?.UF?.sigla || 'N/A'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-center gap-3 mt-4 ">
        <button
          onClick={handleFilter}
          className="bg-indigo-500 h-10 px-6 rounded-lg text-white font-medium hover:bg-indigo-600 transition flex-1 md:flex-none"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={handleClear}
          className="bg-gray-500 h-10 px-6 rounded-lg text-white font-medium hover:bg-gray-600 transition flex-1 md:flex-none"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  )
}
