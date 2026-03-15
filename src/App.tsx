import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "./App.css";

type Todo = {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

const STORAGE_KEY = "sample-desktop-app-tauri.todos";

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const today = dayjs().format("YYYY年M月D日 dddd");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Todo[];
      if (Array.isArray(parsed)) {
        setTodos(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (!isTauriRuntime()) {
      return;
    }

    let active = true;

    const syncAppIconBadge = async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        if (!active) {
          return;
        }

        const activeCount = todos.filter((todo) => !todo.done).length;
        await getCurrentWindow().setBadgeCount(activeCount || undefined);
      } catch {
        // Ignore unsupported environments.
      }
    };

    void syncAppIconBadge();

    return () => {
      active = false;
    };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.done);
      case "completed":
        return todos.filter((todo) => todo.done);
      default:
        return todos;
    }
  }, [filter, todos]);

  const stats = useMemo(
    () => ({
      total: todos.length,
      done: todos.filter((todo) => todo.done).length,
      active: todos.filter((todo) => !todo.done).length,
    }),
    [todos],
  );

  function addTodo() {
    const text = newTodoText.trim();
    if (!text) {
      return;
    }

    setTodos((current) => [
      {
        id: Date.now(),
        text,
        done: false,
        createdAt: Date.now(),
      },
      ...current,
    ]);
    setNewTodoText("");
  }

  function toggleTodo(id: number) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  function removeTodo(id: number) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.done));
  }

  return (
    <main className="todo-app">
      <section className="panel">
        <header className="panel-header">
          <p className="eyebrow">React + Tauri</p>
          <h1>TODO App</h1>
          <p className="today">今日は {today}</p>
          <p className="subtitle">今日やることを、軽く整理する。</p>
        </header>

        <form
          className="todo-form"
          onSubmit={(event) => {
            event.preventDefault();
            addTodo();
          }}
        >
          <input
            value={newTodoText}
            onChange={(event) => setNewTodoText(event.currentTarget.value)}
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
              onClick={() => setFilter("all")}
            >
              すべて
            </button>
            <button
              type="button"
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              未完了
            </button>
            <button
              type="button"
              className={filter === "completed" ? "active" : ""}
              onClick={() => setFilter("completed")}
            >
              完了
            </button>
          </div>
          <button
            type="button"
            className="secondary"
            onClick={clearCompleted}
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
                    toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button
                type="button"
                className="danger"
                onClick={() =>
                  removeTodo(todo.id)}
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
      </section>
    </main>
  );
}

export default App;
