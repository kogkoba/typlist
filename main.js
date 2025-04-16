// まずはサンプルとして、固定のワードリストを用意
const words = [
  "apple",
  "banana",
  "cherry",
  "date",
  "elderberry"
];

// スコア（初期値は0）
let score = 0;

// ランダムに単語を取得する関数
function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

// ページが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', () => {
  const wordDisplay = document.getElementById('word-display');
  const userInput = document.getElementById('user-input');
  const scoreDisplay = document.getElementById('score');

  // 最初の単語をランダムに表示
  let currentWord = getRandomWord();
  wordDisplay.textContent = currentWord;

  // 入力欄の操作
  userInput.addEventListener('keyup', () => {
    // 入力値をトリミングして比較
    if (userInput.value.trim() === currentWord) {
      // スコア加算
      score++;
      scoreDisplay.textContent = "Score: " + score;

      // 新しい単語を取得し、表示を更新
      currentWord = getRandomWord();
      wordDisplay.textContent = currentWord;

      // 入力欄をクリア
      userInput.value = '';
    }
  });
});

