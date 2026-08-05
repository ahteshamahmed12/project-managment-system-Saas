import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/Projectscontext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <AppRoutes />
      </ProjectsProvider>
    </AuthProvider>
  );
}

export default App;
