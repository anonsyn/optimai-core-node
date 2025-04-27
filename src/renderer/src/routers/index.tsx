import GlobalLayout from '@/layout/global-layout'
import MainLayout from '@/layout/main-layout'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import StartUpPage from '@/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />

          <Route path="login" element={<LoginPage />} />

          <Route element={<MainLayout />}>
            <Route path="home" element={<HomePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
