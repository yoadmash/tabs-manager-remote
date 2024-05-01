<script setup>
import { initializeApp } from "firebase/app";
import { getFirestore, getDocs, collection } from "firebase/firestore";

import { onMounted, ref } from 'vue';
import TabSelector from './components/TabSelector.vue';
import TabInfo from './components/TabInfo.vue';

let firebaseConfig = null;
let firebaseDB = null;

// const connection_arr_firebase_mock = [
//     {
//         id: 'connection1',
//         saved_windows_count: 1
//     },
//     {
//         id: 'connection2',
//         saved_windows_count: 2
//     }
// ]

// const docs_arr_firebase_mock = [
//     {
//         id: 'connection1',
//         data: [
//             {
//                 "id": 100,
//                 "incognito": false,
//                 "tabs": [
//                     {
//                         "favIconUrl": "https://www.youtube.com/s/desktop/5519da25/img/favicon_32x32.png",
//                         "id": "T1W100",
//                         "incognito": false,
//                         "title": "Vue 3 & Composition API - Full Project - YouTube",
//                         "url": "https://www.youtube.com/watch?v=hNPwdOZ3qFU",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "http://localhost:3000/favicon.ico",
//                         "id": "T2W100",
//                         "incognito": false,
//                         "title": "Tabs Manager - Remote",
//                         "url": "http://localhost:3000/",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//                         "id": "T3W100",
//                         "incognito": false,
//                         "title": "tabs-manager - Cloud Firestore - Data - Firebase console",
//                         "url": "https://console.firebase.google.com/u/0/project/tabs-manager-c41d0/firestore/databases/-default-/data/~2Fconnections_list",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//                         "id": "T4W100",
//                         "incognito": false,
//                         "title": "tabs-manager - Project settings - General - Firebase console",
//                         "url": "https://console.firebase.google.com/u/0/project/tabs-manager-c41d0/settings/general/web:ZGViNTlhMWEtNWJlMi00NTkzLTk0OGMtNThmNzQxYzcwZTRk",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/devrel-devsite/prod/vafe2e13ca17bb026e70df42a2ead1c8192750e86a12923a88eda839025dabf95/firebase/images/favicon.png",
//                         "id": "T5W100",
//                         "incognito": false,
//                         "title": "Get data with Cloud Firestore  |  Firebase",
//                         "url": "https://firebase.google.com/docs/firestore/query-data/get-data",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.youtube.com/s/desktop/5519da25/img/favicon_32x32.png",
//                         "id": "T6W100",
//                         "incognito": false,
//                         "title": "How to add Bootstrap 5 in Vue 3 JS - YouTube",
//                         "url": "https://www.youtube.com/watch?v=kHQamQ2SwQQ",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://vuetifyjs.com/favicon.ico",
//                         "id": "T7W100",
//                         "incognito": false,
//                         "title": "Select component — Vuetify",
//                         "url": "https://vuetifyjs.com/en/components/selects/#usage",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "",
//                         "id": "T8W100",
//                         "incognito": false,
//                         "title": "Extensions - Tabs Manager",
//                         "url": "chrome://extensions/?id=kpbmegbnodhlkaifnldndobbhelaohkl",
//                         "windowId": 100
//                     }
//                 ]
//             }
//         ]
//     },
//     {
//         id: 'connection2',
//         data: [
//             {
//                 "id": 100,
//                 "incognito": false,
//                 "tabs": [
//                     {
//                         "favIconUrl": "https://www.youtube.com/s/desktop/5519da25/img/favicon_32x32.png",
//                         "id": "T1W100",
//                         "incognito": false,
//                         "title": "Vue 3 & Composition API - Full Project - YouTube",
//                         "url": "https://www.youtube.com/watch?v=hNPwdOZ3qFU",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "http://localhost:3000/favicon.ico",
//                         "id": "T2W100",
//                         "incognito": false,
//                         "title": "Tabs Manager - Remote",
//                         "url": "http://localhost:3000/",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//                         "id": "T3W100",
//                         "incognito": false,
//                         "title": "tabs-manager - Cloud Firestore - Data - Firebase console",
//                         "url": "https://console.firebase.google.com/u/0/project/tabs-manager-c41d0/firestore/databases/-default-/data/~2Fconnections_list",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//                         "id": "T4W100",
//                         "incognito": false,
//                         "title": "tabs-manager - Project settings - General - Firebase console",
//                         "url": "https://console.firebase.google.com/u/0/project/tabs-manager-c41d0/settings/general/web:ZGViNTlhMWEtNWJlMi00NTkzLTk0OGMtNThmNzQxYzcwZTRk",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/devrel-devsite/prod/vafe2e13ca17bb026e70df42a2ead1c8192750e86a12923a88eda839025dabf95/firebase/images/favicon.png",
//                         "id": "T5W100",
//                         "incognito": false,
//                         "title": "Get data with Cloud Firestore  |  Firebase",
//                         "url": "https://firebase.google.com/docs/firestore/query-data/get-data",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.youtube.com/s/desktop/5519da25/img/favicon_32x32.png",
//                         "id": "T6W100",
//                         "incognito": false,
//                         "title": "How to add Bootstrap 5 in Vue 3 JS - YouTube",
//                         "url": "https://www.youtube.com/watch?v=kHQamQ2SwQQ",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://vuetifyjs.com/favicon.ico",
//                         "id": "T7W100",
//                         "incognito": false,
//                         "title": "Select component — Vuetify",
//                         "url": "https://vuetifyjs.com/en/components/selects/#usage",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "",
//                         "id": "T8W100",
//                         "incognito": false,
//                         "title": "Extensions - Tabs Manager",
//                         "url": "chrome://extensions/?id=kpbmegbnodhlkaifnldndobbhelaohkl",
//                         "windowId": 100
//                     }
//                 ]
//             },
//             {
//                 "id": 200,
//                 "incognito": false,
//                 "tabs": [
//                     {
//                         "favIconUrl": "https://www.youtube.com/s/desktop/5519da25/img/favicon_32x32.png",
//                         "id": "T1W100",
//                         "incognito": false,
//                         "title": "Vue 3 & Composition API - Full Project - YouTube",
//                         "url": "https://www.youtube.com/watch?v=hNPwdOZ3qFU",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "http://localhost:3000/favicon.ico",
//                         "id": "T2W100",
//                         "incognito": false,
//                         "title": "Tabs Manager - Remote",
//                         "url": "http://localhost:3000/",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//                         "id": "T3W100",
//                         "incognito": false,
//                         "title": "tabs-manager - Cloud Firestore - Data - Firebase console",
//                         "url": "https://console.firebase.google.com/u/0/project/tabs-manager-c41d0/firestore/databases/-default-/data/~2Fconnections_list",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//                         "id": "T4W100",
//                         "incognito": false,
//                         "title": "tabs-manager - Project settings - General - Firebase console",
//                         "url": "https://console.firebase.google.com/u/0/project/tabs-manager-c41d0/settings/general/web:ZGViNTlhMWEtNWJlMi00NTkzLTk0OGMtNThmNzQxYzcwZTRk",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.gstatic.com/devrel-devsite/prod/vafe2e13ca17bb026e70df42a2ead1c8192750e86a12923a88eda839025dabf95/firebase/images/favicon.png",
//                         "id": "T5W100",
//                         "incognito": false,
//                         "title": "Get data with Cloud Firestore  |  Firebase",
//                         "url": "https://firebase.google.com/docs/firestore/query-data/get-data",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://www.youtube.com/s/desktop/5519da25/img/favicon_32x32.png",
//                         "id": "T6W100",
//                         "incognito": false,
//                         "title": "How to add Bootstrap 5 in Vue 3 JS - YouTube",
//                         "url": "https://www.youtube.com/watch?v=kHQamQ2SwQQ",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "https://vuetifyjs.com/favicon.ico",
//                         "id": "T7W100",
//                         "incognito": false,
//                         "title": "Select component — Vuetify",
//                         "url": "https://vuetifyjs.com/en/components/selects/#usage",
//                         "windowId": 100
//                     },
//                     {
//                         "favIconUrl": "",
//                         "id": "T8W100",
//                         "incognito": false,
//                         "title": "Extensions - Tabs Manager",
//                         "url": "chrome://extensions/?id=kpbmegbnodhlkaifnldndobbhelaohkl",
//                         "windowId": 100
//                     }
//                 ]
//             }
//         ]
//     }
// ]

const docs = ref([]);
const connections = ref([]);
const selectedTab = ref(null);

onMounted(() => {
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
    const app = initializeApp(firebaseConfig);
    firebaseDB = getFirestore(app);
    getDocsFromFirebase();
    // getDocsFromFirebaseOffline();
});

const getDocsFromFirebase = async () => {
    const connections_ids = await getDocs(collection(firebaseDB, 'connections_list'));
    connections_ids.docs.forEach(async doc => {
        connections.value.push({
            title: `${doc.id} - [${doc.data().saved_windows_count} saved windows]`,
            value: doc.id
        });
        const collection_data = await getDocs(collection(firebaseDB, doc.id));
        const collection_data_obj = {
            id: doc.id,
            data: collection_data.docs.map(doc => doc.data())
        }
        docs.value.push(collection_data_obj);
    });
}

// const getDocsFromFirebaseOffline = async () => {
//     connection_arr_firebase_mock.forEach(doc => {
//         connections.value.push({
//             title: `${doc.id} - [${doc.saved_windows_count} saved windows]`,
//             value: doc.id
//         });
//     });
//     docs.value = docs_arr_firebase_mock;
// }

const selectComplete = (data) => {
    selectedTab.value = data;
}

const selectorsChanges = () => {
    if(selectedTab.value) {
        selectedTab.value = null;
    }
} 

</script>

<template>
    <h2>Tabs Manager - Remote Access</h2>
    <TabSelector :connections="connections" :docs="docs" @onSelectComplete="selectComplete" @onSelectorsChanges="selectorsChanges"/>
    <TabInfo :tab="selectedTab" v-if="selectedTab" />
</template>

<style>
body {
    height: 95vh;
    display: flex;
    justify-content: center;
    /* align-items: center; */
}

#app {
    width: 95vw;
}
</style>