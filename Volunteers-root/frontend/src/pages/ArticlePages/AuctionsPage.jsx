import { useState } from 'react';
import { Button, Modal } from 'antd';
import ContentPageLayout from '../../components/layouts/ContentPageLayout.jsx';
import AuctionsList from "../../components/AuctionsList.jsx";
import AddArticleForm from "../../components/AddArticleForm.jsx";
import { useSession } from '../../context/SessionProvider.jsx';

function AuctionsPage() {
    const { session } = useSession();
    const [open, setOpen] = useState(false);
    const isAdmin = session?.user?.role === 1;

    return (
        <ContentPageLayout title="Аукціони">
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
                        <AddArticleForm type="auction" onSuccess={() => setOpen(false)} />
                    </Modal>
                </>
            )}
            <AuctionsList type="full" />
        </ContentPageLayout>
    );
}

export default AuctionsPage;
