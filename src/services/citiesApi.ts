// API do IBGE para buscar cidades do Brasil
const IBGE_API_BASE = 'https://servicodados.ibge.gov.br/api/v1/localidades'

export interface City {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export interface State {
  id: number;
  sigla: string;
  nome: string;
}

// Buscar todos os estados
export async function getStates(): Promise<State[]> {
  try {
    const response = await fetch(`${IBGE_API_BASE}/estados`)
    if (!response.ok) {
      throw new Error('Erro ao buscar estados')
    }
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar estados:', error)
    throw error
  }
}

// Buscar cidades por estado
export async function getCitiesByState(stateId: number): Promise<City[]> {
  try {
    const response = await fetch(`${IBGE_API_BASE}/estados/${stateId}/municipios`)
    if (!response.ok) {
      throw new Error('Erro ao buscar cidades')
    }
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar cidades:', error)
    throw error
  }
}

// Buscar todas as cidades (pode ser lento, use com cuidado)
export async function getAllCities(): Promise<City[]> {
  try {
    const response = await fetch(`${IBGE_API_BASE}/municipios`)
    if (!response.ok) {
      throw new Error('Erro ao buscar todas as cidades')
    }
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar todas as cidades:', error)
    throw error
  }
}

// Buscar cidades por nome (busca parcial)
export async function searchCitiesByName(cityName: string): Promise<City[]> {
  try {
    const response = await fetch(`${IBGE_API_BASE}/municipios?nome=${encodeURIComponent(cityName)}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar cidades por nome')
    }
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar cidades por nome:', error)
    throw error
  }
}
