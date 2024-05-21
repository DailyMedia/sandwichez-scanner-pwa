<template>
  <div v-if=!selectedStore>
    <div class="h3 mt-3">Selecciona tu tienda:</div>

    <select v-model="storeSelect" class="h5 mt-3 rounded p-2">
      <option disabled value="">Escoge una</option>
      <option v-for="(store, i) in stores.select" :key="i" :value="store">
      {{ store }}
    </option>
    </select>
  </div>
</template>

<script>
import { ref } from 'vue'
import stores from '../../public/data/stores.json'

export default {
  data() {
    return {
      storeSelect: ref(""),
      stores
    }
  },
  mounted() {
    if (localStorage.selectedStore) {
      this.$store.dispatch("setStore", localStorage.selectedStore);
    }
  },
  methods: {
  },
  computed: {
    selectedStore() {
      return this.$store.getters.selectedStore
    }
  },
  watch: {
    storeSelect: function (newSelectedStore) {
      this.$store.dispatch("setStore", newSelectedStore);
      localStorage.selectedStore = newSelectedStore;
    }
  }
};
</script>

<style>

</style>
