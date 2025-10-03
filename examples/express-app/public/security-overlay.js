(function () {
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.bottom = "1rem";
  panel.style.right = "1rem";
  panel.style.maxWidth = "400px";
  panel.style.maxHeight = "200px";
  panel.style.overflowY = "auto";
  panel.style.background = "#111";
  panel.style.color = "#f88";
  panel.style.fontFamily = "monospace";
  panel.style.fontSize = "12px";
  panel.style.padding = "8px";
  panel.style.border = "1px solid #f44";
  panel.style.borderRadius = "6px";
  panel.style.zIndex = "99999";
  panel.innerText = "🔒 Security overlay active…";
  document.body.appendChild(panel);

  async function refresh() {
    try {
      const res = await fetch("/__security");
      const data = await res.json();
      if (!data.issues) return;
      panel.innerHTML = "<b>Security Findings:</b><br/>";
      data.issues.forEach((i) => {
        const div = document.createElement("div");
        div.textContent = `[${i.severity}] ${i.title}`;
        panel.appendChild(div);
      });
    } catch (e) {
      panel.textContent = "Overlay error: " + e;
    }
  }

  setInterval(refresh, 3000);
  refresh();
})();
