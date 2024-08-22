<script setup>
import { ref } from "vue";

const props = defineProps({
  tab: {
    type: Object,
    required: true,
  },
});

const example = {
  title: " ",
  favIconUrl: " ",
  url: " ",
};

const error = ref(false);
const validJSON = ref(true);
const textAreaRows = ref(1);
const tabData = ref({ ...props.tab, json: "" });

const updateRows = (focused) => {
  textAreaRows.value = focused ? 5 : tabData.value.json ? 5 : 1;
};

const updateTab = () => {
  if ((!tabData.value.title || !tabData.value.url) && !tabData.value.json) {
    error.value = true;
    return;
  }

  if (tabData.value.json) {
    try {
      if (JSON.parse(tabData.value.json)) {
        tabData.value = JSON.parse(tabData.value.json);
      }
    } catch (err) {
      console.log(err);
      error.value = true;
      validJSON.value = false;
      return;
    }
  }

  console.log(tabData.value);
};

const clearError = (focused) => {
  if (focused) {
    error.value = false;
    validJSON.value = true;
  }
};
</script>

<template>
  <v-dialog max-width="500">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn block variant="outlined" color="green" v-bind="activatorProps"
        >Edit Tab</v-btn
      >
    </template>
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>Edit Tab</v-card-title>
        <v-card-subtitle>ID: {{ tab.id }}</v-card-subtitle>
        <v-card-text>
          <v-text-field
            clearable
            label="Title"
            variant="outlined"
            v-model="tabData.title"
            :error="error && !tabData.title"
            @update:focused="clearError($event)"
          />
          <v-text-field
            clearable
            label="URL"
            variant="outlined"
            v-model="tabData.url"
            :error="error && !tabData.url"
            @update:focused="clearError($event)"
          />
          <v-text-field
            clearable
            label="FavIconUrl"
            variant="outlined"
            v-model="tabData.favIconUrl"
          />
          <v-textarea
            v-if="!tabData.title && !tabData.url && !tabData.favIconUrl"
            clearable
            no-resize
            persistent-hint
            label="Tab JSON"
            variant="outlined"
            :error="error && !validJSON"
            :hint="validJSON ? 'Required if Title and URL are empty' : 'Invalid JSON'"
            :rows="textAreaRows"
            :placeholder="JSON.stringify(example, null, 2)"
            v-model="tabData.json"
            @update:focused="updateRows($event), clearError($event)"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn text="Clear fields" @click="tabData = {title: '', url: '', favIconUrl: '', json: ''}" />
          <v-spacer></v-spacer>
          <v-btn
            text="Close"
            @click="
              tabData = { ...tab };
              isActive.value = false;
            "
          />
          <v-btn text="Save" @click="updateTab" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style></style>
