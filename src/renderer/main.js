import { createApp } from 'vue';
import './style.css';
import './libs/bootstrap5.0.2.min.js';
import router from './router.js';
import App from './App.vue'

const app = createApp(App);
app.use(router);
app.mount('#app');


