import { nextTick } from 'vue';
import { createRouter, createWebHashHistory, createWebHistory  } from 'vue-router';

import Home from './components/pages/Home.vue';
import BlocksManager from './components/pages/BlocksManager.vue';
const routes = [
    {
        path: '/',
        name: 'home',
        component: BlocksManager
    },
    {
        path: '/blocks-manager',
        name: 'blocks-manager',
        component: BlocksManager
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    mode: 'hash',
    routes: routes
});

export default router;

