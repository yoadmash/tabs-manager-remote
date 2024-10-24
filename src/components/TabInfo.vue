<script setup>
import { ref, watch, h, onMounted, onUnmounted } from "vue";
import EditTab from "./EditTab.vue";

let initX = null;
let initY = null;
let card = null;

const emit = defineEmits(["onCurrentTabIndexChange"]);
const props = defineProps({
  currentTabIndex: {
    type: Number,
    required: true,
  },
  all_tabs: {
    type: Object,
    required: true,
  },
  connection: {
    type: String,
    required: true,
  },
});

onMounted(() => {
  card = document.querySelector(".tabInfo");
  card.addEventListener("touchstart", touchStart, false);
  card.addEventListener("touchmove", touchMove, false);
});

const tab = ref(props.all_tabs[props.currentTabIndex]);
const currentTabPaginationIndex = ref(props.currentTabIndex + 1);
watch(
  () => props.currentTabIndex,
  (newIndex, oldIndex) => {
    tab.value = props.all_tabs[newIndex];
    currentTabPaginationIndex.value = newIndex + 1;
  }
);

const touchStart = (e) => {
  initX = e.touches[0].clientX;
  initY = e.touches[0].clientY;
};

const touchMove = (e) => {
  e.preventDefault();
  if (initX === null) {
    return;
  }

  if (initY === null) {
    return;
  }

  var currX = e.touches[0].clientX;
  var currY = e.touches[0].clientY;

  var diffX = initX - currX;
  var diffY = initY - currY;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    const prevIndex = currentTabPaginationIndex.value - 1;
    const nextIndex = currentTabPaginationIndex.value + 1;
    if (diffX > 0) {
      // swipe left
      setCurrentTab(prevIndex > 0 ? prevIndex : props.all_tabs.length);
    } else {
      // swipe right
      setCurrentTab(nextIndex <= props.all_tabs.length ? nextIndex : 1);
    }
  }

  initX = null;
  initY = null;
};

const setCurrentTab = (index) => {
  emit("onCurrentTabIndexChange", index - 1);
};

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
  <v-row style="margin: 0">
    <v-col :cols="12" :sm="12" v-if="all_tabs.length > 1">
      <v-pagination
        rounded
        size="small"
        :length="all_tabs.length"
        :total-visible="5"
        :model-value="currentTabPaginationIndex"
        @update:model-value="setCurrentTab"
      />
    </v-col>
    <v-col :cols="12">
      <v-card
        class="tabInfo mx-auto border border-dark"
        tag="p"
        :prepend-icon="
          h('img', {
            src: tab?.favIconUrl || '/generic_tab.svg',
            style: 'width: 25px; height: 25px;',
            onError: (e) => setGenericIcon(e),
          })
        "
        :subtitle="tab.url"
        width="100%"
      >
        <v-card-text :title="tab.title" tag="p">{{ tab.title }}</v-card-text>
      </v-card>
    </v-col>
    <v-col :cols="12" :sm="12" :md="tab?.editable !== false ? 6 : 12">
      <a :href="tab.url" target="_blank">
        <v-btn block variant="outlined" color="green">Open Tab</v-btn>
      </a>
    </v-col>
    <v-col :cols="12" :sm="12" :md="6" v-if="tab?.editable !== false">
      <EditTab :tab="tab" :connection="connection" @onTabEditComplete="tabEditComplete" />
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
p {
  cursor: default;
  word-break: break-all;
  white-space: wrap;
  overflow: hidden;
}

a {
  text-decoration: none;
}
</style>
