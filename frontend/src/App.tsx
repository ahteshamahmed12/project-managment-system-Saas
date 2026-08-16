import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/Projectscontext";
import { NotificationsProvider } from "./context/NotificationsContext";

import AppRoutes from "./routes/AppRoutes";
import { UsersProvider } from "./context/UsersContext";
import { SprintsProvider } from "./context/SprintsContext";

function App() {
  return (
    <AuthProvider>
      <UsersProvider>
        <ProjectsProvider>
          <SprintsProvider>
            <NotificationsProvider>
              <AppRoutes />
            </NotificationsProvider>
          </SprintsProvider>
        </ProjectsProvider>
      </UsersProvider>
    </AuthProvider>
  );
}

export default App;
