import ContentPageLayout from '../components/ContentPageLayout';
import AuctionsList from "../components/AuctionsList.jsx";

function AuctionsPage() {
    return (
        <ContentPageLayout title="Новини">
            <AuctionsList type="full" />
        </ContentPageLayout>
    );
}

export default AuctionsPage;
