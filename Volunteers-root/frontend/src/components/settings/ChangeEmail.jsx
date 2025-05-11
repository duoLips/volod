import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import API from '../../api/axios';
import { refreshSession } from '../../api/session';
import { useSession } from '../../context/SessionProvider';

const { Title } = Typography;

export default function ChangeEmail() {
    const [step, setStep] = useState(1);
    const [newEmail, setNewEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { refetchSession } = useSession();

    const requestChangeEmail = async () => {
        if (!newEmail) {
            setError('Введіть нову адресу електронної пошти');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { data } = await API.post('/users/request-change-email', { newEmail });
            setStep(2);
            setSuccess(data.message || 'OTP надіслано');
        } catch (err) {
            setError(err.response?.data?.message || 'Не вдалося надіслати код');
        } finally {
            setLoading(false);
        }
    };

    const confirmChangeEmail = async () => {
        if (!code) {
            setError('Введіть код з пошти');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await API.post('/users/confirm-change-email', {
                newEmail,
                code
            });
            setSuccess('Електронну пошту оновлено');
            await refreshSession();
            refetchSession();
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Не вдалося підтвердити код');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400 }}>
            {step === 1 && (
                <Form layout="vertical" onFinish={requestChangeEmail}>
                    <Form.Item label="Нова електронна пошта">
                        <Input
                            value={newEmail}
                            onChange={(e) => {
                                setNewEmail(e.target.value);
                                setError('');
                                setSuccess('');
                            }}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Надіслати код підтвердження
                    </Button>
                    {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
                    {success && <Alert type="success" message={success} showIcon style={{ marginTop: 12 }} />}
                </Form>
            )}

            {step === 2 && (
                <Form layout="vertical" onFinish={confirmChangeEmail}>
                    <Form.Item label="Код з пошти">
                        <Input
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError('');
                                setSuccess('');
                            }}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Підтвердити
                    </Button>
                    {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
                    {success && <Alert type="success" message={success} showIcon style={{ marginTop: 12 }} />}
                </Form>
            )}

            {step === 3 && (
                <Alert
                    type="success"
                    message="Електронну пошту успішно змінено "
                    showIcon
                    style={{ marginTop: 12 }}
                />
            )}
        </div>
    );
}
