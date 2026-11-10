(function () {
  "use strict";
  const app = document.querySelector("[data-ew-app]");
  if (!app) return;
  if (typeof require === "function") window.justifiedLayout = require("justified-layout");
  const base = "/blogs/earthwandering/";
  const grid = document.getElementById("ew-grid");
  const photoView = document.getElementById("ew-photo");
  const status = document.getElementById("ew-status");
  const intro = document.getElementById("ew-intro");
  const heading = document.getElementById("ew-heading");
  const search = document.getElementById("ew-search");
  const jump = document.getElementById("ew-jump");
  const positionInput = document.getElementById("ew-position");
  const cache = new Map();
  let catalog;
  let overviewAlbums = [];
  let gallery = null;
  let routeVersion = 0;
  let frame = 0;
  let photoNavigation = null;
  let resizeObserver = null;
  let currentAlbum = null;
  history.scrollRestoration = "manual";

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function icon(name) {
    const element = node("i");
    element.dataset.lucide = name;
    element.setAttribute("aria-hidden", "true");
    return element;
  }
  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function button(name, label, action) {
    const element = node("button");
    element.type = "button";
    element.title = label;
    element.setAttribute("aria-label", label);
    element.append(icon(name));
    element.addEventListener("click", action);
    return element;
  }
  function url(album, photo, position) {
    const params = new URLSearchParams();
    if (album) params.set("album", album);
    if (photo) params.set("photo", photo);
    if (Number.isInteger(position) && position >= 0) params.set("at", position);
    return base + (params.toString() ? `?${params}` : "");
  }
  function getJSON(path) {
    if (!cache.has(path)) {
      const request = fetch(path).then((response) => {
        if (!response.ok) throw new Error(`Metadata unavailable (${response.status})`);
        return response.json();
      }).catch((error) => { cache.delete(path); throw error; });
      cache.set(path, request);
      if (cache.size > 32) cache.delete(cache.keys().next().value);
    }
    return cache.get(path);
  }
  function data(path) { return getJSON(catalog.data_base + path); }
  function media(photo, size) { return `${catalog.media_base}web/${photo.id}/${size}.webp`; }
  function label(photo) { return photo.title || `Photograph ${photo.id}`; }
  function showStatus(text) { status.textContent = text; status.hidden = !text; }
  function countText(count) { return `${count.toLocaleString()} ${count === 1 ? "item" : "items"}`; }
  function scrollToY(top) { window.scrollTo({ top, left: 0, behavior: "instant" }); }
  function navigate(target) {
    history.replaceState({ ...history.state, scroll: window.scrollY }, "", location.href);
    history.pushState({}, "", target);
    if (catalog) render();
  }
  app.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-ew-nav]");
    if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(link.href);
  });
  window.addEventListener("popstate", () => { if (catalog) render(history.state?.scroll); });

  function thumbnail(photo, width) {
    if (photo.kind === "video") {
      const placeholder = node("span", "ew-video-tile");
      placeholder.append(icon("play"));
      return placeholder;
    }
    const image = node("img");
    image.alt = label(photo);
    image.width = photo.width;
    image.height = photo.height;
    image.loading = "lazy";
    image.decoding = "async";
    image.src = media(photo, "thumb");
    image.srcset = `${media(photo, "thumb")} 320w, ${media(photo, "medium")} 1200w, ${media(photo, "large")} 2400w`;
    image.sizes = `${Math.ceil(width)}px`;
    return image;
  }
  function place(element, box) {
    Object.assign(element.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    const image = element.querySelector("img");
    if (image) image.sizes = `${Math.ceil(box.width)}px`;
  }
  function tile(photo, target, box, title, subtitle) {
    const link = node("a", "ew-tile");
    link.href = target;
    link.dataset.ewNav = "";
    link.setAttribute("aria-label", title || label(photo));
    link.append(thumbnail(photo, box.width));
    const caption = node("span", "ew-caption");
    caption.append(node("strong", "", title || label(photo)));
    if (subtitle) caption.append(node("small", "", subtitle));
    link.append(caption);
    place(link, box);
    return link;
  }
  function geometry(ratios, width, overview = false) {
    if (typeof window.justifiedLayout !== "function") throw new Error("The photo layout library could not load. Please reload.");
    return window.justifiedLayout(ratios, {
      containerWidth: width, targetRowHeight: width < 620 ? (overview ? 170 : 180) : (overview ? 260 : 300),
      targetRowHeightTolerance: .25, boxSpacing: 4, containerPadding: 0, showWidows: true,
    });
  }
  function overview() {
    const query = search.value.toLocaleLowerCase().trim();
    const albums = overviewAlbums.filter((album) => !query || `${album.title} ${album.description}`.toLocaleLowerCase().includes(query));
    const layout = geometry(albums.map((album) => album.cover?.width / album.cover?.height || 16 / 9), grid.clientWidth, true);
    grid.classList.add("ew-overview");
    grid.style.height = `${layout.containerHeight}px`;
    grid.replaceChildren(...albums.map((album, index) => tile(
      album.cover || { kind: "video", title: album.title }, url(album.id), layout.boxes[index], album.title, countText(album.count),
    )));
    icons();
    showStatus(albums.length ? "" : "No matching albums.");
  }
  search.addEventListener("input", overview);
  function scheduleDraw() {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; draw(); });
  }
  window.addEventListener("scroll", scheduleDraw, { passive: true });
  function draw() {
    if (!gallery) return;
    const model = gallery;
    let firstVisible = null;
    let newIcons = false;
    for (const chunk of model.chunks) {
      const rect = chunk.element.getBoundingClientRect();
      if (rect.bottom < -1000 || rect.top > window.innerHeight + 1000) {
        if (chunk.nodes.size) { chunk.element.replaceChildren(); chunk.nodes.clear(); }
        continue;
      }
      if (!chunk.items && !chunk.loading && !chunk.error) {
        chunk.loading = true;
        data(chunk.page.path).then((items) => {
          if (gallery !== model) return;
          chunk.items = items;
          chunk.loading = false;
          scheduleDraw();
        }).catch(() => {
          if (gallery !== model) return;
          chunk.loading = false;
          chunk.error = true;
          const error = node("div", "ew-chunk-error", "These photographs could not load.");
          error.append(button("rotate-cw", "Retry loading photographs", () => { chunk.error = false; error.remove(); scheduleDraw(); }));
          chunk.element.append(error);
          icons();
        });
      }
      if (!chunk.items) continue;
      const visible = new Set();
      chunk.layout.boxes.forEach((box, index) => {
        if (box.top + box.height + rect.top < -700 || box.top + rect.top > window.innerHeight + 700) return;
        visible.add(index);
        const absolute = chunk.page.start + index;
        if (firstVisible === null && box.top + box.height + rect.top > 0) firstVisible = absolute;
        if (!chunk.nodes.has(index)) {
          const photo = chunk.items[index];
          const element = tile(photo, url(model.album.id, photo.id, absolute), box);
          element.dataset.position = absolute;
          const nextIndex = [...chunk.nodes.keys()].filter((value) => value > index).sort((left, right) => left - right)[0];
          chunk.element.insertBefore(element, chunk.nodes.get(nextIndex) || null);
          chunk.nodes.set(index, element);
          if (photo.kind === "video") newIcons = true;
        }
      });
      for (const [index, element] of chunk.nodes) {
        if (!visible.has(index) && !element.contains(document.activeElement)) { element.remove(); chunk.nodes.delete(index); }
      }
    }
    if (firstVisible !== null && document.activeElement !== positionInput) positionInput.value = firstVisible + 1;
    if (newIcons) icons();
  }
  function layoutAlbum() {
    if (!gallery) return;
    const width = grid.clientWidth;
    if (gallery.width === width) return;
    gallery.width = width;
    for (const chunk of gallery.chunks) {
      chunk.layout = geometry(chunk.page.ratios, width);
      chunk.element.style.height = `${chunk.layout.containerHeight}px`;
      for (const [index, element] of chunk.nodes) place(element, chunk.layout.boxes[index]);
    }
    scheduleDraw();
  }
  function albumGrid(album, manifest, position, scroll) {
    gallery = { album, manifest, chunks: [], width: 0 };
    grid.style.height = "";
    for (const page of manifest.pages) {
      const element = node("section", "ew-chunk");
      element.setAttribute("aria-label", `Items ${page.start + 1} to ${page.start + page.count}`);
      grid.append(element);
      gallery.chunks.push({ page, element, items: null, nodes: new Map(), loading: false, error: false });
    }
    layoutAlbum();
    resizeObserver = new ResizeObserver(layoutAlbum);
    resizeObserver.observe(grid);
    if (typeof scroll === "number") scrollToY(scroll);
    else if (position > 0) {
      const chunk = gallery.chunks.find((item) => position >= item.page.start && position < item.page.start + item.page.count);
      if (chunk) {
        const box = chunk.layout.boxes[position - chunk.page.start];
        scrollToY(window.scrollY + chunk.element.getBoundingClientRect().top + box.top - 100);
      }
    } else scrollToY(0);
    scheduleDraw();
  }
  async function itemAt(manifest, position) {
    const page = manifest.pages.find((item) => position >= item.start && position < item.start + item.count);
    if (!page) throw new Error("That photograph is outside this album.");
    return (await data(page.path))[position - page.start];
  }
  async function openPosition(album, manifest, position) {
    try { const summary = await itemAt(manifest, position); navigate(url(album.id, summary.id, position)); }
    catch (error) { showStatus(error.message); }
  }
  function fact(list, title, value) { if (value) list.append(node("dt", "", title), node("dd", "", value)); }
  function photoDetails(photo, album, manifest, position) {
    const bar = node("div", "ew-photo-bar");
    const returnButton = button("arrow-left", "Back to album", () => navigate(url(album.id, null, position)));
    const arrows = node("div");
    const previous = button("chevron-left", "Previous photograph", () => openPosition(album, manifest, position - 1));
    const next = button("chevron-right", "Next photograph", () => openPosition(album, manifest, position + 1));
    previous.disabled = position <= 0;
    next.disabled = position >= album.count - 1;
    arrows.append(previous, node("span", "ew-photo-context", `${(position + 1).toLocaleString()} / ${album.count.toLocaleString()}`), next);
    bar.append(returnButton, arrows);
    photoNavigation = { previous, next, back: returnButton };
    const figure = node("figure", "ew-media");
    const asset = node(photo.kind === "video" ? "video" : "img");
    if (photo.kind === "video") {
      asset.controls = true;
      asset.preload = "metadata";
      asset.src = catalog.media_base + photo.original;
      asset.setAttribute("aria-label", label(photo));
    } else {
      asset.src = media(photo, "large");
      asset.alt = label(photo);
      asset.width = photo.width;
      asset.height = photo.height;
    }
    asset.addEventListener("error", () => {
      asset.hidden = true;
      if (!figure.querySelector(".ew-media-error")) figure.append(node("p", "ew-media-error", "Preview unavailable. The original can be downloaded below."));
    });
    figure.append(asset);
    const info = node("section", "ew-photo-info");
    info.append(node("h2", "", photo.title || photo.filename));
    if (photo.description) info.append(node("p", "", photo.description));
    const facts = node("dl", "ew-photo-facts");
    fact(facts, "Taken", photo.taken);
    fact(facts, "Uploaded", photo.uploaded);
    fact(facts, "Dimensions", photo.width && photo.height ? `${photo.width} x ${photo.height}` : null);
    fact(facts, "Original", `${photo.filename} (${(photo.bytes / 1048576).toFixed(1)} MB)`);
    fact(facts, "License", photo.license);
    info.append(facts);
    const links = node("div", "ew-photo-links");
    const download = node("a", "", "Download original");
    download.href = catalog.media_base + photo.original;
    download.append(icon("download"));
    const source = node("a", "", "Source on Flickr");
    source.href = photo.flickr_url;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    links.append(download, source);
    info.append(links);
    const memberships = node("div", "ew-memberships");
    for (const membership of [{ id: "camera-roll", position: photo.camera_position }, ...photo.albums]) {
      const memberAlbum = catalog.albums.find((value) => value.id === membership.id);
      if (!memberAlbum) continue;
      const link = node("a", "", memberAlbum.title);
      link.href = url(memberAlbum.id, photo.id, membership.position);
      link.dataset.ewNav = "";
      memberships.append(link);
    }
    info.append(memberships);
    if (photo.tags.length) info.append(node("p", "ew-tags", photo.tags.join(" · ")));
    if (photo.comments.length) {
      const comments = node("details", "ew-comments");
      comments.append(node("summary", "", `Comments (${photo.comments.length})`));
      const list = node("ol");
      for (const comment of photo.comments) {
        const entry = node("li");
        entry.append(node("strong", "", comment.author || "Comment"), node("time", "", comment.date || ""), node("p", "", comment.text));
        list.append(entry);
      }
      comments.append(list);
      info.append(comments);
    }
    photoView.append(bar, figure, info);
    document.title = `${photo.title || photo.filename} | Earthwandering`;
    icons();
  }
  jump.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentAlbum) return;
    const position = Math.max(0, Math.min(currentAlbum.count - 1, Number(positionInput.value) - 1));
    navigate(url(currentAlbum.id, null, position));
  });
  document.addEventListener("keydown", (event) => {
    if (!photoNavigation || event.target.closest("input, textarea, select, video, [contenteditable]")) return;
    const action = { ArrowLeft: "previous", ArrowRight: "next", Escape: "back" }[event.key];
    if (action) { event.preventDefault(); photoNavigation[action].click(); }
  });
  async function render(scroll) {
    const ticket = ++routeVersion;
    if (resizeObserver) resizeObserver.disconnect();
    gallery = null;
    photoNavigation = null;
    currentAlbum = null;
    grid.replaceChildren();
    grid.classList.remove("ew-overview");
    grid.style.height = "";
    photoView.querySelectorAll("video").forEach((video) => { video.pause(); video.removeAttribute("src"); video.load(); });
    photoView.replaceChildren();
    const params = new URLSearchParams(location.search);
    const requested = params.get("album") || (params.has("photo") ? "camera-roll" : null);
    const isPhoto = params.has("photo");
    const isOverview = !requested;
    intro.hidden = !isOverview;
    heading.hidden = isOverview || isPhoto;
    grid.hidden = isPhoto;
    photoView.hidden = !isPhoto;
    document.getElementById("ew-search-wrap").hidden = !isOverview;
    jump.hidden = isOverview || isPhoto;
    for (const [id, active] of [["ew-albums-link", isOverview], ["ew-camera-link", requested === "camera-roll"]]) {
      const link = document.getElementById(id);
      if (active) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
    }
    showStatus("Loading photographs...");
    try {
      if (isOverview) {
        document.title = "Earthwandering | Jon Garrison";
        overview();
        resizeObserver = new ResizeObserver(() => { if (!gallery && !intro.hidden) overview(); });
        resizeObserver.observe(grid);
        scrollToY(scroll || 0);
        return;
      }
      let album = catalog.albums.find((value) => value.id === requested);
      if (!album) throw new Error("This album could not be found. Choose Albums to return to the archive.");
      let manifest = await data(album.path);
      if (ticket !== routeVersion) return;
      let position = Math.max(0, Math.min(album.count - 1, Number(params.get("at")) || 0));
      if (isPhoto) {
        let summary = await itemAt(manifest, position);
        if (summary.id !== params.get("photo")) {
          const lookup = (await data("lookup.json"))[params.get("photo")];
          if (!lookup) throw new Error("This photograph could not be found.");
          const detail = (await data(lookup.detail))[params.get("photo")];
          const membership = detail.albums.find((value) => value.id === album.id);
          if (membership) position = membership.position;
          else { album = catalog.albums[0]; manifest = await data(album.path); position = lookup.position; }
          summary = await itemAt(manifest, position);
        }
        const photo = (await data(summary.detail))[summary.id];
        if (ticket !== routeVersion) return;
        photoDetails(photo, album, manifest, position);
        showStatus("");
        scrollToY(scroll || 0);
        return;
      }
      currentAlbum = album;
      document.getElementById("ew-title").textContent = album.title;
      document.getElementById("ew-description").textContent = album.description;
      document.getElementById("ew-description").hidden = !album.description;
      document.getElementById("ew-count").textContent = countText(album.count);
      document.getElementById("ew-position-total").textContent = `/ ${album.count.toLocaleString()}`;
      positionInput.max = album.count;
      positionInput.value = position + 1;
      document.title = `${album.title} | Earthwandering`;
      showStatus("");
      albumGrid(album, manifest, position, scroll);
    } catch (error) { if (ticket === routeVersion) showStatus(error.message); }
  }
  getJSON("/earthwandering/data/index.json").then((value) => {
    catalog = value;
    overviewAlbums = catalog.albums.filter((album) => album.id !== "camera-roll");
    for (let remaining = overviewAlbums.length; remaining > 1; remaining--) {
      const index = Math.floor(Math.random() * remaining);
      [overviewAlbums[remaining - 1], overviewAlbums[index]] = [overviewAlbums[index], overviewAlbums[remaining - 1]];
    }
    const cameraRoll = catalog.albums.find((album) => album.id === "camera-roll");
    if (cameraRoll) overviewAlbums.unshift(cameraRoll);
    document.getElementById("ew-totals").textContent = `${catalog.photo_count.toLocaleString()} photographs · ${catalog.video_count} videos · ${catalog.albums.length - 1} albums`;
    icons();
    render();
  }).catch(() => showStatus("The archive metadata could not load. Please reload to try again."));
})();