import React from 'react';
import { Row, Col, Collapse } from 'antd';
import image2 from '../assets/image 2.png'
import image1 from '../assets/Subtract.svg'
import image3 from '../assets/ЗСУ 1.png'
const { Panel } = Collapse;

const MainSection = () => {
    return (
        <div style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto',  }}>
            {/* Title & Top Image */}
            <Row gutter={[32, 32]} align="middle" justify="space-between">
                <Col xs={24} md={12}>
                    <h1 style={{ fontSize: '5.5rem', marginBottom: 0 }}>ПРОСТІР</h1>
                    <h1 style={{ fontSize: '5.5rem', color: '#0038A8', margin: 0 }}>НЕБАЙДУЖИХ</h1>
                    <h1 style={{ fontSize: '5.5rem', marginTop: 0 }}>ЛЮДЕЙ</h1>
                    <p style={{ maxWidth: '500px', marginTop: '1rem' }}>
                        Веб-ресурс, де кожний може дізнатися про новини і потреби волонтерів і долучитися до допомоги для ЗСУ і інших волонтерських проектів                    </p>
                </Col>
                {/* Top Image with Decorative Yellow Lines */}
                <Col xs={24} md={12}>
                    <div style={{ position: 'relative' }}>
                        {/* Yellow decorative element behind image, starting from top of screen */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-50vh',
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 0,
                            }}
                        >
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: '20%',
                                    width: '80%',
                                    height: '100%',
                                    border: '16px solid #FFD700'
                                }}
                            />
                        </div>

                        {/* Foreground image */}
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                margin: '0 auto',
                                maxWidth: '400px',
                            }}
                        >
                            <img
                                src={image1}
                                alt="Top Decor"
                                style={{
                                    width: '110%',
                                    display: 'block',
                                    border: '16px solid #0038A8',

                                }}
                            />
                        </div>
                    </div>
                </Col>


            </Row>

            {/* About Us Section */}
            <Row gutter={[32, 32]} align="top" style={{ marginTop: '4rem' }}>
                <Col xs={24} md={12}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px' }}>
                        <div style={{ border: '8px solid #FFD700', padding: '8px', maxWidth: '400px' }}>
                            <img
                                src={image2}
                                alt="Soldier"
                                style={{ width: '100%', display: 'block' }}
                            />
                        </div>
                    </div>
                </Col>
                <Col xs={24} md={12}>
                    <h2>Про Нас</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.
                        Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                        Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim.
                    </p>
                </Col>
            </Row>
            {/* FAQ Section */}
            <Row gutter={[32, 32]} style={{ marginTop: '4rem' }} align="top">
                {/* FAQ on left */}
                <Col xs={24} md={12}>
                    <h2>FAQ</h2>
                    <Collapse accordion>
                        <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit?" key="1">
                            <p>Answer to the first FAQ question goes here.</p>
                        </Panel>
                        <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit?" key="2">
                            <p>Answer to the second FAQ question goes here.</p>
                        </Panel>
                        <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit?" key="3">
                            <p>Answer to the third FAQ question goes here.</p>
                        </Panel>
                    </Collapse>
                </Col>

                {/* Image on right */}
                <Col xs={24} md={12}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-40px' }}>
                        <div style={{ border: '8px solid #0038A8', padding: '8px', maxWidth: '400px' }}>
                            <img
                                src={image3}
                                alt="Bottom Image"
                                style={{ width: '100%', display: 'block' }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

        </div>
    );
};

export default MainSection;
