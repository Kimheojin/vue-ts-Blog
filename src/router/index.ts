import { createRouter, createWebHistory } from 'vue-router';


import Menu from "../components/Menu.vue";


const routes = [

    {
        path: '/menu',
        components: {
            menu: Menu
        }
    },


];



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;