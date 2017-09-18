<template>
  <div class="hello">
    <section class="section">
      <div class="container">
        <nav class="level">
          <div class="level-left">
            <div class="level-item">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-large">{{portfolio.name}}<span class="is-hidden-touch">&nbsp;Checked @ {{updated}}</span>                  </span>
                  <a v-on:click="toggleAutoUpdate()" class="is-large is-hidden-touch" v-bind:class="isAutoUpdate()">AutoUpdate</a>
                </div>
              </div>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-large">${{portfolio.total.current.toLocaleString() || 0}}
                  <span v-bind:class="change(showTotalCurrentValue, showTotalPreviousValue)">&nbsp;(${{showTotalValue.toLocaleString() || 0}})</span></span>
                  <a v-on:click="toggleTotalDisplay()" class="tag is-large is-info is-hidden-touch">{{showTotal}}</a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <b-table :data="portfolio.coins">
          <template scope="props">
            <b-table-column label="Symbol">
              {{ props.row.symbol }}
            </b-table-column>
            <b-table-column label="Amount" numeric>
              {{ props.row.amount | round(4) || 0 }}
            </b-table-column>
            <b-table-column label="Cost" numeric>
              ${{ props.row.cost_usd.toLocaleString() || 0}}
            </b-table-column>
            <b-table-column label="Price" numeric>
              ${{ props.row.price.toLocaleString() || 0 }}
            </b-table-column>
            <b-table-column label="Value" numeric>
              ${{ props.row.value.toLocaleString() || 0}}
            </b-table-column>
            <b-table-column label="Profit" numeric>
              <span v-bind:class="isPositive(props.row.profit_usd)">${{props.row.profit_usd.toLocaleString() || 0}}</span>
            </b-table-column>
            <b-table-column label="24h" numeric>
              <span v-bind:class="isPositive(props.row.change24Pct)">{{ props.row.change24Pct | round(2) || 0}}%</span>
            </b-table-column>
          </template>
        </b-table>
      </div>
    </section>
    <section class="section is-hidden-touch">
      <div class="container plot">
        <div class="columns is-gapless is-centered is-desktop">
          <div v-for="(value, index) in portfolio.plot" class="rotated"><span v-bind:class="change(value, portfolio.plot[index-1])">{{calc(value)}}</span></div>
        </div>
        <!-- <line-chart :options="{responsive: true, maintainAspectRatio: false}" :height="200" :chart-data="datacollection"></line-chart>
          <button @click="fillData()">Randomize</button> -->
      </div>
    </section>
  </div>
</template>

<script>
  import LineChart from './LineChart.js'
  import axios from 'axios'
  import moment from 'moment'

  export default {
    components: {
      LineChart
    },
    name: 'hello',
    data () {
      return {
        interval: null,
        min: 0,
        max: 0,
        diff: 0,
        updated: '',
        showTotal: 'Profit',
        showTotalValue: 0,
        showTotalCurrentValue: 0,
        showTotalPreviousValue: 0,
        portfolio: {
          name: '',
          total: {
            current: 0,
            last: 0,
            change: 0,
            cost_usd: 0
          },
          coins: []
        }

      }
    },
    created: function () {
      this.getPortfolio()
    },
    mounted: function () {
      this.getPortfolioValue()
      // this.interval = setInterval(function () {
      //   this.getPortfolioValue()
      // }.bind(this), 6000)
    },
    methods: {
      calc (n) {
        var string = '*'
        var base = 0
        var floor = n - this.min

        if (this.diff > 1000) {
          base = floor / 100
        } else if (this.diff > 100) {
          base = floor / 10
        } else if (this.diff > 10) {
          base = floor / 1
        } else if (this.diff > 1) {
          base = floor
        }

        base = base / 2

        for (var i = 0; i < base; i++) {
          string += '*'
        }
        return string
      },
      change (current, last) {
        return {
          'has-text-danger': current < last,
          // 'has-text-info': current === last,
          'has-text-success': current >= last
        }
      },
      isPositive (value) {
        return {
          'has-text-danger': value <= 0,
          'has-text-success': value > 0
        }
      },
      isAutoUpdate () {
        return {
          'tag is-success': this.interval > 0,
          'tag is-danger': this.interval == null
        }
      },
      getPortfolio () {
        var self = this
        axios.get('http://localhost:9000/portfolios/59bef8f02e48837e43df3d2d')
          .then(function (response) {
            self.genPlot(response)
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      getPortfolioValue () {
        var self = this
        axios.get('http://localhost:9000/portfolios/59bef8f02e48837e43df3d2d/value')
          .then(function (response) {
            console.log(response)
            self.genPlot(response)
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      genPlot (response) {
        var self = this
        if (response.data.total.current > 0) {
          self.portfolio = response.data
          self.showTotal = 'Profit'
          self.showTotalValue = self.portfolio.total.profit_usd
          self.showTotalCurrentValue = self.portfolio.total.current
          self.showTotalPreviousValue = self.portfolio.total.cost_usd
          self.updated = moment(self.portfolio.updatedAt).format('h:mm:ss')
          self.min = Math.min.apply(null, self.portfolio.plot)
          self.max = Math.max.apply(null, self.portfolio.plot)
          self.diff = self.max - self.min
        } else {
          console.log('error getting value')
        }
      },
      toggleAutoUpdate () {
        if (this.interval) {
          clearInterval(this.interval)
          this.interval = null
        } else {
          this.interval = setInterval(function () {
            this.getPortfolioValue()
          }.bind(this), 10000)
        }
      },
      toggleTotalDisplay () {
        if (this.showTotal === 'Profit') {
          this.showTotal = '24h'
          this.showTotalValue = this.portfolio.total.change
          this.showTotalCurrentValue = this.portfolio.total.current
          this.showTotalPreviousValue = this.portfolio.total.yesterday
        } else {
          this.showTotal = 'Profit'
          this.showTotalValue = this.portfolio.total.profit_usd
          this.showTotalCurrentValue = this.portfolio.total.current
          this.showTotalPreviousValue = this.portfolio.total.cost_usd
        }
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
      },
      formatDate (value) {
        if (value) {
          return moment(String(value)).format('MM/DD/YYYY hh:mm')
        }
      },
      limit (arr, limit) {
        return arr.slice(0, limit)
      }
    },
    beforeDestroy: function () {
      clearInterval(this.interval)
    }
  }

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .hello {}

  .plot {
    /* left: 0px;
    bottom: 0px; */
    height: 100%;
    width: 100%;
  }

  .rotated {
    writing-mode: vertical-lr;
    transform: rotate(180deg);
  }

  .table {
    background-color: none!important;
    color: whitesmoke;
  }

  .table th {
    color: whitesmoke;
  }

</style>
