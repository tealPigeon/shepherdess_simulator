<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/game';

const barn = ref<{ x: number, y: number }[]>([{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }])

const game = useGameStore();

const animals = computed(() => game.animals)


onMounted(() => {
  game.initializeGame();
  document.addEventListener('keydown', handleDirectionKeys);
});

function handleDirectionKeys(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      game.moveDog(0, -1);
      break;

    case 'ArrowDown':
    case 's':
      game.moveDog(0, 1);
      break;

    case 'ArrowLeft':
    case 'a':
      game.moveDog(-1, 0);
      break;

    case 'ArrowRight':
    case 'd':
      game.moveDog(1, 0);
      break;
  }
}

let wolfsTimer: ReturnType<typeof setInterval> | null = null

const startWolfs = () => {
  wolfsTimer = setInterval(moveWolfs, 3000)
}

const moveWolfs = () => {
  const wolves = animals.value.filter(
    a => a.type === 'wolf'
  )

  for (const wolf of wolves) {
    // moveWolf(wolf)
    game.moveWolf(wolf)
  }
}

// Регистрируем обработчик на весь документ
document.addEventListener('keydown', handleDirectionKeys);
onMounted(() => {
  startWolfs()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDirectionKeys);

  if (wolfsTimer) {
    clearInterval(wolfsTimer);
  }
});

</script>

<template>
  <div style="display: flex; justify-content: center;">
    <div class="game-board">
      <div v-for="(row, y) in game.matrix" :key="y" class="row">
        <div v-for="(cell, x) in row" :key="x" class="cell">
          {{
            barn.find((c) => c.x === x && c.y === y) ? "🚧" :
              animals.find(a => a.x === x && a.y === y)?.type === 'dog'
                ? '🐕'
                : animals.find(a => a.x === x && a.y === y)?.type === 'wolf'
                  ? '🐺'
                  : animals.find(a => a.x === x && a.y === y)?.type === 'sheep'
                    ? '🐑'
                    : cell === 2
                      ? '🌲' : cell === 1 ? "📦" : ""
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row {
  display: flex;
  gap: 2px;
}

.cell {
  width: 40px;
  height: 40px;
  border: 1px solid #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d8edc8;
}

@media only screen and (max-width: 600px) {
  .cell {
    width: 16px;
    height: 16px;
  }
}

@media only screen and (max-width:400px) {
  .cell {
    width: 12px;
    height: 12px;
  }
}
</style>
