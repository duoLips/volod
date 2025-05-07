import ContentPageLayout from '../components/layouts/ContentPageLayout.jsx';
import ReportsList from "../components/ReportsList.jsx";

function ReportsPage() {
    return (
        <ContentPageLayout title="Новини">
            <ReportsList type="full" />
        </ContentPageLayout>
    );
}

export default ReportsPage;
