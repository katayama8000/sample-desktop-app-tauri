import type { TodoStats } from "../types/todo.ts";

type SettingsPageProps = {
  stats: TodoStats;
};

export function SettingsPage({ stats }: SettingsPageProps) {
  return (
    <>
      <header className="panel-header">
        <p className="eyebrow">Routing Demo</p>
        <h1>Settings</h1>
        <p className="subtitle">
          `HashRouter` で画面遷移できているかを確認するためのページです。
        </p>
      </header>

      <section className="settings-grid" aria-label="ルーティング情報">
        <article className="info-card">
          <h2>現在の構成</h2>
          <p>
            エントリポイントで `HashRouter` を使い、`/` と `/settings` の 2
            ルートを持たせています。
          </p>
        </article>
        <article className="info-card">
          <h2>確認ポイント</h2>
          <p>
            タブを切り替えても TODO
            の状態が維持されれば、親コンポーネントで状態を持つ構成が機能しています。
          </p>
        </article>
        <article className="info-card accent-card">
          <h2>現在の TODO 状態</h2>
          <p>総数 {stats.total}</p>
          <p>未完了 {stats.active}</p>
          <p>完了 {stats.done}</p>
        </article>
      </section>
    </>
  );
}
