export type Todo = {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
};

export type Filter = "all" | "active" | "completed";

export type TodoStats = {
  total: number;
  done: number;
  active: number;
};
