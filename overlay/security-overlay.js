(function () {
  const endpoint =
    document.currentScript?.getAttribute("data-security-endpoint") || "/__security";

  function start() {
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
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.issues)) return;

        panel.textContent = "";
        const heading = document.createElement("strong");
        heading.textContent = "Security Findings:";
        panel.appendChild(heading);
        data.issues.forEach((issue) => {
          const finding = document.createElement("div");
          finding.textContent = `[${issue.severity}] ${issue.title}`;
          panel.appendChild(finding);
        });
      } catch (error) {
        panel.textContent = `Overlay error: ${String(error)}`;
      }
    }

    setInterval(refresh, 3000);
    refresh();
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
