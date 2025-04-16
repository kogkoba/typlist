/********************************************************
 * タイピングクイズゲーム - ID対応版
 * ・CSVファイルから問題を読み込む（ID,問題,ひらがな解答,漢字解答）
 * ・ユーザーはひらがなで回答し、Enterで判定＋演出
 * ・不正解ならGASへ問題IDを送信して回数更新
 ********************************************************/

/* ----------------- 定数定義 ----------------- */

// CSVの公開URL
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiPjinpplwJNlxfsnVPTBOg-q7fPk_Zv7l2Qyq443ISc_ahQxhcpzcQ31HncXZlHGKRy36LKVVixaA/pub?output=csv';

// GASのWebアプリURL（デプロイURL）
const gasUrl = 'https://script.google.com/macros/s/AKfycbzenv9k1TnemXyQCyH2zloq41YoZtN-NXpFX27W5yH9Ak1Rkii4GRpXkQoWkseT_U3x7A/exec';

/* ----------------- GAS送信関数 ----------------- */
function logWrongAnswer(problemId, correctAnswer, userAnswer) {
  fetch(gasUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemId: problemId,
      correctAnswer: correctAnswer,
      userAnswer: userAnswer
      
    })
  }).then(() => {
    console.log('ログ送信完了');
  }).catch(err => {
    console.error('ログ送信失敗:', err);
  });
}
// ✅ 正解のときのログ送信（この関数を追加！）
function logCorrectAnswer(problemId) {
  fetch(gasUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correctId: problemId })
  })
  .then(() => {
    console.log('✅ 正解ログ送信完了');
  })
  .catch(error => {
    console.error('⚠️ 正解ログ送信エラー:', error);
  });
}
/* ----------------- CSV読み込み＆パース ----------------- */
function parseCSV(data) {
  return data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line => {
      const parts = line.split(',');
      if (parts.length < 3) return null;
      return {
        id: parts[0].trim(),                         // ID
        question: parts[1].trim(),                   // 問題文
        answer: parts[2].trim(),                     // ひらがな解答（正解判定用）
        displayAnswer: parts[3]?.trim() || parts[2].trim() // 漢字解答（表示用）
      };
    })
    .filter(item => item !== null);
}

/* ----------------- 問題取得 ----------------- */
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

/* ----------------- メイン処理 ----------------- */
document.addEventListener('DOMContentLoaded', async () => {
  const problems = await loadProblems();
  if (problems.length === 0) {
    console.error("問題データが存在しません");
    return;
  }

  let score = 0;
  let currentProblem = null;

  // HTML要素取得
  const questionDisplay = document.getElementById('question-display');
  const userInput = document.getElementById('user-input');
  const scoreDisplay = document.getElementById('score');

  // ランダム出題関数
  function getRandomProblem() {
    return problems[Math.floor(Math.random() * problems.length)];
  }

  // 出題関数
  function setNewProblem() {
    currentProblem = getRandomProblem();
    questionDisplay.textContent = currentProblem.question;
    userInput.value = '';
  }

  // 初回出題
  setNewProblem();

  // Enterキーで解答チェック
  userInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
      const userAnswer = userInput.value.trim();
      if (userAnswer === currentProblem.answer) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        questionDisplay.textContent = "正解！ 答え：" + currentProblem.displayAnswer;
         // ✅ 正解ログを送信（←ここに追加！）
  logCorrectAnswer(currentProblem.id);
}
      } else {
        questionDisplay.textContent = "不正解… 正解は：" + currentProblem.displayAnswer;
        logWrongAnswer(currentProblem.id, currentProblem.answer, userAnswer);
      }

      // 2秒後に次の問題
      setTimeout(() => {
        setNewProblem();
      }, 2000);
    }
  });
});
