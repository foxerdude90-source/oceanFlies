// Simple SPA Router for Ocean.studio
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    this.beforeEach = null;
    window.addEventListener('popstate', () => this.resolve());
  }

  on(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  guard(fn) {
    this.beforeEach = fn;
    return this;
  }

  navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, '', path);
    } else {
      history.pushState(null, '', path);
    }
    this.resolve();
  }

  resolve() {
    const path = window.location.pathname;
    const handler = this.routes[path] || this.routes['*'];

    if (this.beforeEach) {
      const next = this.beforeEach(path);
      if (next && next !== path) {
        this.navigate(next, true);
        return;
      }
    }

    if (handler) {
      this.currentRoute = path;
      handler();
    }
  }

  start() {
    this.resolve();
  }
}

export const router = new Router();
