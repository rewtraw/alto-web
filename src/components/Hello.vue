<template>
  <div class="hello">
    <section class="section">
      <div class="container">
        <!-- <span v-bind:class="dayChange(props.row.change24Pct)" class="tag is-large is-pulled-right">${{total.current | round(2) || 0}}</span> -->
        <div class="tag is-large is-pulled-left">
          <span>{{portfolio.name}}</span>
        </div>
        <div class="tag is-large is-pulled-right">
          <span>${{total.current.toLocaleString() || 0}}</span>
          <span v-bind:class="dayChange(total.current, total.yesterday)">&nbsp;(${{total.change.toLocaleString() || 0}}) </span>&nbsp;24h
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <b-table :data="holdings">
          <template scope="props">
            <b-table-column label="Symbol">
              {{ props.row.symbol }}
            </b-table-column>
            <b-table-column label="Price" numeric>
              ${{ props.row.price.toLocaleString() || 0 }}
            </b-table-column>
            <b-table-column label="Amount" numeric>
              {{ props.row.amount | round(4) || 0 }}
            </b-table-column>
            <b-table-column label="Value" numeric>
              ${{ props.row.value.toLocaleString() || 0}}
            </b-table-column>
            <b-table-column label="24h" numeric>
              <span v-bind:class="isPositive(props.row.change24Pct)">{{ props.row.change24Pct | round(2) || 0}}%</span>
            </b-table-column>
          </template>
        </b-table>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <!-- <line-chart :options="{responsive: true, maintainAspectRatio: false}" :height="200" :chart-data="datacollection"></line-chart>
        <button @click="fillData()">Randomize</button> -->
      </div>
    </section>
  </div>
</template>

<script>
  import LineChart from './LineChart.js'
  import axios from 'axios'

  export default {
    components: {
      LineChart
    },
    name: 'hello',
    data () {
      return {
        portfolio: {},
        holdings: [],
        total: {
          current: 0,
          yesterday: 0,
          change: 0
        }
      }
    },
    mounted () {
      var self = this
      axios.get('http://localhost:9000/portfolios/59bef8f02e48837e43df3d2d/value')
        .then(function (response) {
          console.log(response)
          self.holdings = response.data.coins
          self.total = response.data.total
          self.portfolio = response.data.portfolio
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    methods: {
      dayChange (current, yesterday) {
        return {
          'has-text-danger': current < yesterday,
          'has-text-info': current === yesterday,
          'has-text-success': current > yesterday
        }
      },
      isPositive (value) {
        return {
          'has-text-danger': value <= 0,
          'has-text-success': value > 0
        }
      },
      fillData () {
        // this.datacollection = {
        //   labels: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(),
        //     this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()
        //   ],
        //   datasets: [{
        //     label: 'Performance',
        //     backgroundColor: '#f87979',
        //     data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(),
        //       this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()
        //     ]
        //   }, {
        //     label: 'Market',
        //     backgroundColor: '#3a2835',
        //     data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt(),
        //       this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()
        //     ]
        //   }]
        // }
      },
      getRandomInt () {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5
      }
    },
    filters: {
      round (value, decimals) {
        if (!value) {
          value = 0
        }
        if (!decimals) {
          decimals = 0
        }
        value = value.toFixed(decimals)
        return value
      },
      currency (value, decimals) {
        if (!value) {
          value = 0
        }
        if (!decimals) {
          decimals = 0
        }
        value = value.toFixed(decimals)
        return value
      }
    }
  }

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .hello {}

  .table {
    background-color: none!important;
    color: whitesmoke;
  }

  .table th {
    color: whitesmoke;
  }

</style>
