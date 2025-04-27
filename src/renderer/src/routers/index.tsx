import GlobalLayout from '@/layout/global-layout'
import MainLayout from '@/layout/main-layout'
import ProtectedLayout from '@/layout/protected-layout'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import NodeOperatorPage from '@/pages/node-operator'
import ProfilePage from '@/pages/profile'
import StartUpPage from '@/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />

          <Route path="login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            <Route element={<MainLayout />}>
              <Route path="home" element={<HomePage />} />
              <Route path="missions-rewards" element={<HomePage />} />
              <Route path="node-operator" element={<NodeOperatorPage />} />
              <Route path="data-operator" element={<HomePage />} />
              <Route path="ref" element={<HomePage />} />
            </Route>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
