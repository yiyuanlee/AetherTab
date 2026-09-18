export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let changed = false;

    if (url.hostname === "www.aethertab.com") {
      url.hostname = "aethertab.com";
      changed = true;
    }

    if (url.pathname.endsWith(".html")) {
      url.pathname = url.pathname === "/index.html" ? "/" : url.pathname.slice(0, -".html".length);
      changed = true;
    }

    if (changed) {
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
