import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import SettingsContent from "../../components/settings/SettingsContent";
import "../../styles/SettingsPage.css";

const RecruiterSettingsPage = () => {
  return (
    <div className="recruiter-scanner-layout">
      <RecruiterSidebar />
      <main className="recruiter-settings-main">
        <RecruiterTopBar />
        <SettingsContent
          title="Settings"
          subtitle="Update your password and manage your account access."
        />
      </main>
    </div>
  );
};

export default RecruiterSettingsPage;
