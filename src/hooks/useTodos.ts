import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import type { Filter, Todo } from "../types/todo.ts";

const STORAGE_KEY = "sample-desktop-app-tauri.todos";
const STORE_FILE = "todo.store.json";
const STORE_KEY = "todos";

type TodoStoreLike = {
  get: <T>(key: string) => Promise<T | null>;
  set: (key: string, value: unknown) => Promise<void>;
  save: () => Promise<void>;
};

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [isHydrated, setIsHydrated] = useState(false);
  const todoStoreRef = useRef<TodoStoreLike | null>(null);

  const today = dayjs().format("YYYY年M月D日 dddd");

  useEffect(() => {
    let active = true;

    const loadTodos = async () => {
      if (isTauriRuntime()) {
        try {
          const { load } = await import("@tauri-apps/plugin-store");
          const store = await load(STORE_FILE);
          todoStoreRef.current = store as TodoStoreLike;

          const storedTodos = await store.get<Todo[]>(STORE_KEY);
          if (active && Array.isArray(storedTodos)) {
            setTodos(storedTodos);
            return;
          }
        } catch {
          // Fallback to localStorage when store is unavailable.
        }
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      try {
        const parsed = JSON.parse(raw) as Todo[];
        if (active && Array.isArray(parsed)) {
          setTodos(parsed);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }

      if (isTauriRuntime() && todoStoreRef.current && active) {
        try {
          await todoStoreRef.current.set(STORE_KEY, JSON.parse(raw) as Todo[]);
          await todoStoreRef.current.save();
        } catch {
          // Keep localStorage data if migration fails.
        }
      }
    };

    void loadTodos().finally(() => {
      if (active) {
        setIsHydrated(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveTodos = async () => {
      if (todoStoreRef.current) {
        try {
          await todoStoreRef.current.set(STORE_KEY, todos);
          await todoStoreRef.current.save();
          return;
        } catch {
          // Fallback to localStorage when store write fails.
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    };

    void saveTodos();
  }, [isHydrated, todos]);

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

  return {
    addTodo,
    clearCompleted,
    filter,
    filteredTodos,
    newTodoText,
    removeTodo,
    setFilter,
    setNewTodoText,
    stats,
    today,
    toggleTodo,
  };
}
