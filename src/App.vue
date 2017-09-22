<template>
  <div id="app">
    <section class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <nav class="level is-mobile">
            <p class="level-item has-text-centered has-text-danger">
              <a class="link is-info">@</a>
            </p>
            <p class="level-item has-text-centered has-text-warning">
              <a class="link is-info">!</a>
            </p>
            <h1 class="logo level-item has-text-centered is-hidden-touch">
              <b v-on:click="goHome()">{{title}}</b>
            </h1>
            <h1 class="logo mobile has-text-centered is-hidden-desktop">
              <b v-on:click="goHome()">{{title}}</b>
            </h1>
            <p class="level-item has-text-centered has-text-primary">
              <a class="link is-info">?</a>
            </p>
            <p class="level-item has-text-centered has-text-info">
              <a @click="addPortfolio" class="link is-info">+</a>
            </p>
          </nav>
        </div>
      </div>
    </section>
    <router-view></router-view>
  </div>
</template>
<script>
  import ApiService from './services'

  export default {
    name: 'app',
    data () {
      return {
        title: 'Alto!'
      }
    },
    created: function () {},
    mounted: function () {},
    methods: {
      goHome () {
        this.$router.push('/')
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
                return ApiService.getPortfolios()
                  .then(response => {
                    this.portfolios = response.data
                  })
              })
          }
        })
      }
    }
  }

</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Code+Pro');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  #app {
    font-family: 'Source Code Pro', monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    /* color: #2c3e50; */
    color: #fefefe;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 16px;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }

  .logo {
    text-decoration: wavy overline hsla(198, 24%, 49%, 0.9)!important;
    font-weight: 900;
    font-style: normal;
    font-size: 50px;
    margin-top: 20px;
    margin-bottom: 15px;
  }

  .logo.mobile {
    font-weight: 900;
    font-style: normal;
    font-size: 30px;
  }

  @media screen and (max-width: 1007px) {
    .hero-body {
      padding: .5rem 0rem 0rem 0rem
    }
  }

</style>
