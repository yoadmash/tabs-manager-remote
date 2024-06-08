<script setup>
import { computed, ref } from "vue";

const data_selected = ref({
  connection: null,
  window: null,
  tab: null,
});

const connection_input = ref(null);
const windows_input = ref(null);
const free_search_input = ref(null);
const tabs_input = ref(null);

const windows_list = ref([]);
const tabs_list = ref([]);
const all_tabs = ref([]);
const search_results = ref([]);

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
});

const selectConnection = () => {
  emit("onSelectorsChanges");
  data_selected.value.window = null;
  data_selected.value.tab = null;
  windows_list.value = computed(() => {
    const docObj = props.docs.find(
      (doc) => doc.id === data_selected.value.connection?.value
    );

    const windows_list_arr = [];
    docObj?.data.map((window) => {
      windows_list_arr.push({
        title: `${window.title ? `${window.id}: ${window.title}` : window.id} - [${
          window.tabs.length
        } tabs]`,
        value: window.id,
        tabs: window.tabs,
      });
    });

    if (windows_list_arr.length) {
      connection_input.value.blur();
    }
    return windows_list_arr;
  });

  all_tabs.value = [];
  windows_list.value.value.map((window) => all_tabs.value.push(...window.tabs));
};

const selectWindow = () => {
  emit("onSelectorsChanges");
  data_selected.value.tab = null;
  tabs_list.value = computed(() => {
    const windowObj = windows_list.value.value.find(
      (window) => window.value === data_selected.value.window.value
    );
    const tabs_list_arr = [];
    windowObj?.tabs.map((tab) => {
      tabs_list_arr.push(tab);
    });
    if (tabs_list_arr.length) {
      windows_input.value.blur();
    }
    return tabs_list_arr;
  });
};

const selectComplete = (input) => {
  if (typeof data_selected.value.tab === "object") {
    emit("onSelectComplete", data_selected.value.tab);
    if (input === "tabs_input") {
      if (tabs_list.value.value.includes(data_selected.value.tab)) {
        tabs_input.value.blur();
      }
    } else {
      free_search_input.value.blur();
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
  if(free_search_input.value.modelValue.length > 0) {
    search_results.value = all_tabs.value.filter(tab => tab.title.toLowerCase().includes(free_search_input.value.modelValue.toLowerCase()));
  }
};

const freeSearchBlur = () => {
  search_results.value = [];
}

</script>

<template>
  <v-row>
    <v-col
      :cols="12"
      :md="
        data_selected.connection &&
        windows_list.value.length &&
        !free_search_input?.modelValue?.length
          ? 8
          : 12
      "
    >
      <v-combobox
        ref="connection_input"
        clearable
        label="Connection"
        :items="connections"
        v-model="data_selected.connection"
        :menu-props="{ maxWidth: 100 }"
        @update:model-value="selectConnection"
        @click:clear="connectionCleared"
        persistent-clear
      />
    </v-col>
    <v-col
      :cols="12"
      :md="4"
      v-if="
        data_selected.connection &&
        windows_list.value.length &&
        !free_search_input?.modelValue?.length
      "
    >
      <v-combobox
        ref="windows_input"
        clearable
        label="Window"
        :items="windows_list.value"
        :menu-props="{ maxWidth: 100 }"
        v-model="data_selected.window"
        @update:model-value="selectWindow"
        @click:clear="windowCleared"
        persistent-clear
      />
    </v-col>
    <v-col :cols="12" v-if="!data_selected.window && data_selected.connection">
      <v-combobox
        ref="free_search_input"
        clearable
        :label="`Free Search ${
          search_results.length ? `(${search_results.length})` : ''
        }`"
        :items="search_results"
        :menu-props="{ maxWidth: 100 }"
        v-model="data_selected.tab"
        @click:clear="tabCleared('free_search_input')"
        @update:model-value="selectComplete"
        persistent-clear
        append-inner-icon="mdi-magnify"
        @click:append-inner="freeSearch"
        @update:focused="freeSearchBlur"
        @keyup.enter="freeSearch"
      />
    </v-col>
    <v-col :cols="12" v-if="data_selected.window && tabs_list.value.length">
      <v-combobox
        ref="tabs_input"
        clearable
        label="Tab"
        :items="tabs_list.value"
        :menu-props="{ maxWidth: 100 }"
        v-model="data_selected.tab"
        @click:clear="tabCleared('tabs_input')"
        @update:model-value="selectComplete('tabs_input')"
        persistent-clear
      />
    </v-col>
  </v-row>
</template>

<style scoped>
.header {
  display: flex;
  gap: 25px;
  border: 1px solid black;
}
</style>
