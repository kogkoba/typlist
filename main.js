/********************************************************
 * タイピングクイズゲーム - 更新版
 * ・CSVファイルから問題を読み込む（問題,ひらがな解答,漢字解答）
 * ・ユーザーはひらがなで回答し、Enterキー押下時に正解／不正解の演出を実施
 * ・正解の場合、「正解！　答え：漢字解答」を表示しスコア加算
 * ・不正解の場合、「不正解…　正解は：漢字解答」を表示し、GASへ誤答ログを送信
 ********************************************************/

/* ----------------- 定数の定義 ----------------- */

// CSVから問題データを取得するURL（スプレッドシート公開CSV URL）
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQiPjinpplwJNlxfsnVPTBOg-q7fPk_Zv7l2Qyq443ISc_ahQxhcpzcQ31HncXZlHGKRy36LKVVixaA/pub?output=csv';

// GASのWebアプリURL（デプロイしたURLに置き換えてください）
const gasUrl = 'https://script.google.com/macros/s/AKfycbzenv9k1TnemXyQCyH2zloq41YoZtN-NXpFX27W5yH9Ak1Rkii4GRpXkQoWkseT_U3x7A/exec';

/* ----------------- GAS誤答ログ送信関数 ----------------- */
/* ユーザーが誤答した場合、GASへPOSTリクエストを送信して
   誤答ログを記録するための関数です。 */
function logWrongAnswer(question, correctAnswer, userAnswer) {
  fetch(gasUrl, {
    method: 'POST',
    mode: 'no-cors', // CORS対策（必要に応じて調整）
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      question: question,         // 誤答対象の問題文
      correctAnswer: correctAnswer, // ひらがな正解（比較用）
      userAnswer: userAnswer        // ユーザーが入力した誤答
    })
  })
  .then(response => {
    console.log('ログ送信完了');
  })
  .catch(error => {
    console.error('ログ送信エラー:', error);
  });
}

/* ----------------- CSVパース関数 ----------------- */
/* CSVデータを配列に変換する関数です。  
   CSV各行は「問題,ひらがな解答,漢字解答」の形式を想定しています。  
   漢字解答がない場合はひらがな解答を表示用として利用します。 */
function parseCSV(data) {
  return data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line => {
      const parts = line.split(',');
      if (parts.length < 2) return null;
      return {
        question: parts[0].trim(),                         // 問題文
        answer: parts[1].trim(),                             // 正解（ひらがな入力用）
        displayAnswer: (parts.length >= 3 ? parts[2].trim()   // 漢字表記（表示用）
                         : parts[1].trim())
      };
    })
    .filter(item => item !== null);
}

/* ----------------- 問題データ取得関数 ----------------- */
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

/* ----------------- DOMContentLoaded イベント ----------------- */
// 以下はブラウザで実行されるタイピングゲームのメイン処理です。
document.addEventListener('DOMContentLoaded', async () => {
  const problems = await loadProblems();
  if (problems.length === 0) {
    console.error("問題データが存在しません");
    return;
  }

  let score = 0;
  let currentProblem = null;

  // HTML内の要素を取得
  const questionDisplay = document.getElementById('question-display');
  const userInput = document.getElementById('user-input');
  const scoreDisplay = document.getElementById('score');

  // 問題データ配列からランダムな1問を選択する関数
  function getRandomProblem() {
    return problems[Math.floor(Math.random() * problems.length)];
  }

  // 初回の問題を設定
  currentProblem = getRandomProblem();
  questionDisplay.textContent = currentProblem.question;

  // ユーザー入力のイベントリスナー（Enterキー押下時の処理）
  userInput.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
      const userAnswer = userInput.value.trim();
      
      // ひらがなでの正解チェック
      if (userAnswer === currentProblem.answer) {
        // 正解の場合の処理
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        // 漢字表記の正解演出を表示
        questionDisplay.textContent = "正解！　答え：" + currentProblem.displayAnswer;
      } else {
        // 不正解の場合の処理
        questionDisplay.textContent = "不正解…　正解は：" + currentProblem.displayAnswer;
        // 誤答ログを送信
        logWrongAnswer(currentProblem.question, currentProblem.answer, userAnswer);
      }
      
      // 2秒後に次の問題へ移行（演出用タイムアウト）
      setTimeout(function() {
        currentProblem = getRandomProblem();
        questionDisplay.textContent = currentProblem.question;
        userInput.value = ''; // 入力欄をクリア
      }, 2000);
    }
  });
});
