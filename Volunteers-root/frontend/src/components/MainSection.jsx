import React from 'react';
import {Row ,Col ,Collapse, Typography, Grid  } from 'antd';
import image2 from '../assets/image 2.png'
import image1 from '../assets/Subtract.svg'
import image3 from '../assets/ЗСУ 1.png'
const { Title, Paragraph } = Typography;
const {Panel} = Collapse;
const { useBreakpoint } = Grid;


const MainSection = () => {
    const screens = useBreakpoint();
    return (
        <div style={{padding: '3rem 1rem' ,maxWidth: '1200px' ,margin: '0 auto'}}>
            <Row gutter={[32 ,32]} align="middle" justify="space-between">
                <Col  xs={{ span: 24, order: 1 }} md={{ span: 13, order: 1 }} style={{ position: 'relative', zIndex: 2 }}>
                    <Title
                        level={1}
                        style={{
                            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                            lineHeight: 1.1,
                            wordBreak: 'keep-all',
                            whiteSpace: 'nowrap',
                            overflowWrap: 'normal',

                        }}
                    >
                        <span style={{ display: 'block' }}>ПРОСТІР</span>
                        <span style={{ display: 'block', color: '#0038A8' }}>НЕБАЙДУЖИХ</span>
                        <span style={{ display: 'block' }}>ЛЮДЕЙ</span>
                    </Title>
                    <Paragraph style={{maxWidth: '500px' ,marginTop: '1rem'}}>
                        Веб-ресурс, де кожний може дізнатися про новини і потреби волонтерів і долучитися до допомоги
                        для ЗСУ і інших волонтерських проектів </Paragraph>
                </Col>
                <Col  xs={{ span: 24, order: 2 }} md={{ span: 11, order: 2 }}>
                    <div style={{position: 'relative'}}>
                        <div
                            style={{
                                position: 'absolute',
                                top: "-60%",
                                right: '35%',
                                width: '400px',
                                height: '400px',
                                border: '16px solid #FFD700' ,
                                zIndex: 0,
                            }}
                        />
                        <div
                            style={{
                                position: 'relative' ,
                                zIndex: 1 ,
                                margin: '0 auto' ,
                                maxWidth: '400px' ,
                            }}
                        >
                            <img
                                src={image1}
                                alt="Top Decor"
                                style={{
                                    width: '100%' ,
                                    display: 'block' ,
                                    border: '16px solid #0038A8' ,

                                }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
            <Row gutter={[32 ,32]} align="middle"  style={{marginTop: '4rem'}}>
                <Col xs={{ span: 24, order: 4 }} md={{ span: 12, order: 3 }}>
                    <div style={{display: 'flex' ,justifyContent: 'center' ,marginTop: screens.md ? '-40px' : '1.5rem'}}>
                        <div style={{border: '8px solid #FFD700' ,padding: '8px' ,maxWidth: '400px'}}>
                            <img
                                src={image2}
                                alt="Soldier"
                                style={{width: '100%' ,display: 'block'}}
                            />
                        </div>
                    </div>
                </Col>
                <Col xs={{ span: 24, order: 3 }} md={{ span: 12, order: 3 }}>
                    <Title level={2} id="about">Про Нас</Title>
                    <Paragraph>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.
                        Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus
                        mus.
                        Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis
                        enim.
                    </Paragraph>
                </Col>
            </Row>
            <Row gutter={[32 ,32]} align="middle" style={{marginTop: '4rem'}} >
                <Col xs={{ span: 24, order: 5 }} md={{ span: 12, order: 5 }}>
                    <Title level={2}>FAQ</Title>
                    <Collapse  accordion
                               bordered={false}
                               expandIconPosition="right"
                               style={{ backgroundColor: 'transparent' }}
                    >
                        <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit?" key="1">
                            <Paragraph>Answer to the first FAQ question goes here.</Paragraph>
                        </Panel>
                        <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit?" key="2">
                            <Paragraph>Answer to the second FAQ question goes here.</Paragraph>
                        </Panel>
                        <Panel header="Lorem ipsum dolor sit amet, consectetur adipiscing elit?" key="3">
                            <Paragraph>Answer to the third FAQ question goes here.</Paragraph>
                        </Panel>
                    </Collapse>
                </Col>
                <Col xs={{ span: 24, order: 6 }} md={{ span: 12, order: 6 }}>
                    <div style={{display: 'flex' ,justifyContent: 'center' ,marginTop: screens.md ? '-40px' : '1.5rem'}}>
                        <div style={{border: '8px solid #0038A8' ,padding: '8px' ,maxWidth: '400px'}}>
                            <img
                                src={image3}
                                alt="Bottom Image"
                                style={{width: '100%' ,display: 'block'}}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

        </div>
    );
};

export default MainSection;
