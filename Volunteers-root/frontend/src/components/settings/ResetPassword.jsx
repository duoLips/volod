import { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Alert, Spin } from 'antd';
import API from '../../api/axios';

const { Title } = Typography;

export default function ResetPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [fetchingEmail, setFetchingEmail] = useState(true);

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const { data } = await API.get('/users/me');
                setEmail(data.email);
            } catch {
                setError('Не вдалося завантажити профіль');
            } finally {
                setFetchingEmail(false);
            }
        };
        fetchEmail();
    }, []);

    const requestOtp = async () => {
        if (!email) {
            setError('Email не знайдено');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await API.post('/auth/request-reset-password', { email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Не вдалося надіслати код');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!code) {
            setError('Введіть код підтвердження');
            return;
        }
        if (!newPassword) {
            setError('Введіть новий пароль');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await API.post('/auth/reset-password', {
                email,
                code,
                newPassword,
            });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Не вдалося змінити пароль');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingEmail) return <Spin />;

    return (
        <div style={{ maxWidth: 400 }}>
            {step === 1 && (
                <>
                    <Button type="primary" onClick={requestOtp} loading={loading}>
                        Надіслати код підтвердження
                    </Button>
                    {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
                </>
            )}

            {step === 2 && (
                <>
                    <Form layout="vertical" onFinish={resetPassword}>
                        <Form.Item label="Код з пошти">
                            <Input
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    setError(null);
                                }}
                            />
                        </Form.Item>

                        <Form.Item label="Новий пароль">
                            <Input.Password
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    setError(null);
                                }}
                            />
                        </Form.Item>

                        <Button type="primary" htmlType="submit" loading={loading}>
                            Зберегти новий пароль
                        </Button>
                    </Form>
                    {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
                </>
            )}

            {step === 3 && (
                <Alert
                    type="success"
                    message="Пароль успішно оновлено"
                    showIcon
                    style={{ marginTop: 12 }}
                />
            )}
        </div>
    );
}
