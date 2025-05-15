import ContentPageLayout from '../../components/layouts/ContentPageLayout.jsx';
import ReportsList from "../../components/ReportsList.jsx";
import {useSession} from "../../context/SessionProvider.jsx";
import {useState} from "react";
import {Button, Modal} from "antd";
import ArticleForm from "../../components/ArticleForm.jsx";

function ReportsPage() {
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;
    return (
        <ContentPageLayout title="Звіти">
            {isAdmin && (
                <>
                    <Button type="primary" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
                        Додати звіт
                    </Button>

                    <Modal
                        title="Новий звіт"
                        open={open}
                        onCancel={() => setOpen(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <ArticleForm
                        type="reports"
                        mode="create"
                        active={open}
                        onSuccess={() => setOpen(false)}
                    />
                    </Modal>
                </>
            )}
            <ReportsList type="full" />
        </ContentPageLayout>
    );
}

export default ReportsPage;
