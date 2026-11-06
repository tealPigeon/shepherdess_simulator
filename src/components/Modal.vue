<script setup lang="ts">
import { useGameStore } from '@/stores/game';
const game = useGameStore();

function replay() {
  game.initializeGame();
}

</script>
<template>
  <div style=" background-color: rgba(0, 0, 0, 0.5); right: 0; bottom: 0; left: 0; top: 0; z-index: 1;">
    <div
      style="position: fixed; left: 50%; top: 50%; translate: -50% -50%; padding: 10px; background-color: white; min-width: 200px; min-height: 100px;">
      Игра окончена <br /> <br />
      Спасено овец: {{ game.wins }} <br /> <br />
      Потеряно: {{ game.loses }} <br /> <br />
      <button @click="replay"> Переиграть </button>
    </div>
  </div>
</template>