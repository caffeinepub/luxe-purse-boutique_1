import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { createRootRoute, createRoute } from "@tanstack/react-router";
import AdminPage from "./pages/AdminPage";
import ShopPage from "./pages/ShopPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 30 } },
});

const rootRoute = createRootRoute();

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ShopPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([shopRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grain">
        <RouterProvider router={router} />
      </div>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
