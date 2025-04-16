// Googleスプレッドシート「typlistq」から公開されたCSV出力URL
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiPjinpplwJNlxfsnVPTBOg-q7fPk_Zv7l2Qyq443ISc_ahQxhcpzcQ31HncXZlHGKRy36LKVVixaA/pub?output=csv';

/**
 * CSVデータをパースして、問題データ（問題文と回答のペア）の配列に変換する関数
 * ※ 各行は "問題,回答" の形式になっている前提です
 */
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

/**
 * Googleスプレッドシートから問題データを非同期に取得する関数
 */
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

// ページがロードされたら実行
document.addEventListener('DOMContentLoaded', async function() {
  // Googleスプレッドシートから問題データをロード
  const problems = await loadProblems();
  if (problems.length === 0) {
    console.error("問題データが存在しません");
    return;
  }

  let score = 0;
  let currentProblem = null;

  // DOM要素の取得
  const questionDisplay = document.getElementById('question-display'); // index.html内の問題表示部分
  const userInput = document.getElementById('user-input');           // 入力欄
  const scoreDisplay = document.getElementById('score');               // スコア表示

  // ランダムに問題を取得する関数
  function getRandomProblem() {
    return problems[Math.floor(Math.random() * problems.length)];
  }

  // 最初の問題を表示
  currentProblem = getRandomProblem();
  questionDisplay.textContent = currentProblem.question;

  // ユーザーの入力を監視するイベントリスナー
  userInput.addEventListener('keyup', function() {
    // 入力値をトリムして、現在の問題の回答と比較（大文字小文字も一致する前提）
    if (userInput.value.trim() === currentProblem.answer) {
      score++;
      scoreDisplay.textContent = "Score: " + score;

      // 新しい問題に更新
      currentProblem = getRandomProblem();
      questionDisplay.textContent = currentProblem.question;

      // 入力欄をクリア
      userInput.value = '';
    }
  });
});
