<script setup>
import { computed, ref } from "vue";

const data_selected = ref({
  connection: null,
  window: null,
  tab: null,
});

const connection_input = ref(null);
const windows_input = ref(null);
const tabs_input = ref(null);

const windows_list = ref([]);
const tabs_list = ref([]);

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
      (doc) => doc.id === data_selected.value.connection.value
    );
    const windows_list_arr = [];
    docObj?.data.map((window) => {
      windows_list_arr.push({
        title: `${window.id} - [${window.tabs.length} tabs]`,
        value: window.id,
        tabs: window.tabs,
      });
    });
    if (windows_list_arr.length) {
      connection_input.value.blur();
    }
    return windows_list_arr;
  });
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

const selectComplete = () => {
  if(typeof data_selected.value.tab === 'object') {
    emit("onSelectComplete", data_selected.value.tab);
    if(tabs_list.value.value.includes(data_selected.value.tab)) {
      tabs_input.value.blur();
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

const tabCleared = () => {
  tabs_input.value.blur();
  emit("onSelectorsChanges");
};
</script>

<template>
  <v-row>
    <v-col
      :cols="12"
      :md="data_selected.connection && windows_list.value.length ? 8 : 12"
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
    <v-col :cols="12" :md="4">
      <v-combobox
        v-if="data_selected.connection && windows_list.value.length"
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
    <v-col :cols="12">
      <v-combobox
        v-if="data_selected.window && tabs_list.value.length"
        ref="tabs_input"
        clearable
        label="Tab"
        :items="tabs_list.value"
        :menu-props="{ maxWidth: 100 }"
        v-model="data_selected.tab"
        @click:clear="tabCleared"
        @update:model-value="selectComplete"
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
