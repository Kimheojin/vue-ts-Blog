import { createRouter, createWebHistory } from 'vue-router';


import Menu from "../components/Menu.vue";
import AboutMe from "../views/Aboutme.vue";
import LoginPage from "../views/LoginPage.vue";
import AdminPage from "../views/AdminPage.vue";
import PostWrite from "../views/admin/PostWrite.vue";
import CategoryAdd from "../views/admin/CategoryAdd.vue";
import CategoryPosts from "../components/post/CategoryPosts.vue";
import CategoryDelete from "../views/admin/CategoryDelete.vue";
import CategoryModify from "../views/admin/CategoryModify.vue";
import PostDelete from "../views/admin/PostDelete.vue";
import PostModify from "../views/admin/PostModify.vue";
import CommentAdmin from "../views/admin/CommentAdmin.vue";
import Allposts from "../components/post/Allposts.vue";
import PostDetail from "../components/PostDetail.vue";

const routes = [

    {
        path: '/',
        component: Allposts  // 홈 페이지를 전체 게시글 리스트로 설정
    },
    {
        path: '/posts',
        component: Allposts  // 전체 게시글 리스트
    },
    {
        path: '/post/:postId',
        component: PostDetail,  // 단일 게시글 보기
        props: true
    },
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
        path: '/admin/post/delete',
        component: PostDelete
    },
    {
        path: '/admin/post/modify',
        component: PostModify
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
    },
    {
        path: '/admin/comment',
        component: CommentAdmin
    },

];



const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;