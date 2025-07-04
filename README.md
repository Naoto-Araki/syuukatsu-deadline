# syuukatsu-deadline Chrome拡張

就職活動で増え続ける企業エントリーや説明会応募の締切を、ワンクリックで手軽に管理できる Chrome 拡張機能です。ブラウザ上で締切を登録・閲覧・編集・削除し、Google カレンダーと同期できます。

---

## 主な機能

1. **ワンクリック締切登録**  
   - ポップアップで「締切タイトル」「締切日」を入力  
   - 現在タブの URL／企業名候補／favicon を自動取得  
   - Chrome ローカルストレージ（chrome.storage.local）へ保存  

2. **締切一覧表示**  
   - ポップアップを開くと保存済みの締切を自動リスト化  
   - 各行をクリックすると該当ページを新しいタブで開く  

3. **編集・削除**  
   - 「編集」ボタンでタイトル・日付を再入力し上書き保存  
   - 「削除」ボタンで確認ダイアログ後、ローカルストレージとカレンダーから削除  

4. **Google カレンダー同期**  
   - 保存時に OAuth2 認可を経て終日イベントとして即時登録  
   - 取得した eventId をローカルに保持し、編集・削除時にカレンダー上の予定を更新・削除  

