import { BASE_API_URL } from '@/configs/env'
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: BASE_API_URL
})

export default axiosClient
