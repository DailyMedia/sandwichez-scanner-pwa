<template>
  <div class="container text-center mt-4">
    <img :src="logoSrc" alt="Logo Sandwitchez" class="logo mb-5" />
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
      <p
        :class="[result === 'ok' ? 'text-success' : 'text-danger', achievedMaxValue ? 'text-bigger' : '']"
        class="mt-2">
          {{ answer }}
      </p>
      <img v-if="achievedMaxValue" :src=cofeeGif>
      <p class="mt-2">{{ countdownMsg }} en {{ countdown }} segundos</p>
      <button v-if="showButton" class="btn btn-primary" @click="continueScan">Volver</button>
    </template>
  </div>
  
</template>

<script>
import axios from 'axios';
import { startConfettiInner } from '@/components/confetti.js';
import { stopConfettiInner } from '@/components/confetti.js';

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
      showButton: true,
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
        this.showButton = this.result === 'fail';
        this.countdownMsg = this.result === 'ok' ? 'Cerrando' : 'Volviendo';
        this.achievedMaxValue ? startConfettiInner() : stopConfettiInner()
      } catch (error) {
        this.result = 'fail';
        this.answer = 'Lo sentimos, algo ha salido mal.';
        this.showButton = true;
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
    }
  },
  watch: {
    result(newResult) {
      if (newResult) {
        this.showButton = newResult === 'fail';
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
          console.log('window.close()');
          window.close();
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
  font-size: 22px
}
</style>
