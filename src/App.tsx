import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Navigate, Route, Routes } from "react-router-dom";
import { RouteNav } from "./components/RouteNav.tsx";
import { SettingsPage } from "./components/SettingsPage.tsx";
import { TodoPage } from "./components/TodoPage.tsx";
import type { Filter, Todo } from "./types/todo.ts";
import "./App.css";

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
        <RouteNav />

        <Routes>
          <Route
            path="/"
            element={
              <TodoPage
                filteredTodos={filteredTodos}
                filter={filter}
                newTodoText={newTodoText}
                onAddTodo={addTodo}
                onClearCompleted={clearCompleted}
                onFilterChange={setFilter}
                onInputChange={setNewTodoText}
                onRemoveTodo={removeTodo}
                onToggleTodo={toggleTodo}
                stats={stats}
                today={today}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage stats={stats} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </section>
    </main>
  );
}

export default App;
