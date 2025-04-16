const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiPjinpplwJNlxfsnVPTBOg-q7fPk_Zv7l2Qyq443ISc_ahQxhcpzcQ31HncXZlHGKRy36LKVVixaA/pub?output=csv';

function parseCSV(data) {
  return data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line => {
      const parts = line.split(',');
      if (parts.length < 2) {
        return null;
      }
      return {
        question: parts[0].trim(),
        answer: parts[1].trim()
      };
    })
    .filter(item => item !== null);
}

async function loadProblems() {
  try {
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    const problems = parseCSV(csvData);
    return problems;
  } catch (error) {
    console.error("問題データの取得に失敗しました:", error);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const problems = await loadProblems();
  if (problems.length === 0) {
    console.error("問題データが存在しません");
    return;
  }

  let score = 0;
  let currentProblem = null;

  // ここでHTML要素を取得
  const questionDisplay = document.getElementById('question-display');
  const userInput = document.getElementById('user-input');
  const scoreDisplay = document.getElementById('score');

  function getRandomProblem() {
    return problems[Math.floor(Math.random() * problems.length)];
  }

  // 初回問題をセット
  currentProblem = getRandomProblem();
  questionDisplay.textContent = currentProblem.question;

  userInput.addEventListener('keyup', () => {
    // ユーザー入力と回答を比較
    if (userInput.value.trim() === currentProblem.answer) {
      score++;
      scoreDisplay.textContent = 'Score: ' + score;

      // 次の問題へ
      currentProblem = getRandomProblem();
      questionDisplay.textContent = currentProblem.question;

      // 入力欄をクリア
      userInput.value = '';
    }
  });
});
