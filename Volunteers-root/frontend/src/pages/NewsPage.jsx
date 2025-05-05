import ContentPageLayout from '../components/ContentPageLayout';
import NewsList from '../components/NewsList';

function NewsPage() {
    return (
        <ContentPageLayout title="Новини">
            <NewsList type="full" />
        </ContentPageLayout>
    );
}

export default NewsPage;
