<template>
  <div class="container text-center mt-4">
    <img :src="logoSrc" alt="Logo Sandwitchez" class="logo mb-5" />
    <div v-show=selectedStore>
      <template v-if="!result">
        <div class="d-flex flex-column align-items-center">
          <input
            ref="inputRef"
            type="text"
            placeholder="Escanea el código..."
            v-model="scannedData"
            @keydown.enter.prevent="handleKeyDown"
            :class="{ 'is-invalid': invalidUrl }"
            class="inputBarCode border border-1 w-75"
          />
          <button class="btn btn-primary mt-3" @click="handleScanInput" :disabled="!listening">Escanear</button>
          <div v-if="invalidUrl" class="invalid-feedback">Ingresa una URL válida</div>
        </div>
      </template>
      <template v-if="loading">
        <div class="mt-2">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Cargando...</p>
        </div>
      </template>
      <template v-if="result">
        <p :class="resultClass" class="mt-2">{{ answer }}</p>
        <img v-if="achievedMaxValue" :src=cofeeGif>
        <p class="mt-2">{{ countdownMsg }} en {{ countdown }} segundos</p>
        <button v-if="showBackButton" class="btn btn-primary" @click="continueScan">Volver</button>
        <button v-if="showCloseButton" class="btn btn-primary" @click="closeWindow">Cerrar</button>
      </template>
    </div>
  </div>
  
</template>

<script>
import axios from 'axios';
import { startConfettiInner, stopConfettiInner } from '@/components/confetti.js';

export default {
  data() {
    return {
      logoSrc: require('@/assets/logo.png'),
      cofeeGif: require('@/assets/coffee.gif'),
      scannedData: '',
      loading: false,
      result: null,
      answer: null,
      countdown: 5,
      countdownMsg: '',
      listening: true,
      invalidUrl: false,
      inputRef: null,
      showBackButton: true,
      showCloseButton: false,
      timer: null,
      achievedMaxValue: null
    };
  },
  mounted() {
    this.inputRef = this.$refs.inputRef;
    this.inputRef.focus();
  },
  methods: {
    async handleScanInput() {
      const input = this.scannedData.trim();
      if (!input) return;

      this.listening = false;
      this.loading = true;

      try {
        const urlRegex = /^https:\/\/sandwichez-scanner-pwa-backend\.vercel\.app\/sumar-puntos\/.*$/;
        if (!urlRegex.test(input)) {
          this.invalidUrl = true;
          return;
        }

        const response = await axios.get(input);
        this.result = response.status === 200 || response.status === 204 ? 'ok' : 'fail';
        this.answer = response.data.answer.msg;
        this.countdown = response.data.answer.countdown;
        this.achievedMaxValue = response.data.answer.achievedMaxValue
        this.showBackButton = this.result === 'fail';
        this.showCloseButton = this.result === 'ok';
        this.countdownMsg = this.result === 'ok' ? 'Cerrando' : 'Volviendo';
        this.achievedMaxValue ? startConfettiInner() : stopConfettiInner()
      } catch (error) {
        this.result = 'fail';
        this.answer = 'Lo sentimos, algo ha salido mal.';
        this.showBackButton = true;
        this.countdownMsg = 'Volviendo';
      } finally {
        this.loading = false;
        this.scannedData = '';
        this.listening = true;
        this.inputRef.focus();
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
      this.$nextTick(() => {
        this.inputRef = this.$refs.inputRef
        this.inputRef.focus();
      })
    },
    closeWindow() {
      window.close();
    }
  },
  computed: {
    resultClass() {
      return [
        this.result === 'ok' ? 'text-success' : 'text-danger',
        this.achievedMaxValue ? 'text-bigger' : ''
      ];
    },
    selectedStore() {
      return this.$store.getters.selectedStore
    }
  },
  watch: {
    result(newResult) {
      if (newResult) {
        this.showBackButton = newResult === 'fail';
        this.timer = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--;
          }
        }, 1000);
      } else {
        clearInterval(this.timer);
      }
    },
    countdown(newCountdown) {
      if (newCountdown === 0) {
        if (this.result === 'ok') {
          this.closeWindow();
        } else {
          this.continueScan();
          stopConfettiInner()
        }
      }
    }
  }
};
</script>

<style>
.logo {
  max-width: 200px;
  height: auto;
}
.text-bigger {
  font-size: 26px
}
</style>
