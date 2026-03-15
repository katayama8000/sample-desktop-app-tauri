import { Navigate, Route, Routes } from "react-router-dom";
import { RouteNav } from "./components/RouteNav.tsx";
import { SettingsPage } from "./components/SettingsPage.tsx";
import { TodoPage } from "./components/TodoPage.tsx";
import { useTodos } from "./hooks/useTodos.ts";
import "./App.css";

function App() {
  const {
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
  } = useTodos();

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
