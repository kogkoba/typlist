const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiPjinpplwJNlxfsnVPTBOg-q7fPk_Zv7l2Qyq443ISc_ahQxhcpzcQ31HncXZlHGKRy36LKVVixaA/pub?output=csv';

// GASのWebアプリURL（デプロイ後に取得したURLに置き換えてください）
const gasUrl = 'https://script.google.com/macros/s/AKfycbwLvBnSRl6GMMMGD8PlyUrHJsN9nbQ6oym5TAukvkICsNjr_zo7uJm6S4chUJ0jsTBh/exec';

// logWrongAnswer 関数を定義
function logWrongAnswer(question, correctAnswer, userAnswer) {
  fetch(gasUrl, {
    method: 'POST',
    mode: 'no-cors', // CORS対策（必要ならサーバー側と調整してください）
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: question,
      correctAnswer: correctAnswer,
      userAnswer: userAnswer
    })
  })
  .then(response => {
    console.log('ログ送信完了');
  })
  .catch(error => {
    console.error('ログ送信エラー:', error);
  });
}

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

 // ユーザー入力のイベントリスナー（keydownでEnterキー検知）
  userInput.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      const userAnswer = userInput.value.trim();

      // 正解の場合の処理
      if (userAnswer === currentProblem.answer) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
      } else {
        // ※ここで誤答のログを送信
        // ※logWrongAnswer関数はあらかじめ実装してGASにPOSTする関数です
        logWrongAnswer(currentProblem.question, currentProblem.answer, userAnswer);
      }


      // 次の問題へ
      currentProblem = getRandomProblem();
      questionDisplay.textContent = currentProblem.question;

      // 入力欄をクリア
      userInput.value = '';
    }
  });
});
