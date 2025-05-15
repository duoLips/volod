import {
    Form, Input, Button, Select, DatePicker, Upload, message, Typography, Space, Row, Col
} from 'antd';
import { UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import dayjs from 'dayjs';

const { TextArea } = Input;

export default function ArticleForm({ type, mode = 'create', initialData = {}, articleId, onSuccess, active = false }) {
    const [form] = Form.useForm();
    const [imageUrl, setImageUrl] = useState('');
    const [imgError, setImgError] = useState('');
    const [jars, setJars] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [loadingJars, setLoadingJars] = useState(false);
    const navigate = useNavigate();

    const isAuction = type === 'auctions';
    const isReport = type === 'reports';

    const fetchJars = async () => {
        setLoadingJars(true);
        try {
            const res = await API.get('/banka/jars');
            setJars(res.data);
        } catch {
            message.error('Не вдалося завантажити банки');
        } finally {
            setLoadingJars(false);
        }
    };

    const refreshJars = async () => {
        setLoadingJars(true);
        try {
            await API.post('/banka/jars/refresh');
            const res = await API.get('/banka/jars');
            setJars(res.data);
            message.success('Банки оновлено');
        } catch {
            message.error('Не вдалося оновити банки');
        } finally {
            setLoadingJars(false);
        }
    };


    const fetchAuctions = async () => {
        try {
            const res = await API.get('/auctions');
            setAuctions(res.data.data || []);
        } catch {
            message.error('Не вдалося завантажити аукціони');
        }
    };

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleImageUpload = async (options) => {
        const { file } = options;
        const altText = form.getFieldValue('alt_text') || '';
        const formData = new FormData();
        formData.append('image', file);

        try {
            if (mode === 'edit') {
                const res = await API.post('/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                await API.patch(`/${type}/${articleId}/cover`, {
                    img_path: res.data.url,
                    alt_text: altText
                });
            } else {
                const res = await API.post('/media/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                form.setFieldValue('img_url', res.data.url);
            }

            setImgError('');
            message.success('Зображення оновлено');
        } catch {
            message.error('Помилка при оновленні зображення');
        }
    };

    const handleUrlUpload = async () => {
        const altText = form.getFieldValue('alt_text') || '';

        if (!isValidUrl(imageUrl)) {
            setImgError('Невірне посилання на зображення');
            return;
        }

        try {
            if (mode === 'edit') {
                await API.patch(`/${type}/${articleId}/cover/url`, {
                    img_path: imageUrl,
                    alt_text: altText
                });
            } else {
                form.setFieldValue('img_url', imageUrl);
            }
            setImageUrl('');
            setImgError('');
            message.success('Зображення оновлено');
        } catch {
            message.error('Не вдалося оновити зображення');
        }
    };

    const handleFinish = async (values) => {
        const endpoint =
            type === 'news' ? '/news' :
                type === 'auctions' ? '/auctions' :
                    '/reports';

        const payload = { ...values };
        if (payload.ends_at) payload.ends_at = payload.ends_at.toISOString();

        try {
            if (mode === 'edit') {
                await API.patch(`${endpoint}/${articleId}`, payload);
                message.success('Статтю оновлено');
                if (onSuccess) onSuccess();
                window.location.reload();
            } else {
                const res = await API.post(`${endpoint}/new`, payload);
                message.success('Статтю створено');
                form.resetFields();
                setImageUrl('');
                if (onSuccess) onSuccess();
                const newId = res.data?.id;
                if (newId) navigate(`${endpoint}/${newId}`);
            }
        } catch (err) {
            message.error(err.response?.data?.message || 'Помилка збереження');
        }
    };

    useEffect(() => {
        if (!active) return;

        if (isAuction) fetchJars();
        if (isReport) fetchAuctions();

        if (mode === 'edit' && initialData) {
            form.setFieldsValue({
                ...initialData,
                ends_at: initialData.ends_at ? dayjs(initialData.ends_at) : null
            });
        }
    }, [active]);

    return (
        <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            style={{ maxWidth: 600 }}
        >
            <Form.Item name="title" label="Заголовок" rules={[{ required: true }]}>
                <Input />
            </Form.Item>

            <Form.Item name="body" label="Текст" rules={[{ required: true }]}>
                <TextArea rows={6} />
            </Form.Item>

            <Form.Item label="Зображення">
                <Upload
                    customRequest={handleImageUpload}
                    showUploadList={false}
                    accept="image/*"
                >
                    <Button icon={<UploadOutlined />} />
                </Upload>

                <Space style={{ marginTop: 12 }}>
                    <Input
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImgError('');
                        }}
                    />
                    <Button onClick={handleUrlUpload}>Оновити</Button>
                </Space>
                {imgError && (
                    <Typography.Text type="danger">{imgError}</Typography.Text>
                )}
            </Form.Item>

            {mode !== 'edit' && (
                <Form.Item name="img_url" hidden>
                    <Input />
                </Form.Item>
            )}

            <Form.Item name="alt_text" label="Alt‑текст до зображення">
                <Input />
            </Form.Item>

            {isAuction && (
                <>
                    <Form.Item name="prize" label="Приз" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="ends_at" label="Завершується" rules={[{ required: true }]}>
                        <DatePicker  style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Банка" required>
                        <Row gutter={8}>
                            <Col flex="auto">
                                <Form.Item name="jar_id" rules={[{ required: true }]} noStyle>
                                    <Select
                                        options={jars.map(j => ({ label: j.title, value: j.id }))}
                                        showSearch
                                        placeholder="Оберіть банку"
                                        loading={loadingJars}
                                    />
                                </Form.Item>
                            </Col>
                            <Col>
                                <Button icon={<ReloadOutlined />} onClick={refreshJars} />
                            </Col>
                        </Row>
                    </Form.Item>
                </>
            )}

            {isReport && (
                <Form.Item name="auction_id" label="Аукціон" rules={[{ required: true }]}>
                    <Select
                        placeholder="Оберіть аукціон"
                        options={auctions.map(a => ({
                            value: a.id,
                            label: `${a.title.slice(0, 25)}${a.title.length > 25 ? '...' : ''} (ID: ${a.id})`
                        }))}
                        showSearch
                    />
                </Form.Item>
            )}

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {mode === 'edit' ? 'Зберегти зміни' : 'Створити'}
                </Button>
            </Form.Item>
        </Form>
    );
}
