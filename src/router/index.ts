import { createRouter, createWebHistory } from 'vue-router';


import Menu from "../components/Menu.vue";
import AboutMe from "../views/Aboutme.vue";
import LoginPage from "../views/LoginPage.vue";
import Markdown from "../views/Markdown.vue";
import AdminPage from "../views/AdminPage.vue";

const routes = [

    {
        path: '/menu',
        component: Menu
    },
    {
        path: '/about',
        component: AboutMe
    },
    {
        path: '/login',
        component: LoginPage
    },
    {
        path: '/admin',
        component: AdminPage
    },
    {
        path: '/markTest',
        component: Markdown
    }

];



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;