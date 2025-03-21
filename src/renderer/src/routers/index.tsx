import GlobalLayout from '@/layout/global-layout'
import AIComputingPage from '@/pages/ai-computing'
import BrowserPage from '@/pages/browser'
import DataMiningPage from '@/pages/data-mining'
import DataValidationPage from '@/pages/data-validation'
import StartUpPage from '@/pages/start-up'
import { Route, HashRouter as Router, Routes } from 'react-router'

const AppRouters = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<StartUpPage />} />
          <Route path="ai-computing" element={<AIComputingPage />} />
          <Route path="browser" element={<BrowserPage />} />
          <Route path="data-mining" element={<DataMiningPage />} />
          <Route path="data-validation" element={<DataValidationPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default AppRouters
