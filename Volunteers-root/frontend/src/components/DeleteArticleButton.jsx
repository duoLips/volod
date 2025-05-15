import { Button, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import API from '../api/axios';

export default function DeleteArticleButton({ articleId, type }) {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    const handleDelete = async () => {
        try {
            await API.delete(`/${type}/${articleId}`);
            message.success('Статтю видалено');
            navigate(`/${type}`);
        } catch (err) {
            message.error(err.response?.data?.message || 'Помилка видалення');
        } finally {
            setVisible(false);
        }
    };

    return (
        <>
            <Button danger onClick={() => setVisible(true)}>
                Видалити статтю
            </Button>

            <Modal
                open={visible}
                onCancel={() => setVisible(false)}
                onOk={handleDelete}
                okText="Так"
                cancelText="Скасувати"
                okType="danger"
                title="Підтвердити видалення"
            >
                <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
                Ви впевнені, що хочете видалити цю статтю?
            </Modal>
        </>
    );
}
