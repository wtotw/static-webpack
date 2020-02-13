<template>
  <div>
    <input type="text" v-model="text">
    {{ text }}
  </div>
</template>

<script>
import Vue from 'vue';
export default Vue.component('search-form', {
  data: () => {
    return {
      text: 'test'
    };
  }
});
</script>
