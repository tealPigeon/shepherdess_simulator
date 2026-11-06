<script setup lang="ts">
import GameView from './components/GameView.vue';
import SideBar from './components/SideBar.vue';
import Modal from './components/Modal.vue';
import { useGameStore } from '@/stores/game';
const game = useGameStore();

</script>

<template>
  <Modal v-if="game.status === 'won'" />
  <SideBar />
  <GameView />
</template>