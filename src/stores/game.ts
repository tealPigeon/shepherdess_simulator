
import { defineStore } from 'pinia'

const WIDTH = 20
const HEIGHT = 20
const TOTAL_SHEEP = 10
const TOTAL_WOLVES = 3

// 0 — пустая клетка, 1 — препятствие, 2 — лес
type Cell = 0 | 1 | 2

export type AnimalType = 'dog' | 'wolf' | 'sheep'
export type GameStatus = 'playing' | 'won' | 'lost' | 'paused'

export interface Animal {
  id: number
  type: AnimalType
  x: number
  y: number
}

export interface Position {
  x: number
  y: number
}

function createMatrix(): Cell[][] {
  const matrix: Cell[][] = Array.from(
    { length: HEIGHT },
    (_, y) =>
      Array.from({ length: WIDTH }, (_, x): Cell =>
        x === 0 ||
          y === 0 ||
          x === WIDTH - 1 ||
          y === HEIGHT - 1
          ? 2
          : 0,
      ),
  )

  const obstacles: Position[] = createObstacles()

  for (const { x, y } of obstacles) {
    if (matrix[y]) matrix[y][x] = 1
  }

  return matrix
}
function createObstacles(): Position[] {
  return [
    { x: 5, y: 3 },
    { x: 6, y: 3 },
    { x: 10, y: 6 },
    { x: 10, y: 7 },
    { x: 4, y: 10 },
    { x: 4, y: 11 },
    { x: 13, y: 14 },
    { x: 13, y: 15 },
  ]
}

function createBarn(): Position[] {
  return [
    { x: 4, y: 1 },
    { x: 5, y: 1 },
    { x: 6, y: 1 },
  ]
}

export const useGameStore = defineStore('game', {
  state: () => ({
    width: WIDTH,
    height: HEIGHT,
    totalSheep: TOTAL_SHEEP,

    matrix: createMatrix(),
    barn: createBarn(),
    animals: [] as Animal[],

    wins: 0,
    loses: 0,
    status: 'playing' as GameStatus,
    nextId: 1,
  }),

  getters: {
    dog: (state) =>
      state.animals.find((animal) => animal.type === 'dog'),

    wolves: (state) =>
      state.animals.filter((animal) => animal.type === 'wolf'),

    sheeps: (state) =>
      state.animals.filter((animal) => animal.type === 'sheep'),

    sheepCount(): number {
      return this.sheeps.length
    },
  },

  actions: {
    // Проверяем, находится ли клетка внутри загона
    isBarn(x: number, y: number): boolean {
      return this.barn.some(
        (cell) => cell.x === x && cell.y === y,
      )
    },

    // Проверяем границы карты
    isInside(x: number, y: number): boolean {
      return (
        x >= 0 &&
        x < this.width &&
        y >= 0 &&
        y < this.height
      )
    },

    // Проверяем, можно ли пройти по клетке
    isWalkable(x: number, y: number): boolean {
      return (
        this.isInside(x, y) &&
        !!this.matrix[y] && (this.matrix[y][x] === 0 || this.matrix[y][x] === 2)
      )
    },

    // проверка может ли овца зайти на клетку
    isWalkableForSheep(x: number, y: number): boolean {
      console.log((
        this.isInside(x, y) &&
        !!this.matrix[y] && (this.matrix[y][x] === 0)
      ))
      return (
        this.isInside(x, y) &&
        !!this.matrix[y] && (this.matrix[y][x] === 0)
      )
    },

    // Ищем животное на конкретной клетке
    getAnimalAt(
      x: number,
      y: number,
      excludeId?: number,
    ): Animal | undefined {
      return this.animals.find(
        (animal) =>
          animal.x === x &&
          animal.y === y &&
          animal.id !== excludeId,
      )
    },

    // Выбираем случайную свободную клетку
    getRandomFreeCell(): Position {
      const freeCells: Position[] = []

      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          if (
            this.isWalkable(x, y) &&
            !this.isBarn(x, y) &&
            !this.getAnimalAt(x, y)
          ) {
            freeCells.push({ x, y })
          }
        }
      }

      // if (freeCells.length === 0) {
      //   throw new Error('На карте нет свободных клеток')
      // }

      // return freeCells[
      //   Math.floor(Math.random() * freeCells.length)
      // ] && []

      if (freeCells.length === 0) {
        throw new Error('На карте нет свободных клеток');
      }

      const index = Math.floor(Math.random() * freeCells.length);
      return freeCells[index]!;
    },

    // Создаём животное
    createAnimal(type: AnimalType, position: Position): Animal {
      return {
        id: this.nextId++,
        type,
        x: position.x,
        y: position.y,
      }
    },
    switchPause(): void {
      if (this.status === 'paused') this.status = 'playing'
      else this.status = 'paused'
    },

    // Начинаем новую игру
    initializeGame(): void {
      this.matrix = createMatrix()
      this.barn = createBarn()
      this.animals = []
      this.wins = 0
      this.loses = 0
      this.status = 'playing'
      this.nextId = 1

      // Собака появляется в фиксированной точке
      this.animals.push(
        this.createAnimal('dog', { x: 2, y: 2 }),
      )

      for (let i = 0; i < TOTAL_SHEEP; i++) {
        this.animals.push(
          this.createAnimal('sheep', this.getRandomFreeCell()),
        )
      }

      for (let i = 0; i < TOTAL_WOLVES; i++) {
        this.animals.push(
          this.createAnimal('wolf', this.getRandomFreeCell()),
        )
      }
    },

    // Перемещаем собаку на одну клетку
    moveDog(dx: number, dy: number): void {
      console.log("moveDog ", this.status)
      if (this.status !== 'playing') return

      // запрет на диагональное перемещние
      if (
        Math.abs(dx) + Math.abs(dy) !== 1
      ) {
        return
      }

      const dog = this.dog
      if (!dog) return

      const nextX = dog.x + dx
      const nextY = dog.y + dy

      if (!this.isWalkable(nextX, nextY)) return

      const target = this.getAnimalAt(nextX, nextY)

      // Нельзя пройти сквозь волка
      if (target?.type === 'wolf') return

      // Если впереди овца — пробуем её подтолкнуть
      if (target?.type === 'sheep') {
        const sheepNextX = target.x + dx
        const sheepNextY = target.y + dy

        if (
          !this.isWalkableForSheep(sheepNextX, sheepNextY) ||
          this.getAnimalAt(sheepNextX, sheepNextY)
        ) {
          return
        }

        target.x = sheepNextX
        target.y = sheepNextY

        // овца попала в загон, засчитываем её
        this.checkBarn(target)
      }

      dog.x = nextX
      dog.y = nextY

      this.checkGameEnd()
    },

    // Отправляем овцу в загон, если она туда попала
    checkBarn(sheep: Animal): void {
      if (
        sheep.type !== 'sheep' ||
        !this.isBarn(sheep.x, sheep.y)
      ) {
        return
      }

      this.animals = this.animals.filter(
        (animal) => animal.id !== sheep.id,
      )

      this.wins++
      this.checkGameEnd()
    },

    // Ищем ближайшую овцу по манхэттенскому расстоянию
    findNearestSheep(wolf: Animal): Animal | undefined {
      return this.sheeps.reduce<Animal | undefined>(
        (nearest, sheep) => {
          if (!nearest) return sheep

          const distance = (animal: Animal) =>
            Math.abs(animal.x - wolf.x) +
            Math.abs(animal.y - wolf.y)

          return distance(sheep) < distance(nearest)
            ? sheep
            : nearest
        },
        undefined,
      )
    },

    // Передвигаем одного волка в сторону ближайшей овцы
    moveWolf(wolf: Animal): void {
      if (this.status === 'paused') return;
      const sheep = this.findNearestSheep(wolf)
      if (!sheep) return

      const candidates: Position[] = [
        { x: wolf.x + 1, y: wolf.y },
        { x: wolf.x - 1, y: wolf.y },
        { x: wolf.x, y: wolf.y + 1 },
        { x: wolf.x, y: wolf.y - 1 },
      ]

      // Сначала пробуем клетки, которые приближают волка к овце
      candidates.sort((a, b) => {
        const distance = (p: Position) =>
          Math.abs(p.x - sheep.x) +
          Math.abs(p.y - sheep.y)

        return distance(a) - distance(b)
      })

      for (const next of candidates) {
        if (!this.isWalkable(next.x, next.y)) continue

        const target = this.getAnimalAt(next.x, next.y)

        // Волки не проходят сквозь собаку и других волков
        if (target && target.type !== 'sheep') continue

        wolf.x = next.x
        wolf.y = next.y

        // Если волк добрался до овцы, овца потеряна
        if (target?.type === 'sheep') {
          console.log("Если волк добрался до овцы, овца потеряна")
          this.animals = this.animals.filter(
            (animal) => animal.id !== target.id,
          )
          console.log("loses ", this.loses)
          this.loses++
          console.log("loses ", this.loses)

        }

        this.checkGameEnd()
        return
      }
    },

    // Двигаем всех волков
    moveWolves(): void {
      if (this.status !== 'playing') return

      // Копия массива позволяет безопасно удалять овец
      const wolves = [...this.wolves]

      for (const wolf of wolves) {
        if (this.status !== 'playing') break

        // Проверяем, что волк всё ещё в игре
        if (!this.animals.some((a) => a.id === wolf.id)) {
          continue
        }

        this.moveWolf(wolf)
      }
    },

    // Проверяем, закончилась ли игра
    checkGameEnd(): void {
      if (this.wins + this.loses >= this.totalSheep) {
        this.status = 'won'
        return
      }

      // Если овец больше нет, но не все спасены — проигрыш
      if (this.sheepCount === 0) {
        this.status = 'lost'
      }
    },
  },
})
