import { useAuth } from '@/hooks/useAuth'
import { AppRoutes } from '@/routes'

function App() {
  const session = useAuth()
  return <AppRoutes session={session} />
}

export default App
