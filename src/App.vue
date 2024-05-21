<template>
  <QrScanner/>
  <StoreIdentification/>
</template>

<script>
import QrScanner from './components/QrScanner.vue'
import StoreIdentification from './components/StoreIdentification.vue'

export default {
  name: 'App',
  components: {
    QrScanner,
    StoreIdentification
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
