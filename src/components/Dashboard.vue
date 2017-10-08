<template>

  <div class="dashboard">
    <section v-if="!portfolios.length" class="section">
      <div class="container has-text-centered">
        <div class="content">
          <div>
            <a @click="addPortfolio" class="button is-primary">New Portfolio</a>
          </div>
        </div>
      </div>
    </section>
    <section v-if="portfolios.length" class="section">
      <div class="container">
        <nav class="level">
          <div class="level-left">
            <div class="level-item">
              <div class="control">
                <b-field grouped>
                  <b-select v-on:change="changePortfolio()" v-model="p_id" placeholder="Select a Portfolio">
                    <option v-for="option in portfolios" :value="option._id" :key="option._id">
                      {{ option.name }}
                    </option>
                  </b-select>
                </b-field>
              </div>
            </div>
            <div class="level-item">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-medium">
                    <span>Checked @ {{updated}}</span>
                  </span>
                  <a v-on:click="toggleAutoUpdate()" class="tag is-medium is-hidden-touch" v-bind:class="isAutoUpdate()">↻</a>
                </div>
              </div>
            </div>
          </div>
          <div class="level-right">
            <div class="level-item">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-medium">MCAP: ${{mcap.toLocaleString() || 0}}</span>
                </div>
              </div>
            </div>
            <div class="level-item">
              <div class="control">
                <div class="tags has-addons">
                  <span class="tag is-medium">${{portfolio.total.current.toLocaleString() || 0}}
                  <span v-bind:class="change(showTotalCurrentValue, showTotalPreviousValue)">&nbsp;(${{showTotalValue.toLocaleString() || 0}})</span></span>
                  <a v-on:click="toggleTotalDisplay()" class="tag is-medium is-info is-hidden-touch">{{showTotal}}</a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </section>
    <section v-if="portfolios.length && portfolio.coins.length" class="section">
      <div class="container">
        <b-table class="table" :data="portfolio.coins" detailed mobile-cards>
          <template scope="props">
            <b-table-column label="Symbol">
              <a v-bind:href="'https://www.cryptocompare.com/coins/'+props.row.symbol" target="_blank">{{ props.row.symbol }} </a>
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


              <b-field grouped position="is-centered">
                <b-field>
                  <b-field>
                    <b-input v-model="props.row.amount" placeholder=""></b-input>
                    <span class="button is-static">Amount</span>
                  </b-field>
                </b-field>
                <b-field>
                  <b-input v-model="props.row.cost_usd"></b-input>
                  <span class="button is-static">Cost Each</span>
                </b-field>
              </b-field>
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
        <div class="container has-text-centered">
          <br>
          <button class="button is-small is-dark is-pulled-right" @click="prompt">
              Add Coin
          </button>
        </div>
      </div>
    </section>
    <section v-if="p_id && !portfolio.coins.length" class="section">
      <div class="container has-text-centered">
        <a @click="prompt" class="button is-primary">Add Coin</a>
      </div>
    </section>
    <section v-if="showTotalValue" class="section is-hidden-touch">
      <div class="container plot">
        <div class="columns is-gapless is-centered is-desktop">
          <div v-for="(value, index) in portfolio.plot" class="rotated"><span v-bind:class="change(value, portfolio.plot[index-1])">{{calc(value)}}</span></div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container has-text-centered">
        <div class="content">
          <div>
            <ul>
              <li><span class="has-text-danger">@</span> : manage account</li>
              <li><span class="has-text-warning">!</span> : something else</li>
              <li><span class="has-text-primary">?</span> : show this helptext</li>
              <li><span class="has-text-info">+</span> : add new portfolio</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import moment from 'moment'
  import ApiService from '../services'

  export default {
    components: {},
    name: 'dashboard',
    data () {
      return {
        base_url: process.env.API_URL || 'localhost',
        interval: null,
        min: 0,
        max: 0,
        diff: 0,
        updated: '',
        showTotal: 'Profit',
        showTotalValue: 0,
        showTotalCurrentValue: 0,
        showTotalPreviousValue: 0,
        p_id: '',
        portfolios: [],
        portfolio: {
          name: '',
          total: {
            current: 0,
            last: 0,
            change: 0,
            cost_usd: 0
          },
          coins: []
        },
        mcap: 0
      }
    },
    created: function () {},
    mounted: function () {
      this.fetchPortfolios()
      this.getMarketCap()
      // this.getPortfolioValue()
      // this.getPortfolio()

      // this.interval = setInterval(function () {
      //   this.getPortfolioValue()
      // }.bind(this), 6000)
    },
    watch: {
      // whenever question changes, this function will run
      p_id: function () {
        var self = this
        self.getPortfolio()
      }
    },
    methods: {
      fetchPortfolios () {
        return ApiService.getPortfolios()
          .then(response => {
            this.portfolios = response.data
            console.log('this.portfolios: ', this.portfolios)
            if (this.portfolios.length) {
              this.portfolio = response.data[0]
              this.p_id = this.portfolio._id
              this.getPortfolio()
              this.getPortfolioValue()
            } else {
              this.noProfile = true
            }
          })
      },
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
        } else if (this.diff > 0) {
          base = floor
        } else if (this.diff <= 0) {
          base = floor * 10
        } else if (this.diff < -10) {
          base = floor * 100
        } else if (this.diff < -100) {
          base = floor * 1000
        }

        base = base / 2

        for (var i = 0; i < base; i++) {
          string += '*'
        }
        return string
      },
      saveCoin (index, coin) {
        var self = this
        self.portfolio.coins[index].amount = coin.amount
        self.portfolio.coins[index].cost_usd = coin.cost_usd
        return ApiService.savePortfolio(self.portfolio)
          .then(response => {
            self.getPortfolioValue()
          })
      },
      deleteCoin (index) {
        var self = this
        self.portfolio.coins.splice(index, 1)
        return ApiService.savePortfolio(self.portfolio)
          .then(response => {
            self.getPortfolioValue()
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
            return ApiService.savePortfolio(self.portfolio)
              .then(response => {
                self.getPortfolioValue()
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
      getMarketCap () {
        var self = this
        return ApiService.getMarketCap()
          .then(function (response) {
            console.log('MARKET CAP: ', response)
            self.mcap = response.data.total_market_cap_usd
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      addPortfolio () {
        this.$dialog.prompt({
          message: `Give your portfolio a name.`,
          inputPlaceholder: 'e.g. To the Moon!',
          onConfirm: (value) => {
            var newPortfolio = {
              'name': value
            }
            return ApiService.addPortfolio(newPortfolio)
              .then(response => {
                this.portfolio = response.data
                this.$toast.open('Added ' + value)
                this.fetchPortfolios()
              })
          }
        })
      },
      getPortfolio () {
        var self = this
        return ApiService.getPortfolio(self.p_id)
          .then(response => {
            console.log('response: ', response)
            self.genPlot(response.data)
            this.getPortfolioValue()
          }).catch(function (error) {
            console.log(error)
          })
      },
      getPortfolioValue () {
        var self = this
        return ApiService.getPortfolioValue(self.p_id)
          .then(response => {
            console.log('response: ', response)
            self.genPlot(response.data)
          }).catch(function (error) {
            console.log(error)
          })
      },
      genPlot (data) {
        var self = this
        if (data.total) {
          self.portfolio = data
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
        value = parseFloat(value)
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

  li {
    color: grey
  }

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
