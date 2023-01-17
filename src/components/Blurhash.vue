<template>
  <canvas
    :height="height"
    :width="width"
    class="aa-BlurhashCanvas"
    ref="canvasRef"
  ></canvas>
</template>

<script lang="ts">
import { decode } from "blurhash";
import { ref, watchEffect } from "vue";

export default {
  props: ["hash", "width", "height", "punch"],
  setup(props) {
    const canvasRef = ref(null);
    watchEffect(() => {
      const { hash, width, height, punch } = props;
      const pixels = decode(hash, width, height, punch);
      const ctx = canvasRef.current.getContext("2d");
      const imageData = ctx.createImageData(width, height);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    });
  },
};
</script>
