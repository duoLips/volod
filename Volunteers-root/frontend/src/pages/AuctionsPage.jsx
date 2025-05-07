import ContentPageLayout from '../components/layouts/ContentPageLayout.jsx';
import AuctionsList from "../components/AuctionsList.jsx";

function AuctionsPage() {
    return (
        <ContentPageLayout title="Новини">
            <AuctionsList type="full" />
        </ContentPageLayout>
    );
}

export default AuctionsPage;
