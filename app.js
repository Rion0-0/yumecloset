const $ = (id) => document.getElementById(id);

const defaultSettings = {
  userProfile: "りの。甘えるのは少し苦手だけど、本当はお姫様みたいに大事にされたい。泣くときは理由が言葉にならないことがある。",
  partnerProfile: "彼。優しくて、泣いても急かさず受け止めるタイプ。甘やかし上手で、安心させる言葉をくれる。",
  rules: "好き：よしよし、抱きしめる、寝かしつけ、静かな慰め、彼女を否定しない言葉。NG：無理やり感、軽すぎる慰め、茶化しすぎ。"
};

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("yumeSettings") || "null") || defaultSettings;
  $("userProfile").value = saved.userProfile;
  $("partnerProfile").value = saved.partnerProfile;
  $("rules").value = saved.rules;
  return saved;
}

function saveSettings() {
  const settings = {
    userProfile: $("userProfile").value.trim(),
    partnerProfile: $("partnerProfile").value.trim(),
    rules: $("rules").value.trim()
  };
  localStorage.setItem("yumeSettings", JSON.stringify(settings));
  alert("設定を保存したよ♡");
}

function makePrompt(mood = "") {
  const settings = loadSettings();
  const free = $("freeMood").value.trim();
  const selected = mood || "今日の気分";
  const prompt = `以下の設定で、彼との夢小説を書いて。

【今日の処方テーマ】
${selected}

【今の気分・状況】
${free || "おまかせ。甘くて安心できる雰囲気にして。"}

【私の設定】
${settings.userProfile}

【彼の設定】
${settings.partnerProfile}

【関係性ルール・好き/NG】
${settings.rules}

【書き方】
・日本語で
・一人称は「私」
・会話多め
・彼は急かさず、受け止める
・甘やかしは濃いめ
・最後は安心して眠れる/落ち着ける余韻
・長さは中〜長め
・AIっぽい説明文ではなく、小説本文だけ`;
  $("promptOutput").value = prompt;
}

function saveStory() {
  const title = $("storyTitle").value.trim();
  const tags = $("storyTags").value.trim();
  const body = $("storyBody").value.trim();

  if (!title || !body) {
    alert("タイトルと本文は入れてね！");
    return;
  }

  const stories = JSON.parse(localStorage.getItem("yumeStories") || "[]");
  stories.unshift({
    id: Date.now(),
    title,
    tags,
    body,
    createdAt: new Date().toLocaleDateString("ja-JP")
  });
  localStorage.setItem("yumeStories", JSON.stringify(stories));

  $("storyTitle").value = "";
  $("storyTags").value = "";
  $("storyBody").value = "";
  renderStories();
}

function renderStories() {
  const stories = JSON.parse(localStorage.getItem("yumeStories") || "[]");
  const list = $("storyList");
  if (!stories.length) {
    list.innerHTML = `<div class="card">まだ作品がないよ。ちゃぴに書いてもらった回を貼って保存しよ♡</div>`;
    return;
  }

  list.innerHTML = stories.map(story => `
    <article class="story-item">
      <h3>${escapeHtml(story.title)}</h3>
      <div class="tags">${escapeHtml(story.tags || "タグなし")} ・ ${story.createdAt}</div>
      <p>${escapeHtml(story.body)}</p>
      <button class="delete" data-delete="${story.id}">削除</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.delete);
      const next = stories.filter(s => s.id !== id);
      localStorage.setItem("yumeStories", JSON.stringify(next));
      renderStories();
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

document.querySelectorAll("[data-mood]").forEach(btn => {
  btn.addEventListener("click", () => makePrompt(btn.dataset.mood));
});

$("makePrompt").addEventListener("click", () => makePrompt());
$("copyPrompt").addEventListener("click", async () => {
  const text = $("promptOutput").value;
  if (!text) return alert("まだプロンプトがないよ！");
  await navigator.clipboard.writeText(text);
  alert("コピーしたよ♡ ちゃぴに投げて！");
});

$("saveStory").addEventListener("click", saveStory);
$("saveSettings").addEventListener("click", saveSettings);

loadSettings();
renderStories();
