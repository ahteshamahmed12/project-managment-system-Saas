import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/Projectscontext";
import { NotificationsProvider } from "./context/NotificationsContext";

import AppRoutes from "./routes/AppRoutes";
import { UsersProvider } from "./context/UsersContext";

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <ProjectsProvider>
          <NotificationsProvider>
            <AppRoutes />
          </NotificationsProvider>
        </ProjectsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
