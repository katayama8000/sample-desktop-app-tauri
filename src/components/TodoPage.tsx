import type { Filter, Todo, TodoStats } from "../types/todo.ts";

type TodoPageProps = {
  filteredTodos: Todo[];
  filter: Filter;
  newTodoText: string;
  onAddTodo: () => void;
  onClearCompleted: () => void;
  onFilterChange: (filter: Filter) => void;
  onInputChange: (value: string) => void;
  onRemoveTodo: (id: number) => void;
  onToggleTodo: (id: number) => void;
  stats: TodoStats;
  today: string;
};

export function TodoPage(
  {
    filteredTodos,
    filter,
    newTodoText,
    onAddTodo,
    onClearCompleted,
    onFilterChange,
    onInputChange,
    onRemoveTodo,
    onToggleTodo,
    stats,
    today,
  }: TodoPageProps,
) {
  return (
    <>
      <header className="panel-header">
        <p className="eyebrow">React + Tauri</p>
        <h1>TODO App</h1>
        <p className="today">今日は {today}</p>
        <p className="subtitle">
          既存画面をトップページに置いたまま、ルーティングを試せます。
        </p>
      </header>

      <form
        className="todo-form"
        onSubmit={(event) => {
          event.preventDefault();
          onAddTodo();
        }}
      >
        <input
          value={newTodoText}
          onChange={(event) => onInputChange(event.currentTarget.value)}
          placeholder="新しいタスクを入力"
          aria-label="新しいタスク"
        />
        <button type="submit">追加</button>
      </form>

      <div className="toolbar">
        <div className="filters" role="tablist" aria-label="タスクフィルター">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => onFilterChange("all")}
          >
            すべて
          </button>
          <button
            type="button"
            className={filter === "active" ? "active" : ""}
            onClick={() => onFilterChange("active")}
          >
            未完了
          </button>
          <button
            type="button"
            className={filter === "completed" ? "active" : ""}
            onClick={() => onFilterChange("completed")}
          >
            完了
          </button>
        </div>
        <button
          type="button"
          className="secondary"
          onClick={onClearCompleted}
          disabled={stats.done === 0}
        >
          完了を一括削除
        </button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.done ? "done" : ""}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  onToggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
            </label>
            <button
              type="button"
              className="danger"
              onClick={() =>
                onRemoveTodo(todo.id)}
            >
              削除
            </button>
          </li>
        ))}
        {filteredTodos.length === 0 && (
          <li className="empty">表示できるタスクがありません。</li>
        )}
      </ul>

      <footer className="stats" aria-live="polite">
        <p>総数: {stats.total}</p>
        <p>未完了: {stats.active}</p>
        <p>完了: {stats.done}</p>
      </footer>
    </>
  );
}
