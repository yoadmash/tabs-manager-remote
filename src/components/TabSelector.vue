<script setup>
import { computed, h, ref, watch } from "vue";

const emit = defineEmits(["onSelectComplete", "onSelectorsChanges"]);
const props = defineProps({
  connections: {
    type: Array,
    required: true,
  },
  docs: {
    type: Array,
    required: true,
  },
  reverse_sort: {
    type: Object,
    required: true,
  },
  load: {
    type: Boolean,
    required: true,
  },
  test: {
    type: [Object, null],
    required: false,
  },
});

const data_selected = ref({
  connection: null,
  window: null,
  tab: null,
});

watch(
  () => props.test,
  (newV, oldV) => {
    if (newV) {
      data_selected.value.tab = newV;
    }
  }
);

const connection_input = ref(null);
const windows_input = ref(null);
const free_search_input = ref(null);
const tabs_input = ref(null);
const search_by = ref(0);

const search_by_items = [
  { value: 0, title: "Title" },
  { value: 1, title: "URL" },
];

const windows_list = ref([]);
const tabs_list = ref([]);
const all_tabs = ref([]);
const search_results = ref([]);
const allow_tab_search = ref(false);
const allow_window_search = ref(false);
const allow_connection_search = ref(false);

const selectConnection = () => {
  if (search_results.value.length) {
    search_results.value = [];
  }
  emit("onSelectorsChanges");
  data_selected.value.window = null;
  data_selected.value.tab = null;
  windows_list.value = computed(() => {
    const docObj = props.docs.find(
      (doc) => doc.id === data_selected.value.connection?.value
    );

    const windows_list_arr = [];
    docObj?.data.map((window) => {
      const noFreeSlot = window?.tabs?.filter((tab) => tab?.url);

      windows_list_arr.push({
        title: `${window.title ? `${window.id}: ${window.title}` : window.id} - [${
          noFreeSlot.length
        } tabs]`,
        value: window.id,
        tabs: noFreeSlot,
      });
    });

    return props.reverse_sort.windows ? windows_list_arr.reverse() : windows_list_arr;
  });

  if (windows_list.value.length) {
    connection_input.value.blur();
  }

  all_tabs.value = [];
  windows_list.value.value.map((window) => all_tabs.value.push(...window.tabs));
};

const selectWindow = () => {
  emit("onSelectorsChanges");
  if (search_results.value.length) {
    search_results.value = [];
  }
  data_selected.value.tab = null;
  tabs_list.value = computed(() => {
    const windowObj = windows_list?.value?.value.find(
      (window) => window.value === data_selected?.value?.window?.value
    );
    const tabs_list_arr = [];
    windowObj?.tabs.map((tab, index) => {
      if (tab?.url) {
        tabs_list_arr.push({
          ...tab,
          index,
          props: {
            prependIcon: h("img", {
              src: tab.favIconUrl || "/generic_tab.svg",
              style: "width: 20px; height: 20px;",
              onError: (e) => {
                e.target.src = "/generic_tab.svg";
              },
            }),
          },
        });
      }
    });
    return props.reverse_sort.tabs ? tabs_list_arr.reverse() : tabs_list_arr;
  });

  if (tabs_list.value.length) {
    windows_input.value.blur();
  }
};

const selectComplete = (input) => {
  if (typeof data_selected.value.tab === "object") {
    if (input === "tabs_input") {
      if (tabs_list.value.value.includes(data_selected.value.tab)) {
        tabs_input.value.blur();
      }
    } else {
      if (search_results.value.includes(data_selected.value.tab)) {
        free_search_input.value.blur();
      }
    }
    if (data_selected.value.tab) {
      emit("onSelectComplete", {
        tab: data_selected.value.tab,
        all_tabs: tabs_list.value.value?.length
          ? tabs_list.value.value
          : search_results.value,
        connection: data_selected.value.connection.value,
      });
    }
  }
};

const connectionCleared = () => {
  connection_input.value.blur();
  emit("onSelectorsChanges");
};

const windowCleared = () => {
  windows_input.value.blur();
  emit("onSelectorsChanges");
};

const tabCleared = (input) => {
  if (input === "tabs_input") {
    tabs_input.value.blur();
  } else if (input === "free_search_input") {
    free_search_input.value.blur();
  }
  emit("onSelectorsChanges");
};

const freeSearch = () => {
  if (free_search_input.value.modelValue.length > 0) {
    search_results.value = [];
    all_tabs.value.filter((tab) => {
      const searchTarget = search_by.value === 0 ? tab.title : tab.url;
      if (
        searchTarget
          .toLowerCase()
          .includes(free_search_input.value.modelValue.toLowerCase())
      ) {
        search_results.value.push({
          ...tab,
          editable: false,
          title: `${tab.windowId}: ${tab.title}`,
        });
      }
    });
    if (search_results.value.length) {
      search_results.value = search_results.value.map((tab, index) => ({
        ...tab,
        props: {
          prependIcon: h("img", {
            src: tab.favIconUrl || "/generic_tab.svg",
            style: "width: 20px; height: 20px;",
            onError: (e) => {
              e.target.src = "/generic_tab.svg";
            },
          }),
        },
        index,
      }));
    }
  }
  data_selected.value.tab = null;
};

const freeSearchBlur = (focused) => {
  if (!data_selected.value.tab) {
    search_results.value = [];
  } else if (focused) {
    data_selected.value.tab = null;
    emit("onSelectorsChanges");
  }
};

const openAllTabs = () => {
  tabs_list.value.value.forEach(tab => {
    window.open(tab.url, "_blank");
  })
}
</script>

<template>
  <v-row>
    <v-col
      :md="data_selected.connection && windows_list.value.length ? 8 : 12"
      :cols="12"
    >
      <v-select
        v-if="!allow_connection_search"
        variant="outlined"
        :loading="load"
        :disabled="load"
        clearable
        persistent-clear
        return-object
        label="Connection"
        ref="connection_input"
        v-model="data_selected.connection"
        :items="connections"
        :menu-props="{ maxWidth: 100 }"
        append-inner-icon="mdi-magnify"
        @click:append-inner="allow_connection_search = true"
        @update:model-value="selectConnection"
        @click:clear="connectionCleared"
      />
      <v-combobox
        v-else
        variant="outlined"
        :loading="load"
        :disabled="load"
        clearable
        persistent-clear
        label="Connection"
        ref="connection_input"
        v-model="data_selected.connection"
        :items="connections"
        :menu-props="{ maxWidth: 100 }"
        append-inner-icon="mdi-magnify-remove-outline"
        @click:append-inner="allow_connection_search = false"
        @update:model-value="selectConnection"
        @click:clear="connectionCleared"
      />
    </v-col>
    <v-col
      v-if="data_selected.connection && windows_list.value.length"
      :cols="12"
      :md="4"
    >
      <v-select
        v-if="!allow_window_search"
        variant="outlined"
        clearable
        persistent-clear
        return-object
        label="Window"
        ref="windows_input"
        v-model="data_selected.window"
        :items="windows_list.value"
        :menu-props="{ maxWidth: 100 }"
        append-inner-icon="mdi-magnify"
        @click:append-inner="allow_window_search = true"
        @update:model-value="selectWindow"
        @click:clear="windowCleared"
      />
      <v-combobox
        v-else
        variant="outlined"
        clearable
        persistent-clear
        label="Window"
        ref="windows_input"
        v-model="data_selected.window"
        :items="windows_list.value"
        :menu-props="{ maxWidth: 100 }"
        append-inner-icon="mdi-magnify-remove-outline"
        @click:append-inner="allow_window_search = false"
        @update:model-value="selectWindow"
        @click:clear="windowCleared"
      />
    </v-col>
    <v-col
      v-if="!data_selected.window && data_selected.connection && all_tabs.length"
      :cols="12"
      :md="2"
    >
      <v-select
        variant="outlined"
        clearable
        persistent-clear
        label="Search by"
        v-model="search_by"
        :items="search_by_items"
      />
    </v-col>
    <v-col
      v-if="!data_selected.window && data_selected.connection && all_tabs.length"
      :cols="12"
      :md="10"
    >
      <v-combobox
        :disabled="search_by === null"
        variant="outlined"
        clearable
        persistent-clear
        :label="`Free Search ${
          search_results.length ? `(${search_results.length})` : ''
        }`"
        ref="free_search_input"
        v-model="data_selected.tab"
        :items="search_results"
        :menu-props="{ maxWidth: 100 }"
        append-inner-icon="mdi-magnify"
        @click:clear="tabCleared('free_search_input')"
        @update:model-value="selectComplete"
        @click:append-inner="freeSearch"
        @update:focused="freeSearchBlur($event)"
        @keyup.enter="freeSearch"
        @keyup.esc="freeSearchBlur"
      />
    </v-col>
    <v-col :cols="12" v-if="data_selected.window && tabs_list.value.length">
      <v-select
        v-if="!allow_tab_search"
        variant="outlined"
        clearable
        persistent-clear
        return-object
        label="Tab"
        ref="tabs_input"
        v-model="data_selected.tab"
        :items="tabs_list.value"
        :menu-props="{ maxWidth: 100 }"
        append-inner-icon="mdi-magnify"
        @click:append-inner="allow_tab_search = true"
        @click:clear="tabCleared('tabs_input')"
        @update:model-value="selectComplete('tabs_input')"
      />
      <v-combobox
        v-else
        variant="outlined"
        clearable
        persistent-clear
        label="Tab"
        ref="tabs_input"
        :items="tabs_list.value"
        :menu-props="{ maxWidth: 100 }"
        v-model="data_selected.tab"
        append-inner-icon="mdi-magnify-remove-outline"
        @click:append-inner="allow_tab_search = false"
        @click:clear="tabCleared('tabs_input')"
        @update:model-value="selectComplete('tabs_input')"
      />
    </v-col>
    <v-col :cols="12" v-if="data_selected.window && tabs_list.value.length && !data_selected.tab">
      <v-btn block variant="outlined" color="green" @click="openAllTabs()">Open All Tabs</v-btn>
    </v-col>
  </v-row>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  gap: 25px;
  border: 1px solid black;
}
</style>
