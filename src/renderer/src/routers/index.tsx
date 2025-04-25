import GlobalLayout from '@/layout/global-layout'
import StartUpPage from '@/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
