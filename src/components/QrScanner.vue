<template>
  <div class="container text-center mt-4">
    <img :src="require('@/assets/logo.png')" alt="Logo Sandwitchez" class="logo mb-5" />
    <div v-if="!result" class="d-flex flex-column align-items-center">
      <input
        ref="inputRef"
        type="text"
        placeholder="Escanea el código..."
        v-model="scannedData"
        @keydown.enter.prevent="handleScanInput"
        :class="{ 'is-invalid': invalidUrl }"
        class="border border-1 w-75"
      />
      <button class="btn btn-primary mt-3 " @click="handleScanInput" :disabled="!listening">Escanear</button>
      <div v-if="invalidUrl" class="invalid-feedback">Ingresa una URL válida</div>
    </div>
    <div v-if="loading" class="mt-2">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Cargando...</p>
    </div>
    <div v-if="result">
      <p :class="result === 'ok' ? 'text-success' : 'text-danger'" class="mt-2">{{ answer }}</p>
      <p class="mt-2">Continuar en {{ countdown }} segundos</p>
      <button class="btn btn-primary" @click="continueScan">Continuar</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      inputRef: null,
      scannedData: '',
      loading: false,
      result: null,
      answer: null,
      countdown: 5,
      listening: true,
      invalidUrl: false
    };
  },
  mounted() {
    this.inputRef = this.$refs.inputRef;
    this.inputRef.focus();
  },
  methods: {
    async handleInput() {
      this.listening = true;
      this.invalidUrl = false;

      if (this.timerId) {
        clearTimeout(this.timerId);
      }

      this.timerId = setTimeout(() => {
        this.handleScanInput();
      }, 500);
    },
    async handleScanInput() {
      const input = this.scannedData.trim();
      if (input) {
        this.listening = false;
        this.loading = true;

        try {
          const urlRegex = /^https:\/\/sandwitchez-scanner-pwa-backend\.vercel\.app\/sumar-puntos\/.*$/;
          if (!urlRegex.test(input)) {
            this.invalidUrl = true;
            return;
          }

          const response = await axios.get(input);
          console.log(response)
          if (response.status === 200 || response.status === 204) {
            this.result = 'ok';
            this.answer = response.data.answer.msg;
            this.countdown = response.data.answer.countdown;
          } else {
            this.result = 'fail';
            this.answer = 'Lo sentimos, los datos introducidos no son correctos.';
          }
        } catch (error) {
            console.log(error)
            this.result = 'fail';
            this.answer = 'Lo sentimos, algo ha salido mal.';
          } finally {
            this.loading = false;
            this.scannedData = '';
            this.listening = true;
            this.inputRef.focus(); 
        }
      }
    },
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        this.handleScanInput();
      }
    },
    continueScan() {
      this.scannedData = '';
      this.result = null;
      this.listening = true;
      this.countdown = 5;
      this.invalidUrl = false;
      this.inputRef.focus();
    }
  },
  watch: {
    result() {
      if (this.result) {
        this.timer = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--;
          }
        }, 1000);
      } else {
        clearInterval(this.timer);
      }
    },
    countdown() {
      if (this.countdown === 0) {
        this.continueScan();
      }
    }
  }
};
</script>

<style>
.container{
  width: 150px;
}
.logo {
  max-width: 200px;
  height: auto;
}
</style>
