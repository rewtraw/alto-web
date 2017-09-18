<template>
  <div class="portfolio">
    <section class="section">
      <div class="container">
        <b-field label="Name">
          <b-input value="My Portfolio"></b-input>
        </b-field>
        <div class="field">
          <b-field label="Base Unit">
            <b-select placeholder="Base Unit">
              <option value="usd">USD</option>
              <option value="btc">BTC</option>
            </b-select>
          </b-field>
        </div>
        <b-field grouped>
          <b-field label="Coin"></b-field>
        </b-field>
        <b-field grouped>
          <b-input placeholder="Ticker Symbol"></b-input>
          <p class="control">
            <button class="button is-primary">Add</button>
          </p>
        </b-field>
        <b-field grouped>
          <b-field label=""></b-field>
        </b-field>
        <div class="field is-grouped">
          <div class="control">
            <button class="button is-success">Submit</button>
          </div>
          <div class="control">
            <button class="button is-link">Cancel</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'

  export default {
    components: {},
    name: 'portfolio',
    data () {
      return {
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
    created: function () {},
    mounted: function () {
      this.getPortfolio()
    },
    methods: {
      getPortfolio () {
        var self = this
        axios.get('http://localhost:9000/portfolios/59bef8f02e48837e43df3d2d')
          .then(function (response) {
            self.portfolio = response.data
          })
          .catch(function (error) {
            console.log(error)
          })
      }
    },
    filters: {
      formatDate (value) {
        if (value) {
          return moment(String(value)).format('MM/DD/YYYY hh:mm')
        }
      }
    }
  }

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .portfolio {}

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
