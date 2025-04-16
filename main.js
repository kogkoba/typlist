const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiPjinpplwJNlxfsnVPTBOg-q7fPk_Zv7l2Qyq443ISc_ahQxhcpzcQ31HncXZlHGKRy36LKVVixaA/pub?output=csv';
const gasUrl = 'https://script.google.com/macros/s/AKfycbzenv9k1TnemXyQCyH2zloq41YoZtN-NXpFX27W5yH9Ak1Rkii4GRpXkQoWkseT_U3x7A/exec';

// 間違いログ送信
function logWrongAnswer(problemId, correctAnswer, userAnswer) {
  fetch(gasUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, correctAnswer, userAnswer })
  });
}

// 正解ログ送信
function logCorrectAnswer(problemId) {
  fetch(gasUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correctId: problemId })
  });
}

function parseCSV(data) {
  const lines = data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const rows = lines.slice(1); // ← 1行目（ヘッダー）を除外！

  return rows
    .map(line => {
      const parts = line.split(',');
      if (parts.length < 4) return null;
      return {
        id: parts[0].trim(),
        question: parts[1].trim(),
        answer: parts[2].trim(),
        displayAnswer: parts[3]?.trim() || parts[2].trim(),
        mistakeCount: Number(parts[4]) || 0,
        correctCount: Number(parts[5]) || 0
      };
    })
    .filter(item => item !== null);
}


// 問題取得
async function loadProblems() {
  try {
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (err) {
    console.error("問題の読み込み失敗:", err);
    return [];
  }
}

// メイン処理
document.addEventListener('DOMContentLoaded', async () => {
  const problems = await loadProblems();
  if (problems.length === 0) {
    console.error("問題データがありません");
    return;
  }

  let score = 0;
  let currentProblem = null;

  const questionDisplay = document.getElementById('question-display');
  const userInput = document.getElementById('user-input');
  const scoreDisplay = document.getElementById('score');
  const modeSelect = document.getElementById('mode-select');

  // 出題モードに応じて問題を絞り込む
function getFilteredProblems() {
  const mode = modeSelect.value;
  if (mode === 'all') {
    return problems;
  } else if (mode === 'unanswered') {
    // ✅ 正解したことが一度もない問題だけを出題
    return problems.filter(p => p.correctCount === 0);
  }
  return problems;
}



  // ランダムに1問出す
  function getRandomProblem() {
    const filtered = getFilteredProblems();
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // 出題
  function setNewProblem() {
    currentProblem = getRandomProblem();
    if (!currentProblem) {
      questionDisplay.textContent = "出題できる問題がありません";
      return;
    }
    questionDisplay.textContent = currentProblem.question;
    userInput.value = '';
  }

  setNewProblem();

  userInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter" && currentProblem) {
      const userAnswer = userInput.value.trim();
      if (userAnswer === currentProblem.answer) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        questionDisplay.textContent = "正解！ 答え：" + currentProblem.displayAnswer;
        logCorrectAnswer(currentProblem.id);
      } else {
        questionDisplay.textContent = "不正解… 正解は：" + currentProblem.displayAnswer;
        logWrongAnswer(currentProblem.id, currentProblem.answer, userAnswer);
      }

      setTimeout(() => {
        setNewProblem();
      }, 2000);
    }
  });

  // モードが変更されたときに再出題
  modeSelect.addEventListener('change', () => {
    setNewProblem();
  });
});
