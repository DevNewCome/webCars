import { useState, useEffect } from 'react'
import { getStates, getCitiesByState, searchCitiesByName, City, State } from '../services/citiesApi'

export function useCities() {
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedState, setSelectedState] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar estados na inicialização
  useEffect(() => {
    loadStates()
  }, [])

  // Carregar cidades quando um estado for selecionado
  useEffect(() => {
    if (selectedState) {
      loadCitiesByState(selectedState)
    } else {
      setCities([])
    }
  }, [selectedState])

  const loadStates = async () => {
    try {
      setLoading(true)
      setError(null)
      const statesData = await getStates()
      setStates(statesData.sort((a, b) => a.nome.localeCompare(b.nome)))
    } catch (err) {
      setError('Erro ao carregar estados')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadCitiesByState = async (stateId: number) => {
    try {
      setLoading(true)
      setError(null)
      const citiesData = await getCitiesByState(stateId)
      setCities(citiesData.sort((a, b) => a.nome.localeCompare(b.nome)))
    } catch (err) {
      setError('Erro ao carregar cidades')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const searchCities = async (cityName: string) => {
    if (!cityName.trim()) {
      setCities([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const citiesData = await searchCitiesByName(cityName)
      
      // Verificar se a resposta é válida
      if (Array.isArray(citiesData)) {
        setCities(citiesData.sort((a, b) => a.nome.localeCompare(b.nome)))
      } else {
        setCities([])
        setError('Formato de dados inválido')
      }
    } catch (err) {
      console.error('Erro ao buscar cidades:', err)
      setError('Erro ao buscar cidades. Tente novamente.')
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedState(null)
    setCities([])
  }

  return {
    states,
    cities,
    selectedState,
    loading,
    error,
    setSelectedState,
    searchCities,
    clearSelection
  }
}
