import Vue from 'vue'
import axios from 'axios'
const BASE_URL = process.env.API_URL || 'localhost'
export default {
  get () {
    return Vue.http.get('/api/posts')
  },
  getPortfolio (pId) {
    return axios.get('http://' + BASE_URL + ':9000/portfolios/' + pId)
  },
  getPortfolioValue (pId) {
    return axios.get('http://' + BASE_URL + ':9000/portfolios/' + pId + '/value')
  },
  savePortfolio (portfolio) {
    return axios.put('http://' + BASE_URL + ':9000/portfolios/' + portfolio._id, portfolio)
  },
  addPortfolio (newPortfolio) {
    return axios.post('http://' + BASE_URL + ':9000/portfolios', newPortfolio)
  },
  getPortfolios () {
    return axios.get('http://' + BASE_URL + ':9000/portfolios')
  },
  getMarketCap () {
    return axios.get('http://' + BASE_URL + ':9000/coins/marketcap')
  }
}
