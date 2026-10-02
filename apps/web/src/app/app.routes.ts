import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'network-debugging', pathMatch: 'full' },
  {
    path: 'network-debugging',
    loadComponent: () => import('./pages/workshop/network-debugging-page.component').then((m) => m.WorkshopPageComponent),
    data: { title: 'Network Debugging', intro: 'Learn to inspect the requests that move data between the browser and an application.', icon: '↔' },
    title: 'Network Debugging',
  },
  {
    path: 'performance',
    loadComponent: () => import('./pages/workshop/performance-page.component').then((m) => m.PerformancePageComponent),
    data: { title: 'Performance', intro: 'Understand what the browser was doing when the interface became slow or unresponsive.', icon: '◒' },
    title: 'Performance',
  },
  {
    path: 'console-snippets',
    loadComponent: () => import('./pages/workshop/console-snippets-page.component').then((m) => m.ConsoleSnippetsPageComponent),
    data: { title: 'Console & Snippets', intro: 'Use the browser console to inspect, instrument and experiment with a running app.', icon: '>_' },
    title: 'Console & Snippets',
  },
  {
    path: 'breakpoints',
    loadComponent: () => import('./pages/workshop/breakpoints-page.component').then((m) => m.BreakpointsPageComponent),
    data: { title: 'Breakpoints', intro: 'Follow execution and call stacks to find the code responsible for unexpected behaviour.', icon: '⊙' },
    title: 'Breakpoints',
  },
  {
    path: 'environment-region',
    loadComponent: () => import('./pages/workshop/environment-region-page.component').then((m) => m.EnvironmentRegionPageComponent),
    data: { title: 'Environment & Region', intro: 'Your browser environment is part of the application state.', icon: '◎' },
    title: 'Environment & Region',
  },
  {
    path: 'devtools-mcp',
    loadComponent: () => import('./pages/workshop/workshop-page.component').then((m) => m.WorkshopPageComponent),
    data: { title: 'DevTools MCP', intro: 'Give an AI coding agent enough browser context to investigate behaviour with you.', icon: '✦' },
    title: 'DevTools MCP',
  },
  { path: '**', redirectTo: 'network-debugging' },
];
