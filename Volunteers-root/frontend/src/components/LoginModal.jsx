import { Modal, Form, Input, Button, Typography, Alert } from 'antd';
import { useState } from 'react';
import API from '../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '../context/SessionProvider';

const { Title } = Typography;

export default function LoginModal({ open, onClose }) {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [mode, setMode] = useState('otp'); // 'otp' or 'password'
    const [step, setStep] = useState('input'); // 'input' or 'verify'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { refetchSession } = useSession();

    const handleOtpStart = async () => {
        const identifier = form.getFieldValue('identifier');
        try {
            setLoading(true);
            await API.post('/auth/login-otp/start', { identifier });
            setStep('verify');
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        const { identifier, code } = form.getFieldsValue();
        try {
            setLoading(true);
            await API.post('/auth/login-otp/verify', { identifier, code });
            await refetchSession();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async () => {
        const { identifier, password } = form.getFieldsValue();
        try {
            setLoading(true);
            await API.post('/auth/login', { identifier, password });
            await refetchSession();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Login" open={open} onCancel={onClose} footer={null}>
            <Form form={form} layout="vertical">
                <Form.Item name="identifier" label="Username or Email" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                {mode === 'password' && (
                    <>
                        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>
                        <Button type="primary" loading={loading} block onClick={handlePasswordLogin}>
                            Login
                        </Button>
                    </>
                )}

                {mode === 'otp' && step === 'input' && (
                    <Button type="primary" loading={loading} block onClick={handleOtpStart}>
                        Send OTP
                    </Button>
                )}

                {mode === 'otp' && step === 'verify' && (
                    <>
                        <Form.Item name="code" label="OTP Code" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Button type="primary" loading={loading} block onClick={handleOtpVerify}>
                            Verify and Login
                        </Button>
                    </>
                )}

                <Button
                    type="link"
                    style={{ marginTop: 10, padding: 0 }}
                    onClick={() => {
                        setMode(prev => (prev === 'otp' ? 'password' : 'otp'));
                        setStep('input');
                        setError(null);
                        form.resetFields(['password', 'code']);
                    }}
                >
                    {mode === 'otp' ? 'Login with password instead' : 'Use passwordless login'}
                </Button>

                {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
            </Form>
        </Modal>
    );
}
