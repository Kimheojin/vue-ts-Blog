import { createRouter, createWebHistory } from 'vue-router';


import Menu from "../components/Menu.vue";
import Aboutme from "../views/Aboutme.vue";



const routes = [

    {
        path: '/menu',
        component: Menu
    },
    {
        path: '/about',
        component: Aboutme
    },

];



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;