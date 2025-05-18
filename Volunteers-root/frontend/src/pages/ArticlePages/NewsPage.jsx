import NewsList from '../../components/NewsList.jsx';
import {Button, Modal} from "antd";
import ArticleForm from "../../components/ArticleForm.jsx";
import {useSession} from "../../context/SessionProvider.jsx";
import {useState} from "react";
import Breadcrumbs from "../../components/layouts/Breadcrumbs.jsx";

function NewsPage() {
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;
    return (
        <>
            <Breadcrumbs />
            {isAdmin && (
                <>
                    <Button type="primary" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
                        Додати новину
                    </Button>

                    <Modal
                        title="Нова новина"
                        open={open}
                        onCancel={() => setOpen(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <ArticleForm
                            type="news"
                            mode="create"
                            active={open}
                            onSuccess={() => setOpen(false)}
                        />
                    </Modal>
                </>
            )}
            <NewsList type="full" />
        </>
    );
}

export default NewsPage;
