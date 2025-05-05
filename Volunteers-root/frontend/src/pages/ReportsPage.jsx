import ContentPageLayout from '../components/ContentPageLayout';
import ReportsList from "../components/ReportsList.jsx";

function ReportsPage() {
    return (
        <ContentPageLayout title="Новини">
            <ReportsList type="full" />
        </ContentPageLayout>
    );
}

export default ReportsPage;
