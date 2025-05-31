import { createRouter, createWebHistory } from 'vue-router';


import Menu from "../components/Menu.vue";
import AboutMe from "../views/Aboutme.vue";
import LoginPage from "../views/LoginPage.vue";
import AdminPage from "../views/AdminPage.vue";
import PostWrite from "../views/PostWrite.vue";
import CategoryAdd from "../components/CategoryAdd.vue";
import CategoryPosts from "../views/CategoryPosts.vue";

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
        path: '/admin/login',
        component: LoginPage
    },
    {
        path: '/admin',
        component: AdminPage
    },
    {
        path: '/admin/post/write',
        component: PostWrite
    },
    {
        path: '/admin/category/add',
        component: CategoryAdd
    },
    {
        path: '/category/:categoryName',
        component: CategoryPosts
    }

];



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;