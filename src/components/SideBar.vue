<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/game';
const game = useGameStore();
const isPaused = ref(false);

function pause() {
  isPaused.value = !isPaused.value
  game.switchPause()
}

</script>
<template>
  <div style="position: absolute;">
    <p>Спасено овец: {{ game.wins }}</p>
    <p>Потеряно овец: {{ game.loses }}</p>
    <button @click="pause">{{ isPaused ? "ПРОДОЛЖИТЬ" : "ПАУЗА" }}</button>
  </div>
</template>