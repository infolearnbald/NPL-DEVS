export function renderPlayground(el) {
  el.innerHTML = `
    <textarea id="html" placeholder="HTML"></textarea>
    <textarea id="css" placeholder="CSS"></textarea>
    <textarea id="js" placeholder="JS"></textarea>
    <iframe id="preview"></iframe>
  `;

  document.querySelectorAll("textarea").forEach(t =>
    t.addEventListener("input", () => {
      preview.srcdoc = `
        <style>${css.value}</style>
        ${html.value}
        <script>${js.value}<\/script>
      `;
    })
  );
}

