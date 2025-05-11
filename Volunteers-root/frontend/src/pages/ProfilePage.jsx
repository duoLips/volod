import { useState } from 'react';
import ProfileSidebar from '../components/ProfileSidebar';
import UpdateProfileForm from "../components/settings/UpdateProfileForm.jsx";
import AvatarUploader from "../components/settings/AvatarUploader.jsx"
import ResetPassword from '../components/settings/ResetPassword.jsx'
import {Divider} from "antd";
import ChangeEmail from "../components/settings/ChangeEmail.jsx";
export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('auctions');

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return (
                    <>
                        <h2>Налаштування аватару</h2>
                        <AvatarUploader/>
                        <Divider/>
                        <h2>Зміна паролю</h2>
                        <ResetPassword/>
                        <Divider/>
                        <h2>Зміна електоронної пошти</h2>
                        <ChangeEmail/>
                        <Divider/>
                        <h2>Налаштування профілю</h2>
                        <UpdateProfileForm/>

                    </>
                );
            case 'auctions':
                return <h2>Aукціони</h2>;
            case 'comments':
                return <h2>Коментарі</h2>;
            case 'stats':
                return <h2>Статистика</h2>;
            default:
                return null;
        }
    };

    return (
        <div style={{ display: 'flex', maxWidth: 1200, margin: '2rem auto', gap: 40 }}>
            <ProfileSidebar selectedKey={activeTab} onSelect={setActiveTab} />
            <div style={{ flex: 1 }}>
                {renderContent()}
            </div>
        </div>
    );
}
