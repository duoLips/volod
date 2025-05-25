import { Card, Typography, Space } from 'antd';

const { Title, Text } = Typography;

export default function JarWidget({ title, sendId, description }) {
    return (
        <a
            href={`https://send.monobank.ua/jar/${sendId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
        >
            <Card
                hoverable
                style={{
                    marginTop: 32,
                    border: '1px solid #E6EDF9',
                    borderRadius: 12,
                    background: '#f9fbff',
                    padding: 24,
                }}
                bodyStyle={{ padding: 0 }}
            >
                <Space direction="horizontal" align="center" size={24}>
                    <img
                        src="https://play-lh.googleusercontent.com/tVdBTQSX3ek05SxDZJClWtohEohC0EHLF7BRqzfq7tRsr3533ONjQxUd-pmQxjGtb2I"
                        alt="Monobank"
                        style={{ height: 48, width: 48, borderRadius: 8 }}
                    />

                    <div>
                        <Title level={5} style={{ marginBottom: 4, color: '#0F3E98' }}>
                            {title}
                        </Title>
                        {description && (
                            <Text style={{ display: 'block', color: '#444', marginBottom: 4 }}>
                                {description}
                            </Text>
                        )}
                        <Text >
                            Використайте це посилання на банку
                        </Text>
                    </div>
                </Space>
            </Card>
        </a>
    );
}
