import { createRouter, createWebHistory } from 'vue-router';


import Menu from "../components/Menu.vue";
import AboutMe from "../views/Aboutme.vue";
import LoginPage from "../views/LoginPage.vue";
import AdminPage from "../views/AdminPage.vue";
import PostWrite from "../views/PostWrite.vue";
import CategoryAdd from "../components/admin/CategoryAdd.vue";
import CategoryPosts from "../views/CategoryPosts.vue";
import CategoryDelete from "../components/admin/CategoryDelete.vue";
import CategoryModify from "../components/admin/CategoryModify.vue";

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
        path: '/admin/category/modify',
        component: CategoryModify
    },
    {
        path: '/admin/category/delete',
        component: CategoryDelete
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