import { useEffect } from "react";

const DOC_URL = "https://v2.tauri.app/ja/";

export function DocPage() {
  useEffect(() => {
    globalThis.location.replace(DOC_URL);
  }, []);

  return (
    <>
      <header className="panel-header">
        <p className="eyebrow">In-App Docs</p>
        <h1>Doc</h1>
        <p className="subtitle">
          同じウィンドウ内で公式ドキュメントへ移動しています。
        </p>
      </header>

      <section className="webview-panel" aria-label="ドキュメント遷移">
        <p className="webview-status" aria-live="polite">
          自動で移動しない場合は、下のボタンを押してください。
        </p>
        <div className="webview-actions">
          <button
            type="button"
            onClick={() => {
              globalThis.location.replace(DOC_URL);
            }}
          >
            このウィンドウで開く
          </button>
        </div>
      </section>
    </>
  );
}
