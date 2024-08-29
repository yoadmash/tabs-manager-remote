<script setup>
import { ref, watch } from "vue";
import { editTab } from "./../api/firebase.js";

const emit = defineEmits(["onTabEditComplete"]);
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

const error = ref(false);
const validJSON = ref({
  valid: true,
  invalidMessage: "",
});
const textAreaRows = ref(1);
const editComplete = ref(false);
const tabData = ref({ ...props.tab, json: "" });
watch(
  () => props.tab,
  (newV, oldV) => {
    tabDate.value = { ...newV, json: "" };
})

const example = {
  title: " ",
  favIconUrl: " ",
  url: " ",
};

const updateRows = (focused) => {
  textAreaRows.value = focused ? 5 : tabData.value.json ? 5 : 1;
};

const updateTab = async () => {
  if ((!tabData.value.title || !tabData.value.url) && !tabData.value.json) {
    error.value = true;
    return;
  }

  if (tabData.value.json) {
    const validKeys = ["title", "url", "favIconUrl"];
    try {
      const parsedJSON = JSON.parse(tabData.value.json);
      for (const key in parsedJSON) {
        if (!validKeys.includes(key)) {
          throw new Error(`Valid keys only: ${[...validKeys]}`);
        }
      }

      tabData.value = parsedJSON;
    } catch (err) {
      console.error(err.message);
      error.value = true;
      validJSON.value = {
        valid: false,
        invalidMessage: err.message,
      };
      return;
    }
  }

  const data = {
    ...props.tab,
    title: tabData.value.title,
    url: tabData.value.url,
    favIconUrl: tabData.value.favIconUrl || "",
  };
  
  try {
    const success = await editTab(props.connection, data);
    if (success) {
      editComplete.value = false;
      tabData.value = data;
      emit("onTabEditComplete", data);
    }
  } catch (err) {
    console.error(err);
  }
};

const clearError = (focused) => {
  if (focused) {
    error.value = false;
    validJSON.value = {
      valid: true,
      invalidMessage: "",
    };
  }
};
</script>

<template>
  <v-dialog max-width="500" persistent v-model="editComplete">
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
            v-if="!tabData.json"
            clearable
            label="Title"
            variant="outlined"
            v-model="tabData.title"
            :error="error && !tabData.title"
            @update:focused="clearError($event)"
          />
          <v-text-field
            v-if="!tabData.json"
            clearable
            label="URL"
            variant="outlined"
            v-model="tabData.url"
            :error="error && !tabData.url"
            @update:focused="clearError($event)"
          />
          <v-text-field
            v-if="!tabData.json"
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
            :error="error && !validJSON.valid"
            :hint="
              validJSON.valid
                ? 'Required if Title and URL are empty'
                : validJSON.invalidMessage
            "
            :rows="textAreaRows"
            :placeholder="JSON.stringify(example, null, 2)"
            v-model="tabData.json"
            @update:focused="updateRows($event), clearError($event)"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            text="Clear fields"
            @click="tabData = { title: '', url: '', favIconUrl: '', json: '' }"
          />
          <v-spacer></v-spacer>
          <v-btn
            text="Close"
            @click="
              isActive.value = false;
              tabData = { ...tab };
            "
          />
          <v-btn text="Save" @click="updateTab" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style></style>
