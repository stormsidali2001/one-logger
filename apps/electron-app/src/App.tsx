import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routes";
import { QueryProvider } from "@/providers/QueryProvider";

export default function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router as any} />
    </QueryProvider>
  );
}
