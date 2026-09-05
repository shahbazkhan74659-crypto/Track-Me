import CalendarCard from "@/components/CalendarCard";
import ProfileBadge from "@/components/ProfileBadge";
import SalarySetupControl from "@/components/SalarySetupControl";
import StatCards from "@/components/StatCards";
import { colors } from "@/lib/theme";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: colors.pageBackground,
        color: colors.text,
        padding: "40px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <ProfileBadge />
          <SalarySetupControl />
        </div>
        <StatCards />
        <CalendarCard />
      </div>
    </div>
  );
}
