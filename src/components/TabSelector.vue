<script setup>
import { computed, ref } from "vue";

const data_selected = ref({
  connection: null,
  window: null,
  tab: null,
});

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
    docObj.data.map((window) => {
      windows_list_arr.push({
        title: `${window.id} - [${window.tabs.length} tabs]`,
        value: window.id,
        tabs: window.tabs,
      });
    });
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
    windowObj.tabs.map((tab) => {
      tabs_list_arr.push(tab);
    });
    return tabs_list_arr;
  });
};

const selectComplete = () => {
  emit("onSelectorsChanges");
  emit("onSelectComplete", data_selected.value.tab);
};

const connectionCleared = () => {
  data_selected.value.connection = null;
  data_selected.value.window = null;
  data_selected.value.tab = null;
  emit("onSelectComplete", data_selected.value.tab);
};

const windowCleared = () => {
  data_selected.value.window = null;
  data_selected.value.tab = null;
  emit("onSelectComplete", data_selected.value.tab);
};

const tabCleared = () => {
  data_selected.value.tab = null;
};

</script>

<template>
  <v-row>
    <v-col :cols="12" :md="data_selected.connection ? 8 : 12">
      <v-combobox
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
        v-if="data_selected.connection"
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
        v-if="data_selected.window"
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
