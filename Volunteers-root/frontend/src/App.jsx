import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ReportDetailPage from './pages/ReportDetailPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import LayoutWrapper from './components/layouts/LayoutWrapper.jsx';
import NewsPage from "./pages/NewsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import AuctionsPage from "./pages/AuctionsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
function App() {
    return (
        <Routes>
            <Route element={<LayoutWrapper />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/news/:id" element={<NewsDetailPage />} />
                <Route path="/reports/:id" element={<ReportDetailPage />} />
                <Route path="/auctions/:id" element={<AuctionDetailPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/auctions" element={<AuctionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>
        </Routes>
    );
}


export default App;
