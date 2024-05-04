<script setup>
const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
});

const setGenericIcon = (e) => {
  e.target.src = "/generic_tab.svg";
};
</script>

<template>
  <v-row>
    <v-col :cols="12">
      <div class="tab-info">
        <div>
          <img :src="tab.favIconUrl" alt="tab-favicon" @error="setGenericIcon($event)" />
        </div>
        <div>
          <p :title="tab.title">{{ tab.title }}</p>
        </div>
        <p :title="tab.url">URL: {{ tab.url }}</p>
      </div>
    </v-col>
    <v-col :cols="12">
      <a :href="tab.url" target="_blank">
        <v-btn block variant="outlined" color="green">Open Tab</v-btn>
      </a>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.tab-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  border-radius: 10px;
  padding: 10px;
  background-color: rgba(0, 128, 0, 0.1);

  div {
    width: 100%;
    padding-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid black;

    img {
      width: 20px;
      height: 20px;
    }
  }

  p {
    cursor: default;
    word-break: break-all;
    white-space: wrap;
    overflow: hidden;
  }
}

a {
  text-decoration: none;
}
</style>
