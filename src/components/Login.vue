<template>
  <div class="login">
    <section class="section">
      <div class="container has-text-centered">
        <div class="columns">
          <div class="column">
          </div>
          <div class="column">
            <b-field label="Username" type="is-success" message="This username is available">
              <b-input v-model="newUser.email" value="" maxlength="30"></b-input>
            </b-field>
            <b-field label="Password" type="is-warning" :message="['Password is too short', 'Password must have at least 8 characters']">
              <b-input v-model="newUser.password" value="" type="password" maxlength="30"></b-input>
            </b-field>
            <b-field label="">
              <button @click="addUser" class="button is-primary">
                  Register
                </button>
            </b-field>
          </div>
          <div class="column">
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
  import ApiService from '../services'

  export default {
    components: {},
    name: 'login',
    data () {
      return {
        newUser: {
          email: '',
          password: ''
        }
      }
    },
    created: function () {},
    mounted: function () {},
    watch: {},
    methods: {
      addUser () {
        return ApiService.addUser(this.newUser)
          .then(response => {
            this.portfolio = response.data
            this.$toast.open('Registered ' + this.newUser.email)
          })
      },
      getUser () {
        var self = this
        return ApiService.getUser(self.p_id)
          .then(response => {
            console.log('response: ', response)
            self.genPlot(response.data)
          }).catch(function (error) {
            console.log(error)
          })
      }
    },
    filters: {},
    beforeDestroy: function () {}
  }

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .login {}

</style>
