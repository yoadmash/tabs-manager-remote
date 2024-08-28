<script setup>
import { ref } from "vue";
import EditTab from "./EditTab.vue";

const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
  connection: {
    type: String,
    required: true,
  },
});

const tab = ref(props.tab);

const tabEditComplete = (updatedTab) => {
  tab.value.title = updatedTab.title;
  tab.value.url = updatedTab.url;
  tab.favIconUrl = updatedTab?.favIconUrl || "";
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
            :src="tab?.favIconUrl || '/generic_tab.svg'"
            alt="tab-favicon"
            @error="setGenericIcon($event)"
          />
        </div>
        <div>
          <p :title="tab.title">{{ tab.title }}</p>
        </div>
        <p :title="tab.url">URL: {{ tab.url }}</p>
      </div>
    </v-col>
    <v-col :cols="12" :sm="12" :md="6">
      <EditTab :tab="tab" :connection="connection" @onTabEditComplete="tabEditComplete" />
    </v-col>
    <v-col :cols="12" :sm="12" :md="6">
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
