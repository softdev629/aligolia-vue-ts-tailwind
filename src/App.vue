<template>
  <div class="container">
    <Autocomplete />
  </div>
</template>

<script>
import Autocomplete from "./components/Autocomplete.vue";

export default {
  name: "App",
  components: { Autocomplete },
};
</script>

<style>
.container {
  margin: 0 auto;
  max-width: 640px;
  width: 100%;
}
</style>
