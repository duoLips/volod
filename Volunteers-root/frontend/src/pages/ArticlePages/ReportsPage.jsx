import ReportsList from "../../components/ReportsList.jsx";
import {useSession} from "../../context/SessionProvider.jsx";
import {useState} from "react";
import {Button, Modal} from "antd";
import ArticleForm from "../../components/ArticleForm.jsx";
import Breadcrumbs from "../../components/layouts/Breadcrumbs.jsx";

function ReportsPage() {
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;
    return (
        <>
            <Breadcrumbs />
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
        </>
    );
}

export default ReportsPage;
