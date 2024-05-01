<script setup>
const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
});

const openTab = () => {
  window.open(props.tab.url, "_blank");
};

const setGenericIcon = (e) => {
  e.target.src = "/generic_tab.svg";
};
</script>

<template>
  <v-row>
    <v-col :cols="12">
      <div class="tab-info">
        <div>
          <img
            :src="tab.favIconUrl"
            alt="tab-favicon"
            @error="setGenericIcon($event)"
          />
          <span :title="tab.title">{{ tab.title }}</span>
        </div>
        <p :title="tab.url">{{ tab.url }}</p>
      </div>
    </v-col>
    <v-col :cols="12">
      <v-btn block variant="outlined" color="green" :onclick="openTab"
        >Open tab</v-btn
      >
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.tab-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: 10px;
  padding: 10px;
  background-color: rgba(0, 128, 0, 0.1);

  div {
    display: flex;
    align-items: center;
    gap: 10px;

    img {
      width: 16px;
      height: 16px;
    }
  }

  p {
    cursor: default;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
