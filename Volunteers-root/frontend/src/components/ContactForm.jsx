import {Button ,Col ,Form ,Input ,message ,Row ,Typography} from 'antd';
import {FacebookFilled ,InstagramOutlined ,SendOutlined ,} from '@ant-design/icons';
import API from '../api/axios';
import {useState} from "react";

const {Title ,Text ,Paragraph} = Typography;

export default function ContactForm() {
    const [form] = Form.useForm();
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (values) => {
        setSending(true);
        try {
            await API.post('/otp', values);
            message.success('Повідомлення надіслано!');
            form.resetFields();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000); // hide success after 5s
        } catch (err) {
            message.error(err.response?.data?.message || 'Не вдалося надіслати повідомлення');
        } finally {
            setSending(false);
        }
    };

    const TelegramIcon = () => (
        <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{verticalAlign: 'middle'}}
        >
            <path
                d="M9.036 16.569l-.396 4.697c.568 0 .817-.244 1.116-.537l2.675-2.55 5.547 4.064c1.017.56 1.743.267 2.01-.94l3.643-17.081c.343-1.592-.562-2.22-1.607-1.84L1.17 9.436c-1.56.598-1.54 1.453-.267 1.844l4.936 1.541L19.343 4.92c.509-.296.972-.131.591.189"/>
        </svg>
    );
    const iconStyle = {
        fontSize: 24,
        color: '#0F3E98',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
    };


    return (
        <div id="contact" style={{border: '16px solid #0038A8' ,padding: 32 ,background: 'white' ,}}>
            <Row gutter={[32 ,32]}>
                <Col xs={24} md={10}>
                    <Title level={2}>Контакти</Title>
                    <div style={{marginBottom: 16}}>
                        <Text>
                            <a style={{color: 'black'}} href="mailto:info@gmail.com">info@gmail.com</a>
                        </Text>
                        <br/>
                        <Text>
                            <a style={{color: 'black'}} href="tel:+123456789">+123‑456‑789</a>
                        </Text>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
                            <InstagramOutlined />
                        </a>
                        <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" style={iconStyle}>
                            <TelegramIcon />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
                            <FacebookFilled />
                        </a>
                    </div>

                </Col>
                <Col xs={24} md={14}>
                    <Title level={4}>Звʼязатися з нами</Title>
                    <Paragraph style={{marginBottom: 24}}>
                        Будь ласка, заповніть форму зворотного звʼязку, якщо у Вас залишились питання!
                    </Paragraph>

                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={handleSubmit}
                    >
                        {success && (
                            <Form.Item>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <span style={{ color: '#0F3E98', fontWeight: 500 }}>
        Повідомлення успішно надіслано!
      </span>
                                </div>
                            </Form.Item>
                        )}

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Імʼя"
                                    name="name"
                                    rules={[{required: true ,message: 'Введіть імʼя'}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {required: true ,message: 'Введіть e‑mail'} ,
                                        {
                                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ ,
                                            message: 'Невірний формат e‑mail' ,
                                        } ,
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="Повідомлення"
                            name="message"
                            rules={[{required: true ,message: 'Напишіть щось'}]}
                        >
                            <Input.TextArea rows={5}/>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                icon={<SendOutlined />}
                                loading={sending}
                            >
                                Відправити
                            </Button>

                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    );
}
