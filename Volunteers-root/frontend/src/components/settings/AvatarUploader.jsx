import { Upload, Input, Button, message, Form, Space } from 'antd';
import { UploadOutlined, UndoOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import API from '../../api/axios';
import { refreshSession } from '../../api/session';
import { useSession } from '../../context/SessionProvider';
import { useState } from 'react';

export default function AvatarUploader() {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const [avatarUrlField] = Form.useForm();
    const { refetchSession } = useSession();
    const [fileList, setFileList] = useState([]);

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleFileUpload = async ({ file, onSuccess, onError }) => {
        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        try {
            const { data } = await API.patch('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Аватар оновлено');
            await refreshSession();
            refetchSession();
            onSuccess(data, file);
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg?.includes('Too many avatar updates')) {
                setAvatarError(msg);
                message.destroy();
            } else {
                message.error(msg || 'Помилка при оновленні аватара');
            }
            onError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLinkUpload = async () => {
        const trimmed = imageUrl.trim();

        if (!trimmed) {
            setAvatarError('Посилання не може бути порожнім');
            return;
        }

        if (!isValidUrl(trimmed)) {
            setAvatarError('Введіть коректне посилання');
            return;
        }

        setAvatarError('');
        setLoading(true);
        try {
            const { data } = await API.patch('/users/me/avatar/url', {
                imageUrl: trimmed,
            });
            message.success('Аватар оновлено');
            await refreshSession();
            refetchSession();
            setImageUrl('');
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg?.includes('Too many avatar updates')) {
                setAvatarError(msg);
                message.destroy();
            } else {
                message.error(msg || 'Помилка при оновленні аватара');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetAvatar = async () => {
        setLoading(true);
        try {
            await API.patch('/users/me/avatar/url', {
                imageUrl: 'https://res.cloudinary.com/dxiazry2p/image/upload/v1745516038/defava_uikbne.jpg'
            });
            message.success('Аватар скинуто');
            await refreshSession();
            refetchSession();
        } catch (err) {
            const msg = err.response?.data?.message;
            message.error(msg || 'Помилка при скиданні аватара');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="middle">
                <ImgCrop rotationSlider>
                    <Upload
                        customRequest={handleFileUpload}
                        showUploadList={false}
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />} loading={loading}>
                            Завантажити файл
                        </Button>
                    </Upload>
                </ImgCrop>

                <Form form={avatarUrlField} layout="vertical">
                    <Form.Item
                        label="Завантажити зображення за посиланням"
                        validateStatus={avatarError ? 'error' : ''}
                        help={avatarError || ''}
                    >
                        <Input
                            name="imageUrl"
                            value={imageUrl}
                            onChange={(e) => {
                                setImageUrl(e.target.value);
                                setAvatarError('');
                            }}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </Form.Item>
                    <Space>
                        <Button onClick={handleLinkUpload} loading={loading}>
                            Оновити
                        </Button>
                        <Button danger onClick={handleResetAvatar} icon={<UndoOutlined />} loading={loading}>
                            Скинути
                        </Button>
                    </Space>
                </Form>
            </Space>
        </div>
    );
}
