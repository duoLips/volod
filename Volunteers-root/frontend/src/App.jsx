import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage';
import NewsDetailPage from './pages/DetailPages/NewsDetailPage.jsx';
import ReportDetailPage from './pages/DetailPages/ReportDetailPage.jsx';
import AuctionDetailPage from './pages/DetailPages/AuctionDetailPage.jsx';
import LayoutWrapper from './components/layouts/LayoutWrapper.jsx';
import NewsPage from "./pages/ArticlePages/NewsPage.jsx";
import ReportsPage from "./pages/ArticlePages/ReportsPage.jsx";
import AuctionsPage from "./pages/ArticlePages/AuctionsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
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
                <Route path="/gallery" element={<GalleryPage />} />

            </Route>
        </Routes>
    );
}


export default App;
