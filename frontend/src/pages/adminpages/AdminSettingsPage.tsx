import AdminSidebar from "../../components/admincomponents/AdminSidebar";
import AdminTopBar from "../../components/admincomponents/AdminTopBar";
import SettingsContent from "../../components/settings/SettingsContent";
import "../../styles/SettingsPage.css";

const AdminSettingsPage = () => {
  return (
    <div className="admin-assessments-layout">
      <AdminSidebar />
      <main className="admin-settings-main">
        <AdminTopBar />
        <SettingsContent
          title="Admin Settings"
          subtitle="Update your password and manage your account access."
        />
      </main>
    </div>
  );
};

export default AdminSettingsPage;
