<template>
  <div v-if="color == 'black'" class="background-dark pixel"> </div>
  <div v-else class="background-light pixel"> </div>
</template>

<script>
export default {
  name: "Pixel",
  props: {
    color: {}
  }
};
</script>

<style scoped>
.background-dark {
  background-color: #000;
}
.background-light {
  background-color: #999999;
}

</style>