import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API from '../../api/axios.js';
import dayjs from 'dayjs';
import {
    Typography, Spin, Alert, Image, Tag, Modal, Button, Form, Select, Input, Space, message, AutoComplete
} from 'antd';
import CommentsSection from "../../components/CommentsSection.jsx";
import ArticleForm from "../../components/ArticleForm.jsx";
import { useSession } from "../../context/SessionProvider.jsx";
import { useState, useEffect } from "react";
import DeleteArticleButton from "../../components/DeleteArticleButton.jsx";

const { Title, Paragraph, Text } = Typography;

function AuctionDetailPage() {
    const { id } = useParams();
    const { session } = useSession();
    const [editOpen, setEditOpen] = useState(false);
    const [winnerOpen, setWinnerOpen] = useState(false);
    const [winnerInput, setWinnerInput] = useState('');
    const [users, setUsers] = useState([]);
    const [form] = Form.useForm();
    const isAdmin = session?.user?.role === 1;

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['auction', id],
        queryFn: () => API.get(`/auctions/${id}`).then(res => res.data),
        enabled: !!id,
    });

    useEffect(() => {
        if (!winnerOpen) return;
        fetchUsers();

        if (data?.winner_label) {
            setWinnerInput(data.winner_label);
        }
    }, [winnerOpen]);


    const fetchUsers = async () => {
        try {
            const res = await API.get('/users');
            setUsers(res.data.data || []);
        } catch {
            message.error('Не вдалося завантажити користувачів');
        }
    };
    const userOptions = users.map(u => ({
        value: `${u.firstName} ${u.lastName} (@${u.username}) [ID: ${u.id}]`,
        userId: u.id,
        label: `${u.firstName} ${u.lastName}`
    }));
    const handleAssignWinner = async () => {
        const selectedUser = userOptions.find(opt => opt.value === winnerInput);

        const payload = selectedUser
            ? { userId: selectedUser.userId, label: selectedUser.label }
            : { label: winnerInput };

        try {
            await API.patch(`/auctions/${id}/winner`, payload);
            message.success('Переможця призначено');
            setWinnerOpen(false);
            refetch();
        } catch (err) {
            message.error(err.response?.data?.message || 'Помилка');
        }
    };
    if (isLoading) return <Spin />;
    if (isError) return <Alert message="Не вдалося завантажити аукціон" type="error" showIcon />;
    if (!data) return <Alert message="Аукціон не знайдено" type="warning" showIcon />;

    const status = data.status ? 'Відкритий' : 'Завершений';

    return (
        <div>
            {isAdmin && (
                <>
                    <Space style={{ marginTop: 24, marginBottom: 16 }}>
                        <Button type="primary" onClick={() => setEditOpen(true)}>
                            Редагувати аукціон
                        </Button>
                        <Button onClick={() => setWinnerOpen(true)}>
                            Обрати переможця
                        </Button>
                        <DeleteArticleButton articleId={id} type="auctions" />
                    </Space>
                </>
            )}

            <Modal
                title="Редагування аукціону"
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                footer={null}
                destroyOnClose
            >
                <ArticleForm
                    type="auctions"
                    mode="edit"
                    articleId={data.id}
                    initialData={data}
                    active={editOpen}
                    onSuccess={() => {
                        setEditOpen(false);
                        refetch();
                    }}
                />
            </Modal>

            <Modal
                title="Призначити переможця"
                open={winnerOpen}
                onCancel={() => setWinnerOpen(false)}
                onOk={handleAssignWinner}
                okText="Зберегти"
                cancelText="Скасувати"
                destroyOnClose
            >
                <Typography.Paragraph>
                    Оберіть зареєстрованого користувача або введіть імʼя вручну:
                </Typography.Paragraph>

                <AutoComplete
                    style={{ width: '100%' }}
                    value={winnerInput}
                    options={userOptions}
                    onChange={setWinnerInput}
                    placeholder="Введіть або оберіть імʼя переможця"
                    filterOption={(inputValue, option) =>
                        option?.value?.toLowerCase().includes(inputValue.toLowerCase())
                    }
                />
            </Modal>


            <Title>{data.title}</Title>

            {data.img_path && (
                <Image
                    src={data.img_path}
                    alt={data.alt_text || 'Auction image'}
                    style={{ margin: '20px 0', maxHeight: 400, objectFit: 'cover' }}
                />
            )}

            <Paragraph>{data.body}</Paragraph>

            <Paragraph>
                🎁 Приз: <Text strong>{data.prize}</Text>
            </Paragraph>

            <Paragraph>
                🕒 Завершується: <Text>{dayjs(data.ends_at).format('DD.MM.YYYY HH:mm')}</Text>
            </Paragraph>

            <Paragraph>
                📌 Статус: <Tag color={data.status ? 'green' : 'red'}>{status}</Tag>
            </Paragraph>

            {data.winner_label && (
                <Paragraph>
                    🏆 Переможець: <Text strong>{data.winner_label}</Text>
                </Paragraph>
            )}

            <CommentsSection entityType="auction" entityId={id} />
        </div>
    );
}

export default AuctionDetailPage;
