<script setup>
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  getDocs,
  collection,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { connectToFirebase, getDataFromFirebase, authenticate } from "./api/firebase.js";

import { onMounted, ref } from "vue";
import TabSelector from "./components/TabSelector.vue";
import TabInfo from "./components/TabInfo.vue";

const authorized = ref(false);
const password = ref("");
const show_password = ref(false);
const docs = ref([]);
const connections = ref([]);
const selectedTab = ref(null);
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

const getData = async (auth_level) => {
  const firebaseData = await getDataFromFirebase();
  docs.value = firebaseData?.docs;
  connections.value = firebaseData?.connections;
  reverse_sort.value = firebaseData?.remote_settings?.reverse_sort;
};

const selectComplete = (data) => {
  selectedTab.value = data;
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

const sort = async (type, setting) => {
  reverse_sort.value[type] = setting;
  // try {
  //   await setDoc(doc(firebaseDB, "remote_settings", "reverse_sort"), reverse_sort.value, {
  //     merge: true,
  //   });
  // } catch (err) {
  //   console.log(err);
  // }
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
        :type="!show_password ? 'password' : 'text'"
        label="Password"
        v-model="password"
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
              @click="sort('tabs', !reverse_sort?.tabs)"
            />
          </v-list-item>
          <v-list-item v-if="reverse_sort && Object.keys(reverse_sort).includes('windows')">
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
              @click="sort('windows', !reverse_sort?.windows)"
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

    <TabInfo :tab="selectedTab" v-if="selectedTab" />
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
