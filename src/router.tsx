import { HashRouter, Route, Routes } from 'react-router-dom';
import App from './routes/app';
import LoadingOverlay from './components/layouts/loading-layout';
import RootLayout from './components/layouts/root-layout';
import NotFound from './routes/not-found';
import AnimationLayout from './components/layouts/animation-layout';
import Packages from './routes/packages';
import ScreenShots from './routes/screenshots';

export default () => (
  <HashRouter>
    <Routes>
      <Route element={<RootLayout />}>
        <Route element={<AnimationLayout />}>
          <Route element={<LoadingOverlay />}>
            <Route path="/" element={<App />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/screenshots" element={<ScreenShots />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </HashRouter>
);
