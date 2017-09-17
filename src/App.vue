<template>
  <div id="app">
    <section class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            <b>Alto!</b>
          </h1>
        </div>
      </div>
    </section>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'app'
  }

</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Alegreya:900|Source+Code+Pro');
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

  .title {
    text-decoration: wavy overline hsla(198, 24%, 49%, 0.9);
    font-weight: 900;
    font-style: normal;
    font-size: 50px;
    margin-top: 30px
  }

</style>
