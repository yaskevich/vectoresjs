<template>
  <h1>{{ msg }}</h1>

  <p>
    Test page
  </p>

  <Button @click="state.count++" label="Count"></Button>
  <h6>{{ state.count }}</h6>

  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
  msg: String
})

const state = reactive({ count: 0 })
</script>

<style scoped>
a {
  color: #42b983;
}
</style>