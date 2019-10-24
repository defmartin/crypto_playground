import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import DecentralisedFace from "./views/DecentralisedFace.vue";
import Test from "./views/Test.vue";

Vue.use(Router);

export default new Router({
mode: 'history',
  routes: [
    {
        path: "/",
        component: Home
      },
    {
        path: "/face",
        component: DecentralisedFace
      },
      {
        path: "/home",
        component: Home
      },
      {
        path: "/test",
        component: Test
      },
  ]
});
