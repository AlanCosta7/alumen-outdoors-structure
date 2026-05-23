import type { RouteRecordRaw } from 'vue-router'

const MENU = [
  // Site
  { label: 'Configurações',     link: 'admin-config',    icon: 'settings' },
  { label: 'Textos das Páginas', link: 'admin-pages',    icon: 'description' },
  { label: 'Rodapé',            link: 'admin-footer',    icon: 'web' },
  { label: 'Banners',           link: 'cms-faixa',       icon: 'view_carousel' },
  // Conteúdo
  { label: 'Serviços',          link: 'admin-services',  icon: 'build' },
  { label: 'Projetos',          link: 'admin-projects',  icon: 'photo_library' },
  { label: 'Equipe',            link: 'admin-team',      icon: 'people' },
  // Dev
  { label: 'Seed Firebase',     link: 'admin-seed',      icon: 'cloud_upload' },
]

const routes: RouteRecordRaw[] = [
  // ── Site público ────────────────────────────────────────────────────────────
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',               component: () => import('pages/IndexPage.vue') },
      { path: 'about',          component: () => import('pages/AboutPage.vue') },
      { path: 'services/:slug', component: () => import('pages/ServicePage.vue') },
      { path: 'projects',       component: () => import('pages/ProjectsPage.vue') },
      { path: 'contact',        component: () => import('pages/ContactPage.vue') },
    ],
  },

  // ── Admin login (sem sidebar) ─────────────────────────────────────────────────
  { path: '/admin/login', name: 'admin-login', component: () => import('pages/admin/LoginPage.vue') },

  // ── Admin (com sidebar) ───────────────────────────────────────────────────────
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    props: { title: 'Alumen — Painel', menu: MENU },
    children: [
      // Redirect raiz para config
      { path: '', redirect: { name: 'admin-config' } },
      // Site
      { path: 'config',   name: 'admin-config',   component: () => import('pages/admin/ConfigAdmin.vue') },
      { path: 'pages',    name: 'admin-pages',    component: () => import('pages/admin/PagesAdmin.vue') },
      { path: 'footer',   name: 'admin-footer',   component: () => import('pages/admin/FooterAdmin.vue') },
      // Conteúdo
      { path: 'services', name: 'admin-services', component: () => import('pages/admin/ServicesAdmin.vue') },
      { path: 'projects', name: 'admin-projects', component: () => import('pages/admin/ProjectsAdmin.vue') },
      { path: 'team',     name: 'admin-team',     component: () => import('pages/admin/TeamAdmin.vue') },
      // Dev
      { path: 'seed',     name: 'admin-seed',     component: () => import('pages/admin/SeedAdmin.vue') },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────────────────────
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
