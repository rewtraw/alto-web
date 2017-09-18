<template>
  <div class="dashboard">
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
        <b-table :data="portfolio.coins" detailed>
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
          <template slot="detail" scope="props">
            <section>
              <div class="field has-addons has-addons-centered">
                <p class="control">
                  <b-field>
                    <b-input type="number" v-model="props.row.amount"></b-input>
                    <p class="control">
                      <span class="button is-static">Amount</span>
                    </p>
                  </b-field>
                </p>
                <p class="control">
                  <b-field>
                    <b-input type="number" v-model="props.row.cost_usd"></b-input>
                    <p class="control">
                      <span class="button is-static">Cost Each</span>
                    </p>
                  </b-field>
                </p>
              </div>

              <b-field grouped group-multiline position="is-centered">
                <p class="control">
                  <button v-on:click="saveCoin(props.index, props.row)" class="button is-primary">Save</button>
                </p>
                <p class="control">
                  <button v-on:click="deleteCoin(props.index)" class="button is-danger">Delete</button>
                </p>
              </b-field>
            </section>
          </template>
        </b-table>
        <div class="container">
          <br>
          <button class="button is-small is-dark is-pulled-right" @click="prompt">
                Add Coin
            </button>
        </div>
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
  import axios from 'axios'
  import moment from 'moment'

  export default {
    components: {},
    name: 'dashboard',
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
      saveCoin (index, coin) {
        var self = this
        console.log('index: ', index)
        console.log('coin: ', coin)
        self.portfolio.coins[index].amount = coin.amount
        self.portfolio.coins[index].cost_usd = coin.cost_usd
        axios.put('http://localhost:9000/portfolios/59bffbfbd14be1cc3537235e', self.portfolio)
          .then(function (response) {
            console.log('response: ', response)
            self.getPortfolioValue()
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      deleteCoin (index) {
        var self = this
        console.log('index: ', index)
        self.portfolio.coins.splice(index, 1)
        axios.put('http://localhost:9000/portfolios/59bffbfbd14be1cc3537235e', self.portfolio)
          .then(function (response) {
            console.log('response: ', response)
            self.getPortfolioValue()
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      prompt () {
        this.$dialog.prompt({
          message: `What is the ticker symbol?`,
          inputMaxlength: 6,
          inputPlaceholder: 'e.g. ETH',
          onConfirm: (value) => {
            var self = this
            self.portfolio.coins.push({
              'symbol': value,
              'profit_usd': 0,
              'value': 0,
              'change24Pct': 0,
              'change24': 0,
              'price': 0,
              'cost_btc': 0,
              'cost_eth': 0,
              'cost_usd': 0,
              'total_cost_usd': 0,
              'amount': 0
            })
            axios.put('http://localhost:9000/portfolios/59bffbfbd14be1cc3537235e', self.portfolio)
              .then(function (response) {
                this.$toast.open('Added ' + value)
                self.getPortfolioValue()
              })
              .catch(function (error) {
                console.log(error)
              })
          }
        })
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
        axios.get('http://localhost:9000/portfolios/59bffbfbd14be1cc3537235e')
          .then(function (response) {
            self.genPlot(response)
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      getPortfolioValue () {
        var self = this
        axios.get('http://localhost:9000/portfolios/59bffbfbd14be1cc3537235e/value')
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
        value = parseInt(value)
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
  .dashboard {}

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

  .title {
    font-weight: 900;
    font-style: normal;
    font-size: 50px;
  }

</style>
