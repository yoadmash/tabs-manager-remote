<script setup>
import {
  connectToFirebase,
  getDataFromFirebase,
  sort,
  authenticate,
} from "./api/firebase.js";

import { onMounted, ref } from "vue";
import TabSelector from "./components/TabSelector.vue";
import TabInfo from "./components/TabInfo.vue";

const authorized = ref(false);
const password = ref("");
const show_password = ref(false);
const docs = ref([]);
const connections = ref([]);
const selectedTab = ref(null);
const connection = ref("");
const reverse_sort = ref({});

onMounted(async () => {
  if (import.meta.env?.VITE_APP_DEV_MODE !== "true") {
    connectToFirebase();
  }
  authorized.value = Boolean(localStorage.getItem("auth")) || false;
  if (authorized.value) {
    await getData();
  }
});

const getData = async () => {
  const firebaseData = await getDataFromFirebase();
  docs.value = firebaseData?.docs;
  connections.value = firebaseData?.connections;
  reverse_sort.value = firebaseData?.remote_settings?.reverse_sort;
};

const selectComplete = (data) => {
  selectedTab.value = data.tab;
  connection.value = data.connection;
};

const selectorsChanges = () => {
  selectedTab.value = null;
};

const login = async () => {
  if (password.value.length) {
    const res = await authenticate(password.value);
    if (res) {
      password.value = "";
      show_password.value = false;
      authorized.value = true;
      localStorage.setItem("auth", Number(authorized.value));
      await getData();
    }
  }
};

const logout = async () => {
  authorized.value = false;
  selectedTab.value = null;
  connections.value = [];
  localStorage.removeItem("auth");
  localStorage.removeItem("auth_level");
};
</script>

<template>
  <template v-if="!authorized">
    <form @submit.prevent="login" class="login">
      <v-text-field
        label="Password"
        v-model="password"
        :type="!show_password ? 'password' : 'text'"
        :append-inner-icon="!show_password ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="show_password = !show_password"
      />
      <v-btn @click="login" color="success" variant="outlined" block>Login</v-btn>
    </form>
  </template>
  <template v-else>
    <div class="title">
      <h3>Tabs Manager - Remote Access</h3>
      <v-menu transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-btn color="success" variant="outlined" size="small" v-bind="props">
            Menu
          </v-btn>
        </template>
        <v-list style="padding: 0">
          <v-list-item v-if="reverse_sort && Object.keys(reverse_sort).includes('tabs')">
            <v-btn
              color="black"
              variant="plain"
              size="small"
              slim
              :prepend-icon="
                reverse_sort?.tabs ? 'mdi-sort-ascending' : 'mdi-sort-descending'
              "
              :text="reverse_sort?.tabs ? 'Normal tabs list' : 'Reverse tabs list'"
              @click="sort(reverse_sort, 'tabs', !reverse_sort?.tabs)"
            />
          </v-list-item>
          <v-list-item
            v-if="reverse_sort && Object.keys(reverse_sort).includes('windows')"
          >
            <v-btn
              color="black"
              variant="plain"
              size="small"
              slim
              :prepend-icon="
                reverse_sort?.windows ? 'mdi-sort-ascending' : 'mdi-sort-descending'
              "
              :text="
                reverse_sort?.windows ? 'Normal windows list' : 'Reverse windows list'
              "
              @click="sort(reverse_sort, 'windows', !reverse_sort?.windows)"
            />
          </v-list-item>
          <v-list-item>
            <v-btn
              color="black"
              variant="plain"
              size="small"
              slim
              prepend-icon="mdi-logout"
              @click="logout"
              text="Logout"
            />
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <TabSelector
      :load="connections.length === 0"
      :connections="connections"
      :docs="docs"
      :reverse_sort="reverse_sort || {}"
      @onSelectComplete="selectComplete"
      @onSelectorsChanges="selectorsChanges"
    />

    <TabInfo
      v-if="selectedTab"
      :tab="selectedTab"
      :connection="String(connection)"
    />
  </template>
</template>

<style lang="scss">
body {
  margin: 10px;
  height: 95vh;
  display: flex;
  justify-content: center;

  #app {
    width: 75vw;

    @media only screen and (max-width: 1264px) {
      width: 95vw;
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
  }
}
</style>
