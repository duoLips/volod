import { useState } from 'react';
import { Button, Modal } from 'antd';
import AuctionsList from "../../components/AuctionsList.jsx";
import ArticleForm from "../../components/ArticleForm.jsx";
import { useSession } from '../../context/SessionProvider.jsx';
import Breadcrumbs from "../../components/layouts/Breadcrumbs.jsx";

function AuctionsPage() {
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;

    return (
        <>
            <Breadcrumbs />
            {isAdmin && (
                <>
                    <Button type="primary" onClick={() => setOpen(true)} style={{ marginTop: 24 }}>
                        Додати аукціон
                    </Button>

                    <Modal
                        title="Новий аукціон"
                        open={open}
                        onCancel={() => setOpen(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <ArticleForm
                            type="auctions"
                            mode="create"
                            active={open}
                            onSuccess={() => setOpen(false)}
                        />
                    </Modal>
                </>
            )}
            <AuctionsList type="full" />
        </>
    );
}

export default AuctionsPage;
