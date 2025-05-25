import { Grid } from 'antd';
import ProfileSidebar from '../components/ProfileSidebar';
import UpdateProfileForm from "../components/settings/UpdateProfileForm.jsx";
import AvatarUploader from "../components/settings/AvatarUploader.jsx";
import ResetPassword from '../components/settings/ResetPassword.jsx';
import ChangeEmail from "../components/settings/ChangeEmail.jsx";
import ProfileComments from "../components/settings/ProfileComments.jsx";
import AdminPanel from "../components/admin/AdminPanel.jsx";
import { Divider } from 'antd';
import {useState} from "react";

const { useBreakpoint } = Grid;

export default function ProfilePage() {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [activeTab, setActiveTab] = useState('settings');

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return (
                    <>
                        <h2>Налаштування аватару</h2>
                        <AvatarUploader />
                        <Divider />
                        <h2>Зміна паролю</h2>
                        <ResetPassword />
                        <Divider />
                        <h2>Зміна електоронної пошти</h2>
                        <ChangeEmail />
                        <Divider />
                        <h2>Налаштування профілю</h2>
                        <UpdateProfileForm />
                    </>
                );
            case 'comments':
                return <ProfileComments />;
            case 'admin':
                return (
                    <>
                        <h2>Адмін-панель</h2>
                        <AdminPanel />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                maxWidth: 1200,
                width: '100%',
                margin: '2rem auto',
                padding: '0 1rem',
                gap: 40,
            }}
        >
            <ProfileSidebar selectedKey={activeTab} onSelect={setActiveTab} isMobile={isMobile} />
            <div style={{ flex: 1, minWidth: 0 }}>{renderContent()}</div>
        </div>
    );
}
