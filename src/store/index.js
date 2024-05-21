import { createStore } from 'vuex'

export default createStore({
  state: {
    selectedStore: undefined
  },
  getters: {
    selectedStore(state) {
      return state.selectedStore;
    }
  },
  mutations: {
    SET_STORE(state, payload) {
    state.selectedStore = payload;
  }
  },
  actions: {
    setStore(context, value) {
      context.commit('SET_STORE', value)
    }
  },
  modules: {
  }
})
