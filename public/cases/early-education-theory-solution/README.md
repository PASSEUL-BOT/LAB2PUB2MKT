# Logic Blueprint Challenge（整合版：離線為主＋兒童邏輯教學）

由 Google Opal「Rafa Logic Flow Backward」重建。**不使用 AI、不需要 API 金鑰、不需要通行碼、不連網。**
流程：按 Start → 旁白 → 三關答題（類別 → 國家 → 城市）→ 解鎖藍圖與總結。共 20 個地標，每局隨機抽一個，20 局內不重複。

> 這是整合後的正式版本，取代之前需要 Gemini 金鑰的即時版：離線題庫為主體，並內建給小朋友的邏輯判斷過程與英文旁白。即時 Gemini 版已不再維護，也不包含在這個資料夾。

## 一、最簡單的使用方式
解壓縮後，直接用瀏覽器開啟 `index.html` 就能玩（不需要網站伺服器）。

## 二、上線（Vercel，不用寫程式）
1. 登入 https://github.com ，建立新的 repository（名稱例如 `logic-blueprint`）。
2. 按 **uploading an existing file**，把解壓後資料夾**裡面的全部檔案**拖進去，按 **Commit changes**。
3. 登入 https://vercel.com （用 GitHub 登入）→ **Add New… → Project** → 選該 repository → **Deploy**。
4. 不需要設定任何環境變數。完成後點網址即可。
（也可以放到 GitHub Pages、Netlify 等任何能放靜態檔案的地方。）

## 二之一、教學用的「邏輯判斷過程」與旁白
- 頁面與旁白**全部是英文**，用七歲小孩能懂的短句與比喻（變數＝貼標籤的祕密盒子、if／else＝是非題、TRUE＝yes、FALSE＝no、巢狀 if＝兩道連續的門、AND＝全部一起、劃掉錯的選項＝排除法）。
- 每按一個選項，畫面會逐步顯示 STEP 1 Read → STEP 2 Compare → STEP 3 Result（TRUE／FALSE）→ STEP 4 Road（IF 或 ELSE）；國家與城市關卡會多一行「Check first」，表示前面的條件已經通過。
- 旁白同時以字幕顯示，並有「Replay explanation」按鈕與 Voice ON/OFF 開關。
- 通關後顯示「Logic trace log」：每一次判斷與結果，以及 category AND country AND city = TRUE。
- 旁白用瀏覽器內建的英文語音，優先挑男聲，各裝置聲音不同。
- 旁白文字寫在 `index.html` 內的 `KID` 與 `T` 區塊，可自行改寫。

## 二之二、開場線索（Detective clues）
- 每局一開始會顯示 3 條「建築特色線索」（外形、材料、特徵），並用旁白唸出來，提醒小朋友「先看線索、再思考，不要亂猜」。第二、三關可展開「Show the clues again」；答錯時旁白也會提醒再看線索。
- 線索**不會**出現地標名稱、國家、城市、類型字（如 tower、bridge、statue）或 French／Egyptian 這類國籍詞。
- 線索寫在 `data.js` 最後面的 `CLUES`。`node check-data.js` 會自動檢查每題剛好 3 條、不外洩答案。要新增題目時請一併寫 3 條線索。
- 提醒：線索描述外觀，聰明的孩子可以由此推出「類型」，這是刻意的，目的是讓他們用推理而不是盲猜。

## 三、與原本 Opal 版的差異（請務必知道）
- **題目是固定的 20 題**，不是即時搜尋；要增減題目請改 `data.js`，再用 `node check-data.js` 檢查（選用）。
- **藍圖是我用程式畫的簡化 2D 立面線稿**，不是 Opal／AI 產生的 3D 線框圖。風格是藍底白線、青色尺寸線。
- **旁白使用瀏覽器內建朗讀**：句子與原版相同，但聲音由各裝置決定。程式會優先挑英文男聲，**不保證一定是男聲**（手機與不同瀏覽器差異很大）。瀏覽器若沒有朗讀功能，會顯示提示，文字仍在畫面上。按 Start 後才朗讀（瀏覽器規定要先有點擊）。
- **階段說明文字、成功／失敗訊息、總結是固定樣板**，原版由 AI 每次生成。總結文字改為「stored data」的說法，因為不再有聯網搜尋。
- 每關固定 3 個按鈕（1 對 2 錯），位置每次隨機；答錯為紅框、紅字、右上角 FALSE；必須依序答對才會解鎖下一關。
- 介面是固定版面（原版由 AI 每次重寫網頁）。
- **答案寫在 `data.js`**，懂得看網頁原始碼的人可以查到。若對象是想作弊的學生，請留意。
- 沒有呼叫 Gemini，所以先前討論的 Gemini 使用條款（18 歲限制、搜尋顯示規定）不適用於此版本（這是我的理解，不是法律意見）。

## 四、檔案
- `index.html`：遊戲畫面與邏輯
- `data.js`：20 題題庫（答案、干擾選項、簡介）
- `blueprints.js`：20 張藍圖 SVG
- `check-data.js`：檢查題庫與圖是否一致（選用，需 Node.js）
- `vercel.json`：部署設定

網址加上 `?landmark=8`（1–20）可指定地標，方便測試。
